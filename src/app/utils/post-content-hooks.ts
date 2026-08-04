import mediumZoom from 'medium-zoom';

type MathJaxApi = {
  startup?: {
    promise?: Promise<unknown>;
  };
  typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
};

const IMAGE_ZOOM_OPTIONS = {
  margin: 24,
  background: 'color-mix(in srgb, var(--ctp-crust) 86%, var(--ctp-transparent))',
};

async function waitForMathJax(timeoutMs = 10000): Promise<MathJaxApi | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const mathJax = (window as any).MathJax as MathJaxApi | undefined;
    if (mathJax?.typesetPromise) {
      return mathJax;
    }
    await new Promise<void>(resolve => window.setTimeout(resolve, 50));
  }

  return null;
}

export async function typesetMath(container?: HTMLElement): Promise<void> {
  const mathJax = await waitForMathJax();
  if (!mathJax?.typesetPromise) {
    return;
  }

  try {
    await mathJax.startup?.promise;
    await mathJax.typesetPromise(container ? [container] : undefined);
  } catch (error) {
    console.error('MathJax typeset failed', error);
  }
}

export function optimizeContentImages(): void {
  document.querySelectorAll<HTMLImageElement>('.post-body img').forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

export function initContentImageZoom(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('.post-body img'))
    .filter(img => !img.closest('app-image-lightbox'));
  const zoom = images.length ? mediumZoom(images, IMAGE_ZOOM_OPTIONS) : null;

  return () => zoom?.detach();
}

export function initAiSummaryFigures(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLButtonElement>('.ai-summary-button').forEach(button => {
    if (button.dataset['aiSummaryBound'] === 'true') {
      return;
    }

    const targetId = button.getAttribute('aria-controls');
    const figure = targetId ? document.getElementById(targetId) : null;

    if (!(figure instanceof HTMLElement)) {
      return;
    }

    const resetFigure = () => {
      button.setAttribute('aria-expanded', 'false');
      figure.classList.remove('ai-summary-figure--zoom-source');
      figure.hidden = true;
    };

    const findImage = () => figure.querySelector<HTMLImageElement>('app-image-lightbox img, img');

    const handleClick = () => {
      if (button.getAttribute('aria-expanded') === 'true') {
        return;
      }

      const image = findImage();
      if (!image) {
        return;
      }

      button.setAttribute('aria-expanded', 'true');
      figure.hidden = false;
      figure.classList.add('ai-summary-figure--zoom-source');

      const handleClosed = () => resetFigure();
      image.addEventListener('medium-zoom:closed', handleClosed, { once: true });

      window.requestAnimationFrame(() => {
        const currentImage = findImage();
        if (!currentImage) {
          image.removeEventListener('medium-zoom:closed', handleClosed);
          resetFigure();
          return;
        }

        currentImage.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }));

        window.setTimeout(() => {
          if (!document.body.classList.contains('medium-zoom--opened')) {
            currentImage.removeEventListener('medium-zoom:closed', handleClosed);
            resetFigure();
          }
        }, 250);
      });
    };

    button.dataset['aiSummaryBound'] = 'true';
    button.addEventListener('click', handleClick);
    cleanups.push(() => {
      button.removeEventListener('click', handleClick);
      delete button.dataset['aiSummaryBound'];
      resetFigure();
    });
  });

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

export function initCodeCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.code-copy').forEach(btn => {
    if (btn.dataset['copyBound'] === 'true') return;
    btn.dataset['copyBound'] = 'true';

    btn.addEventListener('click', async () => {
      const code = btn.closest('.code-block')?.querySelector('code');
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.textContent || '');
        btn.classList.add('is-copied');
        btn.textContent = 'Copied';
      } catch {
        btn.textContent = 'Copy failed';
      }

      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = 'Copy';
      }, 1800);
    });
  });
}

export function initWebEmbeds(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>('.web-embed[data-web-embed]').forEach(embed => {
    const iframe = embed.querySelector<HTMLIFrameElement>('.web-embed__frame');
    const reloadButton = embed.querySelector<HTMLButtonElement>('.web-embed__reload');
    const fullscreenButton = embed.querySelector<HTMLButtonElement>('.web-embed__fullscreen');
    const source = embed.dataset['webEmbedSource'];

    if (!iframe || !source) {
      return;
    }

    let loadingFallbackTimer: number | null = null;
    const markLoading = () => {
      embed.classList.remove('is-loaded');
      if (loadingFallbackTimer !== null) {
        window.clearTimeout(loadingFallbackTimer);
      }
      loadingFallbackTimer = window.setTimeout(() => markLoaded(), 15000);
    };
    const markLoaded = () => {
      embed.classList.add('is-loaded');
      if (loadingFallbackTimer !== null) {
        window.clearTimeout(loadingFallbackTimer);
        loadingFallbackTimer = null;
      }
    };
    const handleReload = () => {
      markLoading();
      iframe.src = source;
    };
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === embed;
      const icon = fullscreenButton?.querySelector('i');
      fullscreenButton?.setAttribute(
        'aria-label',
        isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen',
      );
      if (fullscreenButton) {
        fullscreenButton.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
      }
      icon?.classList.toggle('ph-corners-out', !isFullscreen);
      icon?.classList.toggle('ph-corners-in', isFullscreen);
    };
    const handleFullscreen = async () => {
      try {
        if (document.fullscreenElement === embed) {
          await document.exitFullscreen();
          return;
        }
        await embed.requestFullscreen();
      } catch {
        // Fullscreen can be denied by the browser or an embedding context.
      }
    };

    markLoading();
    iframe.addEventListener('load', markLoaded);
    reloadButton?.addEventListener('click', handleReload);

    if (typeof embed.requestFullscreen === 'function') {
      fullscreenButton?.addEventListener('click', handleFullscreen);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    } else if (fullscreenButton) {
      fullscreenButton.hidden = true;
    }

    embed.classList.add('is-hydrated');
    cleanups.push(() => {
      iframe.removeEventListener('load', markLoaded);
      reloadButton?.removeEventListener('click', handleReload);
      fullscreenButton?.removeEventListener('click', handleFullscreen);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (loadingFallbackTimer !== null) {
        window.clearTimeout(loadingFallbackTimer);
      }
      embed.classList.remove('is-hydrated', 'is-loaded');
    });
  });

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}
