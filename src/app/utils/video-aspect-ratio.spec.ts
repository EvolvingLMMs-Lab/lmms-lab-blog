import { describe, expect, it } from 'vitest';
import { getVideoAspectRatio } from './video-aspect-ratio';

function videoWithIntrinsicSize(width: number, height: number): HTMLVideoElement {
  const video = document.createElement('video');
  Object.defineProperties(video, {
    videoWidth: { configurable: true, value: width },
    videoHeight: { configurable: true, value: height },
  });
  return video;
}

describe('getVideoAspectRatio', () => {
  it('uses the intrinsic dimensions reported by loaded video metadata', () => {
    const video = videoWithIntrinsicSize(7271, 1080);
    video.setAttribute('width', '1280');
    video.setAttribute('height', '720');

    expect(getVideoAspectRatio(video)).toBe('7271 / 1080');
  });

  it('uses authored dimensions only until intrinsic metadata is available', () => {
    const video = document.createElement('video');
    video.setAttribute('width', '960');
    video.setAttribute('height', '540');

    expect(getVideoAspectRatio(video)).toBe('960 / 540');
  });

  it('does not invent a global 16:9 ratio for a dimensionless video', () => {
    expect(getVideoAspectRatio(document.createElement('video'))).toBeNull();
  });
});
