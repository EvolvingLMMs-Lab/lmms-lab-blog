import { afterEach, describe, expect, it, vi } from 'vitest';

type TestMathJaxWindow = Window & {
  MathJax?: {
    typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
    typesetClear?: (elements?: HTMLElement[]) => void;
    tex?: unknown;
    startup?: {
      typeset?: boolean;
      promise?: Promise<unknown>;
    };
  };
};

describe('typesetMath', () => {
  afterEach(() => {
    document.head.querySelector('#mathjax-script')?.remove();
    document.body.replaceChildren();
    delete (window as TestMathJaxWindow).MathJax;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('does not load MathJax for an article without mathematics', async () => {
    const { typesetMath } = await import('./mathjax');
    const article = document.createElement('article');
    article.textContent = 'An article without equations.';
    document.body.appendChild(article);

    const cleanup = await typesetMath(article);

    expect(document.head.querySelector('#mathjax-script')).toBeNull();
    cleanup();
  });

  it('loads MathJax once, scopes typesetting, and clears removed content', async () => {
    const { typesetMath } = await import('./mathjax');
    const article = document.createElement('article');
    article.innerHTML = '<span class="math-inline">\\(x + y\\)</span>';
    document.body.appendChild(article);

    const typesetPromise = vi.fn().mockResolvedValue(undefined);
    const typesetClear = vi.fn();
    const cleanupPromise = typesetMath(article);
    const script = document.head.querySelector<HTMLScriptElement>('#mathjax-script');

    expect(script?.src).toBe('https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-chtml.js');
    expect((window as TestMathJaxWindow).MathJax?.startup).toEqual({ typeset: false });

    (window as TestMathJaxWindow).MathJax = { typesetPromise, typesetClear };
    script?.dispatchEvent(new Event('load'));

    const cleanup = await cleanupPromise;
    expect(typesetPromise).toHaveBeenCalledOnce();
    expect(typesetPromise).toHaveBeenCalledWith([article]);

    cleanup();
    cleanup();
    expect(typesetClear).toHaveBeenCalledOnce();
    expect(typesetClear).toHaveBeenCalledWith([article]);
  });

  it('skips queued typesetting when the article is disposed while MathJax loads', async () => {
    const { typesetMath } = await import('./mathjax');
    const article = document.createElement('article');
    article.innerHTML = '<span class="math-inline">\\(x + y\\)</span>';
    document.body.appendChild(article);

    const controller = new AbortController();
    const typesetPromise = vi.fn().mockResolvedValue(undefined);
    const cleanupPromise = typesetMath(article, controller.signal);
    const script = document.head.querySelector<HTMLScriptElement>('#mathjax-script');

    controller.abort();
    (window as TestMathJaxWindow).MathJax = { typesetPromise };
    script?.dispatchEvent(new Event('load'));

    const cleanup = await cleanupPromise;
    expect(typesetPromise).not.toHaveBeenCalled();
    cleanup();
  });

  it('waits for MathJax startup when the load event fires before the API is ready', async () => {
    const { typesetMath } = await import('./mathjax');
    const article = document.createElement('article');
    article.innerHTML = '<span class="math-inline">\\(x + y\\)</span>';
    document.body.appendChild(article);

    let finishStartup: (() => void) | undefined;
    const startupPromise = new Promise<void>((resolve) => {
      finishStartup = resolve;
    });
    const typesetPromise = vi.fn().mockResolvedValue(undefined);
    const cleanupPromise = typesetMath(article);
    const script = document.head.querySelector<HTMLScriptElement>('#mathjax-script');

    (window as TestMathJaxWindow).MathJax = { startup: { promise: startupPromise } };
    script?.dispatchEvent(new Event('load'));
    (window as TestMathJaxWindow).MathJax = { typesetPromise };
    finishStartup?.();

    const cleanup = await cleanupPromise;
    expect(typesetPromise).toHaveBeenCalledWith([article]);
    cleanup();
  });
});
