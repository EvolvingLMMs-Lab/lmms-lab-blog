function readPositiveDimension(value: number | string | null): number | null {
  const dimension = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : null;
}

/**
 * Prefer the dimensions decoded from video metadata, then fall back to an
 * explicitly authored width and height while metadata is still loading.
 */
export function getVideoAspectRatio(video: HTMLVideoElement): string | null {
  const intrinsicWidth = readPositiveDimension(video.videoWidth);
  const intrinsicHeight = readPositiveDimension(video.videoHeight);

  if (intrinsicWidth !== null && intrinsicHeight !== null) {
    return `${intrinsicWidth} / ${intrinsicHeight}`;
  }

  const authoredWidth = readPositiveDimension(video.getAttribute('width'));
  const authoredHeight = readPositiveDimension(video.getAttribute('height'));

  return authoredWidth !== null && authoredHeight !== null
    ? `${authoredWidth} / ${authoredHeight}`
    : null;
}
