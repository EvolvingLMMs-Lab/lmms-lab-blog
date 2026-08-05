import type { MediaPlayerElement } from 'vidstack/elements';
import { isHLSProvider, type MediaProviderChangeEvent } from 'vidstack';
import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';

const PLAYER_CLASS = 'blog-video-player';

function copyAttribute(source: HTMLElement, target: HTMLElement, name: string): void {
  const value = source.getAttribute(name);
  if (value !== null) {
    target.setAttribute(name, value);
  }
}

function copyBooleanAttribute(source: HTMLElement, target: HTMLElement, name: string): void {
  if (source.hasAttribute(name)) {
    target.setAttribute(name, '');
  }
}

function getAspectRatio(video: HTMLVideoElement): string {
  const width = video.videoWidth || Number(video.getAttribute('width'));
  const height = video.videoHeight || Number(video.getAttribute('height'));
  return width > 0 && height > 0 ? `${width}/${height}` : '16/9';
}

function appendMediaSources(video: HTMLVideoElement, outlet: HTMLElement): void {
  for (const child of video.querySelectorAll('source, track')) {
    outlet.append(child.cloneNode(true));
  }
}

function useLocalHlsLibrary(event: MediaProviderChangeEvent): void {
  if (isHLSProvider(event.detail)) {
    event.detail.library = () => import('hls.js');
  }
}

export function mountContentVideoPlayer(video: HTMLVideoElement): () => void {
  if (!video.parentNode) {
    return () => {};
  }

  const player = document.createElement('media-player') as MediaPlayerElement;
  const provider = document.createElement('media-provider');
  const layout = document.createElement('media-video-layout');
  const label = video.getAttribute('aria-label') ?? video.getAttribute('title') ?? 'Article video';
  const posterUrl = video.getAttribute('poster');

  player.className = PLAYER_CLASS;
  player.dataset['videoPlayerState'] = 'ready';
  player.setAttribute('title', label);
  player.setAttribute('aria-label', label);
  player.setAttribute('view-type', 'video');
  player.setAttribute('stream-type', 'on-demand');
  player.setAttribute('load', 'visible');
  player.style.aspectRatio = getAspectRatio(video);
  player.addEventListener('provider-change', useLocalHlsLibrary);

  copyAttribute(video, player, 'src');
  copyAttribute(video, player, 'poster');
  copyAttribute(video, player, 'preload');
  copyAttribute(video, player, 'crossorigin');
  copyBooleanAttribute(video, player, 'autoplay');
  copyBooleanAttribute(video, player, 'loop');
  copyBooleanAttribute(video, player, 'muted');
  copyBooleanAttribute(video, player, 'playsinline');
  player.autoPlay = video.autoplay;
  player.loop = video.loop;
  const muted = video.muted || video.defaultMuted || video.hasAttribute('muted');
  player.playsInline = video.playsInline || video.hasAttribute('playsinline');
  layout.colorScheme = 'dark';

  if (posterUrl) {
    const poster = document.createElement('media-poster');
    poster.classList.add('vds-poster');
    provider.append(poster);
  }
  appendMediaSources(video, provider);
  player.append(provider, layout);
  video.replaceWith(player);
  player.muted = muted;

  return () => {
    player.removeEventListener('provider-change', useLocalHlsLibrary);
    void player.pause().catch(() => {});
    if (player.parentNode) {
      player.replaceWith(video);
    }
    player.destroy();
  };
}
