import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_NAME, SITE_ORIGIN } from '../config/site';

export interface PageMetadata {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  setPage(metadata: PageMetadata): void {
    const canonicalUrl = new URL(metadata.path, SITE_ORIGIN).toString();
    const pageTitle = metadata.title === SITE_NAME ? SITE_NAME : `${metadata.title} · ${SITE_NAME}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: metadata.description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: metadata.description });
    this.meta.updateTag({ property: 'og:type', content: metadata.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metadata.description });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }
}
