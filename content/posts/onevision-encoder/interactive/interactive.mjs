const STEP_INTERVAL_MS = 3600;

const STEPS = [
  {
    codecTitle: 'Reference anchor',
    codecDetail: 'Dense spatial context at t=1',
    codecRange: 't = 1',
    samplingTitle: '8-frame sampling',
    samplingDetail: 'One dense frame at a fixed interval',
    samplingRange: '8 frames',
    status: 'Comparing the reference token block.',
  },
  {
    codecTitle: 'Early motion residuals',
    codecDetail: 'Motion-bearing patches gathered across time',
    codecRange: 't = 2–21',
    samplingTitle: '16-frame sampling',
    samplingDetail: 'Another complete frame, including static regions',
    samplingRange: '16 frames',
    status: 'Codec tokens follow early motion instead of another dense frame.',
  },
  {
    codecTitle: 'Mid-sequence changes',
    codecDetail: 'High-surprise regions keep their spatial evidence',
    codecRange: 't = 22–42',
    samplingTitle: '32-frame sampling',
    samplingDetail: 'Dense compute is spent uniformly across the image',
    samplingRange: '32 frames',
    status: 'The same token block now covers changes from the middle of the clip.',
  },
  {
    codecTitle: 'Long-range motion',
    codecDetail: 'Late events remain represented within the budget',
    codecRange: 't = 43–64',
    samplingTitle: '64-frame sampling',
    samplingDetail: 'Temporal reach grows only by adding dense samples',
    samplingRange: '64 frames',
    status: 'Codec selection reaches the final frames without a larger patch budget.',
  },
];

function requireElement(root, selector) {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`OneVision patch explorer is missing ${selector}`);
  }
  return element;
}

function makePatchGrid(folder, step) {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const image = new Image();
      image.src = new URL(`./${folder}/${step}_${row}_${column}.jpg`, import.meta.url).href;
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      fragment.append(image);
    }
  }

  return fragment;
}

export function mount(root) {
  const codecGrid = requireElement(root, '[data-ov-grid="codec"]');
  const samplingGrid = requireElement(root, '[data-ov-grid="sampling"]');
  const codecTitle = requireElement(root, '[data-ov-codec-title]');
  const codecDetail = requireElement(root, '[data-ov-codec-detail]');
  const codecRange = requireElement(root, '[data-ov-codec-range]');
  const samplingTitle = requireElement(root, '[data-ov-sampling-title]');
  const samplingDetail = requireElement(root, '[data-ov-sampling-detail]');
  const samplingRange = requireElement(root, '[data-ov-sampling-range]');
  const status = requireElement(root, '[data-ov-status]');
  const playButton = requireElement(root, '[data-ov-action="play"]');
  const playIcon = requireElement(root, '[data-ov-play-icon]');
  const playLabel = requireElement(root, '[data-ov-play-label]');
  const previousButton = requireElement(root, '[data-ov-action="previous"]');
  const stepButtons = Array.from(root.querySelectorAll('[data-ov-step]'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentStep = 0;
  let playing = !reducedMotion;
  let visible = true;
  let timer = null;

  const clearTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const updatePlayButton = () => {
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
    playIcon.classList.toggle('ph-pause', playing);
    playIcon.classList.toggle('ph-play', !playing);
    playLabel.textContent = playing ? 'Pause' : 'Play';
  };

  const scheduleNextStep = () => {
    clearTimer();
    if (!playing || !visible || document.hidden) {
      return;
    }
    timer = window.setTimeout(() => {
      renderStep((currentStep + 1) % STEPS.length);
    }, STEP_INTERVAL_MS);
  };

  const renderStep = step => {
    currentStep = step;
    const copy = STEPS[step];

    codecGrid.setAttribute('aria-busy', 'true');
    samplingGrid.setAttribute('aria-busy', 'true');
    codecGrid.replaceChildren(makePatchGrid('patches-codec', step));
    samplingGrid.replaceChildren(makePatchGrid('patches', step));

    codecTitle.textContent = copy.codecTitle;
    codecDetail.textContent = copy.codecDetail;
    codecRange.textContent = copy.codecRange;
    samplingTitle.textContent = copy.samplingTitle;
    samplingDetail.textContent = copy.samplingDetail;
    samplingRange.textContent = copy.samplingRange;
    status.textContent = copy.status;

    for (const button of stepButtons) {
      const selected = Number(button.getAttribute('data-ov-step')) === step;
      button.setAttribute('aria-pressed', String(selected));
    }

    window.requestAnimationFrame(() => {
      codecGrid.setAttribute('aria-busy', 'false');
      samplingGrid.setAttribute('aria-busy', 'false');
    });
    scheduleNextStep();
  };

  const handleStepClick = event => {
    const step = Number(event.currentTarget.getAttribute('data-ov-step'));
    if (Number.isInteger(step) && step >= 0 && step < STEPS.length) {
      renderStep(step);
    }
  };

  const handlePrevious = () => {
    renderStep((currentStep - 1 + STEPS.length) % STEPS.length);
  };

  const handlePlay = () => {
    playing = !playing;
    updatePlayButton();
    scheduleNextStep();
  };

  const handleVisibilityChange = () => scheduleNextStep();

  for (const button of stepButtons) {
    button.addEventListener('click', handleStepClick);
  }
  previousButton.addEventListener('click', handlePrevious);
  playButton.addEventListener('click', handlePlay);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          visible = entries[0]?.isIntersecting ?? true;
          scheduleNextStep();
        }, { threshold: 0.08 })
      : null;
  observer?.observe(root);

  updatePlayButton();
  renderStep(0);

  return () => {
    clearTimer();
    observer?.disconnect();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    previousButton.removeEventListener('click', handlePrevious);
    playButton.removeEventListener('click', handlePlay);
    for (const button of stepButtons) {
      button.removeEventListener('click', handleStepClick);
    }
  };
}
