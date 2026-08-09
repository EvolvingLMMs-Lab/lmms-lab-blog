const MEDIA_ROOT =
  'https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images';
const CASE_COUNT = 7;
const CHANGE_INTERVAL_MS = 5000;

export function mount(host) {
  const video = host.querySelector('[data-pipeline-video]');
  const caption = host.querySelector('[data-pipeline-caption]');
  const dots = host.querySelector('[data-pipeline-dots]');
  const previous = host.querySelector('[data-pipeline-previous]');
  const next = host.querySelector('[data-pipeline-next]');
  if (!(video instanceof HTMLVideoElement) || !caption || !dots || !previous || !next) {
    throw new Error('OneVision pipeline fragment is incomplete');
  }

  const abortController = new AbortController();
  const { signal } = abortController;
  let activeIndex = 0;
  let timer = null;
  let transitionTimer = null;

  const renderDots = () => {
    for (const [index, dot] of Array.from(dots.children).entries()) {
      if (index === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    }
  };

  const select = index => {
    activeIndex = (index + CASE_COUNT) % CASE_COUNT;
    video.dataset.changing = 'true';
    if (transitionTimer !== null) window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      video.src = `${MEDIA_ROOT}/case${activeIndex + 1}.webm`;
      video.setAttribute(
        'aria-label',
        `OneVision Encoder video processing pipeline, case ${activeIndex + 1}`,
      );
      caption.textContent = `Case ${activeIndex + 1} of ${CASE_COUNT} · Complete video processing pipeline from the original clip to a codec-style sparse representation.`;
      video.dataset.changing = 'false';
      void video.play().catch(() => {});
      transitionTimer = null;
    }, 180);
    renderDots();
  };

  const stop = () => {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = window.setInterval(() => select(activeIndex + 1), CHANGE_INTERVAL_MS);
  };
  const selectAndRestart = index => {
    select(index);
    start();
  };

  for (let index = 0; index < CASE_COUNT; index += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show pipeline case ${index + 1}`);
    dot.title = `Case ${index + 1}`;
    dot.addEventListener('click', () => selectAndRestart(index), { signal });
    dots.append(dot);
  }
  previous.addEventListener('click', () => selectAndRestart(activeIndex - 1), { signal });
  next.addEventListener('click', () => selectAndRestart(activeIndex + 1), { signal });
  host.addEventListener('pointerenter', stop, { signal });
  host.addEventListener('pointerleave', start, { signal });
  renderDots();
  start();

  return () => {
    abortController.abort();
    stop();
    if (transitionTimer !== null) window.clearTimeout(transitionTimer);
  };
}
