import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-giscus-comments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<div class="giscus"></div>',
})
export class GiscusCommentsComponent {
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
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'https://blog.lmms-lab.com/giscus.css?v=20260808');
    script.setAttribute('data-lang', 'en');
    script.crossOrigin = 'anonymous';
    script.async = true;
    container.appendChild(script);
  }
}
