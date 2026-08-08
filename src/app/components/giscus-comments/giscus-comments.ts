import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-giscus-comments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<div class="giscus"></div>',
})
export class GiscusCommentsComponent {
  readonly term = input.required<string>();

  load(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const container = document.querySelector('.giscus');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'EvolvingLMMs-Lab/lmms-lab-blog');
    script.setAttribute('data-repo-id', 'R_kgDOTtSfxw');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOTtSfx84DCoCP');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', this.term());
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    const publicAssetOrigin =
      window.location.protocol === 'https:' ? window.location.origin : 'https://blog.lmms-lab.com';
    script.setAttribute('data-theme', `${publicAssetOrigin}/giscus.css?v=20260809`);
    script.setAttribute('data-lang', 'en');
    script.crossOrigin = 'anonymous';
    script.async = true;
    container.appendChild(script);
  }
}
