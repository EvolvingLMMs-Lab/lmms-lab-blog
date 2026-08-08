import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_DESCRIPTION, SITE_NAME } from '../../config/site';
import { POSTS } from '../../data/posts';
import { SeoService } from '../../services/seo.service';

const HERO_PHRASES = ['Building', 'Feeling', 'Paving'] as const;

const PUBLICATION_IMAGES: Readonly<Record<string, string>> = {
  'onevision-encoder': '/site/home/onevision-encoder.avif',
  'llava-onevision-1-5': '/site/home/llava-onevision-1-5.avif',
  longvt: '/site/home/longvt.avif',
  openmmreasoner: '/site/home/openmmreasoner.avif',
};

@Component({
  selector: 'app-lab-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lab-home.html',
  styleUrl: './lab-home.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LabHomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly phraseIndex = signal(0);
  readonly phrases = HERO_PHRASES;
  readonly featured = POSTS.find((post) => post.slug === 'llava-onevision-2');
  readonly publications = ['onevision-encoder', 'llava-onevision-1-5', 'longvt', 'openmmreasoner']
    .map((slug) => POSTS.find((post) => post.slug === slug))
    .filter((post) => post !== undefined)
    .map((post) => ({ ...post, image: PUBLICATION_IMAGES[post.slug] }));

  constructor() {
    inject(SeoService).setPage({ title: SITE_NAME, description: SITE_DESCRIPTION, path: '/' });

    afterNextRender(() => {
      const interval = window.setInterval(
        () => this.phraseIndex.update((index) => (index + 1) % HERO_PHRASES.length),
        4800,
      );
      this.destroyRef.onDestroy(() => window.clearInterval(interval));
    });
  }

  formatDate(date: string, monthOnly = false): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      ...(monthOnly ? {} : { day: 'numeric' }),
      year: 'numeric',
      timeZone: 'UTC',
    })
      .format(new Date(`${date}T00:00:00Z`))
      .toUpperCase();
  }
}
