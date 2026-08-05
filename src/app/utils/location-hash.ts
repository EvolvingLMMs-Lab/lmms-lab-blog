export function replaceLocationHash(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  url.hash = encodeURIComponent(id);
  window.history.replaceState(window.history.state, '', url.href);
}
