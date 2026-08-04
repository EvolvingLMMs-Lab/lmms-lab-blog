const GRID_SIZE = 8;
const CODEC_FRAME_COUNT = 64;
const ANIMATED_CODEC_FRAMES = 3;
const ANIMATION_INTERVAL_MS = 2000;
const UNIFORM_FRAME_COUNTS = [8, 16, 32, 64];

function requireElement(root, selector) {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`OneVision patch map is missing ${selector}`);
  }
  return element;
}

function patchUrl(folder, group, row, column) {
  return new URL(`./${folder}/${group}_${row}_${column}.jpg`, import.meta.url).href;
}

function createPatchImage(folder, group, row, column) {
  const image = new Image();
  image.src = patchUrl(folder, group, row, column);
  image.alt = '';
  image.decoding = 'async';
  image.loading = 'lazy';
  image.draggable = false;
  return image;
}

function createFrame() {
  const frame = document.createElement('div');
  frame.className = 'ov-native__frame';

  const grid = document.createElement('div');
  grid.className = 'ov-native__grid';
  const cells = [];

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement('div');
    cell.className = 'ov-native__cell';
    cell.dataset.hasPatch = 'false';
    grid.append(cell);
    cells.push(cell);
  }

  const label = document.createElement('div');
  label.className = 'ov-native__frame-label';
  const title = document.createElement('span');
  const detail = document.createElement('small');
  label.append(title, detail);
  frame.append(grid, label);

  return { frame, cells, title, detail };
}

function setFrameLabel(frame, title, detail) {
  frame.title.textContent = title;
  frame.detail.textContent = detail;
}

function clearCell(cell) {
  cell.replaceChildren();
  cell.dataset.hasPatch = 'false';
  delete cell.dataset.tooltip;
  cell.removeAttribute('title');
}

function fillCell(cell, image, tooltip) {
  cell.replaceChildren(image);
  cell.dataset.hasPatch = 'true';
  cell.dataset.tooltip = tooltip;
  cell.title = tooltip;
}

function createUniformFrames(stage) {
  const fragment = document.createDocumentFragment();

  for (let group = 0; group < UNIFORM_FRAME_COUNTS.length; group += 1) {
    const frame = createFrame();
    setFrameLabel(frame, `Frame ${group + 1}`, `${UNIFORM_FRAME_COUNTS[group]} frames sampled`);

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        const index = row * GRID_SIZE + column;
        const tooltip = `Uniform sample ${group + 1} · h=${row}, w=${column}`;
        fillCell(
          frame.cells[index],
          createPatchImage('patches', group, row, column),
          tooltip,
        );
      }
    }

    fragment.append(frame.frame);
  }

  stage.replaceChildren(fragment);
}

