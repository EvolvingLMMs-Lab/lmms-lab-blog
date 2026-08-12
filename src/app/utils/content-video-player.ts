import type { MediaPlayerElement } from 'vidstack/elements';
import { isHLSProvider, type MediaProviderChangeEvent } from 'vidstack';
import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';
import { getVideoAspectRatio } from './video-aspect-ratio';

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

function getProviderVideo(provider: MediaProviderChangeEvent['detail']): HTMLVideoElement | null {
  if (!provider || !('video' in provider)) {
    return null;
  }

  return provider.video instanceof HTMLVideoElement ? provider.video : null;
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
  let providerVideo: HTMLVideoElement | null = null;

  const syncIntrinsicAspectRatio = () => {
    if (!providerVideo) {
      return;
    }

    const aspectRatio = getVideoAspectRatio(providerVideo);
    if (aspectRatio) {
      player.style.aspectRatio = aspectRatio;
    }
  };

  const handleProviderChange = (event: MediaProviderChangeEvent) => {
    useLocalHlsLibrary(event);
    providerVideo?.removeEventListener('loadedmetadata', syncIntrinsicAspectRatio);
    providerVideo = getProviderVideo(event.detail);
    providerVideo?.addEventListener('loadedmetadata', syncIntrinsicAspectRatio);
    syncIntrinsicAspectRatio();
  };

  player.className = PLAYER_CLASS;
  player.dataset['videoPlayerState'] = 'ready';
  player.setAttribute('title', label);
  player.setAttribute('aria-label', label);
  player.setAttribute('view-type', 'video');
  player.setAttribute('stream-type', 'on-demand');
  // Metadata must load even when no provisional aspect ratio is available;
  // `preload="metadata"` still prevents eager full-media downloads.
  player.setAttribute('load', 'eager');
  player.style.aspectRatio = getVideoAspectRatio(video) ?? 'auto';
  player.addEventListener('provider-change', handleProviderChange);

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
    player.removeEventListener('provider-change', handleProviderChange);
    providerVideo?.removeEventListener('loadedmetadata', syncIntrinsicAspectRatio);
    providerVideo = null;
    void player.pause().catch(() => {});
    if (player.parentNode) {
      player.replaceWith(video);
    }
    player.destroy();
  };
}
