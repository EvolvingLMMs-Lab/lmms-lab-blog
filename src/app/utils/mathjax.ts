const MATHJAX_SCRIPT_ID = 'mathjax-script';
const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-chtml.js';
const MATH_SELECTOR = '.math-inline, .math-display';

type MathJaxApi = {
  tex?: {
    inlineMath: string[][];
    displayMath: string[][];
  };
  startup?: {
    typeset?: boolean;
    promise?: Promise<unknown>;
  };
  typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
  typesetClear?: (elements?: HTMLElement[]) => void;
};

type MathJaxWindow = Window & { MathJax?: MathJaxApi };

let mathJaxLoader: Promise<MathJaxApi> | null = null;

function getMathJaxWindow(): MathJaxWindow {
  return window as MathJaxWindow;
}

function containsMath(container: HTMLElement): boolean {
  if (container.matches(MATH_SELECTOR) || container.querySelector(MATH_SELECTOR)) {
    return true;
  }

  // Preserve support for HTML-first posts that author MathJax delimiters directly.
  return /\\(?:\(|\[)/.test(container.textContent ?? '');
}

function loadMathJax(): Promise<MathJaxApi> {
  const mathJaxWindow = getMathJaxWindow();
  if (mathJaxWindow.MathJax?.typesetPromise) {
    return Promise.resolve(mathJaxWindow.MathJax);
  }

  if (mathJaxLoader) {
    return mathJaxLoader;
  }

  mathJaxWindow.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['\\[', '\\]']],
    },
    startup: { typeset: false },
  };

  mathJaxLoader = new Promise<MathJaxApi>((resolve, reject) => {
    const existingScript = document.getElementById(MATHJAX_SCRIPT_ID);
    const script =
      existingScript instanceof HTMLScriptElement
        ? existingScript
        : document.createElement('script');

    const removeListeners = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    const handleLoad = async () => {
      removeListeners();
      let mathJax = getMathJaxWindow().MathJax;
      if (!mathJax?.typesetPromise) {
        try {
          await mathJax?.startup?.promise;
        } catch (error) {
          script.remove();
          mathJaxLoader = null;
          delete getMathJaxWindow().MathJax;
          reject(error);
          return;
        }
        mathJax = getMathJaxWindow().MathJax;
      }

      if (!mathJax?.typesetPromise) {
        script.remove();
        mathJaxLoader = null;
        delete getMathJaxWindow().MathJax;
        reject(new Error('MathJax loaded without a typesetting API'));
        return;
      }
      resolve(mathJax);
    };

    const handleError = () => {
      removeListeners();
      script.remove();
      mathJaxLoader = null;
      delete getMathJaxWindow().MathJax;
      reject(new Error(`Unable to load MathJax from ${MATHJAX_SRC}`));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    if (!existingScript) {
      script.id = MATHJAX_SCRIPT_ID;
      script.src = MATHJAX_SRC;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      document.head.appendChild(script);
    }
  });

  return mathJaxLoader;
}

export async function typesetMath(
  container: HTMLElement,
  signal?: AbortSignal,
): Promise<() => void> {
  if (typeof window === 'undefined' || signal?.aborted || !containsMath(container)) {
    return () => {};
  }

  try {
    const mathJax = await loadMathJax();
    if (signal?.aborted || !container.isConnected) {
      return () => {};
    }

    await mathJax.typesetPromise?.([container]);
    if (signal?.aborted) {
      mathJax.typesetClear?.([container]);
      return () => {};
    }

    let cleared = false;

    return () => {
      if (!cleared) {
        mathJax.typesetClear?.([container]);
        cleared = true;
      }
    };
  } catch (error) {
    console.error('MathJax typeset failed', error);
    return () => {};
  }
}