async function loadCodecRecords() {
  const manifestUrl = new URL('./codec-positions.json', import.meta.url);
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Could not load codec patch positions (${response.status})`);
  }

  const positions = await response.json();
  if (!Array.isArray(positions) || positions.length !== 256) {
    throw new Error('Codec patch position manifest must contain 256 entries');
  }

  return positions.map((position, index) => {
    if (
      !Array.isArray(position) ||
      position.length !== 3 ||
      !position.every(Number.isInteger)
    ) {
      throw new Error(`Invalid codec patch position at index ${index}`);
    }

    const group = Math.floor(index / 64);
    const displayIndex = index % 64;
    const displayRow = Math.floor(displayIndex / GRID_SIZE);
    const displayColumn = displayIndex % GRID_SIZE;
    const [time, row, column] = position;

    return {
      time,
      row,
      column,
      image: createPatchImage('patches-codec', group, displayRow, displayColumn),
    };
  });
}

function groupRecordsByTime(records) {
  const recordsByTime = new Map();
  for (const record of records) {
    const group = recordsByTime.get(record.time) ?? [];
    group.push(record);
    recordsByTime.set(record.time, group);
  }
  return recordsByTime;
}

function renderCodecFrame(frame, time, records) {
  for (const cell of frame.cells) {
    clearCell(cell);
  }

  for (const record of records) {
    const cell = frame.cells[record.row * GRID_SIZE + record.column];
    if (!cell) {
      continue;
    }
    const tooltip = `Codec patch · t=${record.time + 1}, h=${record.row}, w=${record.column}`;
    fillCell(cell, record.image, tooltip);
  }

  setFrameLabel(
    frame,
    `t = ${time + 1}`,
    time === 0 ? 'reference · 64 patches' : `${records.length} retained`,
  );
}

function createCodecFrames(stage, recordsByTime) {
  const frames = [];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < ANIMATED_CODEC_FRAMES + 1; index += 1) {
    const frame = createFrame();
    frames.push(frame);
    fragment.append(frame.frame);
  }

  stage.replaceChildren(fragment);
  renderCodecFrame(frames[0], 0, recordsByTime.get(0) ?? []);
  return frames;
}

function nextCodecTime(time, offset = 0) {
  return ((time + offset - 1) % (CODEC_FRAME_COUNT - 1)) + 1;
}

export async function mount(root) {
  const codecStage = requireElement(root, '[data-ov-stage="codec"]');
  const uniformStage = requireElement(root, '[data-ov-stage="uniform"]');
  const playButton = requireElement(root, '[data-ov-action="play"]');
  const playIcon = requireElement(root, '[data-ov-play-icon]');
  const playLabel = requireElement(root, '[data-ov-play-label]');
  const status = requireElement(root, '[data-ov-status]');
  const tooltip = requireElement(root, '[data-ov-tooltip]');

  const records = await loadCodecRecords();
  const recordsByTime = groupRecordsByTime(records);
  const codecFrames = createCodecFrames(codecStage, recordsByTime);
  createUniformFrames(uniformStage);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let baseTime = 1;
  let playing = !reducedMotion;
  let hoveringCodec = false;
  let visible = true;
  let timer = null;
  let activeTooltipCell = null;

  const clearTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const renderCodecWindow = () => {
    const shownTimes = [];
    for (let index = 0; index < ANIMATED_CODEC_FRAMES; index += 1) {
      const time = nextCodecTime(baseTime, index);
      shownTimes.push(time + 1);
      renderCodecFrame(codecFrames[index + 1], time, recordsByTime.get(time) ?? []);
    }
    status.textContent = `Codec window: t = ${shownTimes.join(', ')}`;
  };

  const scheduleAnimation = () => {
    clearTimer();
    if (!playing || hoveringCodec || !visible || document.hidden) {
      return;
    }
    timer = window.setTimeout(() => {
      baseTime = nextCodecTime(baseTime, ANIMATED_CODEC_FRAMES);
      renderCodecWindow();
      scheduleAnimation();
    }, ANIMATION_INTERVAL_MS);
  };

  const updatePlayButton = () => {
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.setAttribute('aria-label', playing ? 'Pause codec animation' : 'Play codec animation');
    playIcon.classList.toggle('ph-pause', playing);
    playIcon.classList.toggle('ph-play', !playing);
    playLabel.textContent = playing ? 'Pause' : 'Play';
  };

  const handlePlay = () => {
    playing = !playing;
    updatePlayButton();
    scheduleAnimation();
  };

  const handleCodecEnter = () => {
    hoveringCodec = true;
    clearTimer();
  };

  const handleCodecLeave = () => {
    hoveringCodec = false;
    tooltip.hidden = true;
    activeTooltipCell = null;
    scheduleAnimation();
  };

  const positionTooltip = event => {
    const rootRect = root.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, event.clientX - rootRect.left + 12),
      root.clientWidth - tooltipRect.width - 8,
    );
    const top = Math.min(
      Math.max(8, event.clientY - rootRect.top + 12),
      root.clientHeight - tooltipRect.height - 8,
    );
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const handlePointerOver = event => {
    const cell = event.target.closest?.('.ov-native__cell[data-has-patch="true"]');
    if (!(cell instanceof HTMLElement) || cell === activeTooltipCell) {
      return;
    }
    activeTooltipCell = cell;
    tooltip.textContent = cell.dataset.tooltip ?? '';
    tooltip.hidden = false;
    positionTooltip(event);
  };

  const handlePointerMove = event => {
    if (activeTooltipCell) {
      positionTooltip(event);
    }
  };

  const handlePointerOut = event => {
    if (!activeTooltipCell || activeTooltipCell.contains(event.relatedTarget)) {
      return;
    }
    activeTooltipCell = null;
    tooltip.hidden = true;
  };

  const handleVisibilityChange = () => scheduleAnimation();

  playButton.addEventListener('click', handlePlay);
  codecStage.addEventListener('pointerenter', handleCodecEnter);
  codecStage.addEventListener('pointerleave', handleCodecLeave);
  root.addEventListener('pointerover', handlePointerOver);
  root.addEventListener('pointermove', handlePointerMove);
  root.addEventListener('pointerout', handlePointerOut);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          entries => {
            visible = entries[0]?.isIntersecting ?? true;
            scheduleAnimation();
          },
          { threshold: 0.08 },
        )
      : null;
  observer?.observe(root);

  renderCodecWindow();
  updatePlayButton();
  scheduleAnimation();

  return () => {
    clearTimer();
    observer?.disconnect();
    playButton.removeEventListener('click', handlePlay);
    codecStage.removeEventListener('pointerenter', handleCodecEnter);
    codecStage.removeEventListener('pointerleave', handleCodecLeave);
    root.removeEventListener('pointerover', handlePointerOver);
    root.removeEventListener('pointermove', handlePointerMove);
    root.removeEventListener('pointerout', handlePointerOut);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
