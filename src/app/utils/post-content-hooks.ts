import mediumZoom from 'medium-zoom';

type ContentVideoPlayerModule = typeof import('./content-video-player');

let contentVideoPlayerModule: Promise<ContentVideoPlayerModule> | null = null;

const IMAGE_ZOOM_OPTIONS = {
  margin: 24,
  background: 'color-mix(in srgb, var(--ctp-crust) 86%, var(--ctp-transparent))',
};

export function optimizeContentImages(): void {
  document.querySelectorAll<HTMLImageElement>('.post-body img').forEach((img) => {
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
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('.post-body img')).filter(
    (img) => !img.closest('app-image-lightbox'),
  );
  const zoom = images.length ? mediumZoom(images, IMAGE_ZOOM_OPTIONS) : null;

  return () => zoom?.detach();
}

function loadContentVideoPlayer(): Promise<ContentVideoPlayerModule> {
  if (!contentVideoPlayerModule) {
    contentVideoPlayerModule = import('./content-video-player').catch((error) => {
      contentVideoPlayerModule = null;
      throw error;
    });
  }

  return contentVideoPlayerModule;
}

export function initContentVideos(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[controls]')).filter(
    (video) => video.dataset['videoPlayerState'] === undefined && !video.closest('media-player'),
  );

  if (videos.length === 0) {
    return () => {};
  }

  let disposed = false;
  const playerCleanups: Array<() => void> = [];

  for (const video of videos) {
    video.dataset['videoPlayerState'] = 'loading';
  }

  void loadContentVideoPlayer()
    .then(({ mountContentVideoPlayer }) => {
      if (disposed) {
        return;
      }

      for (const video of videos) {
        if (!video.isConnected) {
          delete video.dataset['videoPlayerState'];
          continue;
        }

        try {
          playerCleanups.push(mountContentVideoPlayer(video));
          video.dataset['videoPlayerState'] = 'ready';
        } catch (error) {
          video.dataset['videoPlayerState'] = 'error';
          console.error('Failed to initialize content video player', error);
        }
      }
    })
    .catch((error) => {
      if (disposed) {
        return;
      }

      for (const video of videos) {
        video.dataset['videoPlayerState'] = 'error';
      }
      console.error('Failed to load content video player', error);
    });

  return () => {
    disposed = true;
    for (const cleanup of playerCleanups) {
      cleanup();
    }
    for (const video of videos) {
      delete video.dataset['videoPlayerState'];
    }
  };
}

export function initAiSummaryFigures(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLButtonElement>('.ai-summary-button').forEach((button) => {
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

        currentImage.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );

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
  document.querySelectorAll<HTMLButtonElement>('.code-copy').forEach((btn) => {
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

type BlogControllerCleanup = void | (() => void);

type BlogControllerModule = {
  mount?: (host: HTMLElement) => BlogControllerCleanup | Promise<BlogControllerCleanup>;
};

function importBlogController(source: string): Promise<BlogControllerModule> {
  return import(/* @vite-ignore */ source) as Promise<BlogControllerModule>;
}

export function initHtmlControllers(container?: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = container ?? document;
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>('[data-blog-controller]').forEach((host) => {
    const source = host.dataset['blogController'];
    if (!source || host.dataset['blogControllerBound'] === 'true') {
      return;
    }

    let disposed = false;
    let controllerCleanup: BlogControllerCleanup;
    const controllerUrl = new URL(source, document.baseURI).href;

    host.dataset['blogControllerBound'] = 'true';
    host.dataset['blogControllerState'] = 'loading';

    void importBlogController(controllerUrl)
      .then(async (module) => {
        if (typeof module.mount !== 'function') {
          throw new Error(`Blog controller ${source} does not export mount(host)`);
        }

        const cleanup = await module.mount(host);
        if (disposed) {
          cleanup?.();
          return;
        }

        controllerCleanup = cleanup;
        host.dataset['blogControllerState'] = 'ready';
      })
      .catch((error) => {
        if (disposed) {
          return;
        }
        host.dataset['blogControllerState'] = 'error';
        console.error(`Failed to initialize blog controller ${source}`, error);
      });

    cleanups.push(() => {
      disposed = true;
      controllerCleanup?.();
      delete host.dataset['blogControllerBound'];
      delete host.dataset['blogControllerState'];
    });
  });

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}
