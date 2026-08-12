import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DiffusionTextComponent,
  MorphLexicon,
} from '../../components/diffusion-text/diffusion-text';
import { HackerTerminalComponent } from '../../components/hacker-terminal/hacker-terminal';
import { SITE_DESCRIPTION, SITE_NAME } from '../../config/site';
import { POSTS } from '../../data/posts';
import { SeoService } from '../../services/seo.service';

const HERO_PHRASES = [
  {
    en: 'Building',
    zh: ['构建', '建造', '筑基'],
    ja: ['構築', 'ビルド', '構成'],
  },
  {
    en: 'Feeling',
    zh: ['感受', '感知', '体悟'],
    ja: ['感じる', '感知', '知覚'],
  },
  {
    en: 'Paving',
    zh: ['铺路', '开拓', '探求'],
    ja: ['道を拓く', '開拓', '探求'],
  },
] as const;

const HERO_MORPH_LEXICON: MorphLexicon = Object.fromEntries(
  HERO_PHRASES.map((phrase) => [phrase.en, { zh: phrase.zh, ja: phrase.ja }]),
);

export const HERO_PHRASE_INTERVAL_MS = 9_600;

const PUBLICATION_IMAGES: Readonly<Record<string, string>> = {
  'onevision-encoder': '/site/home/onevision-encoder.avif',
  'llava-onevision-1-5': '/site/home/llava-onevision-1-5.avif',
  longvt: '/site/home/longvt.avif',
  openmmreasoner: '/site/home/openmmreasoner.avif',
};

@Component({
  selector: 'app-lab-home',
  standalone: true,
  imports: [RouterLink, DiffusionTextComponent, HackerTerminalComponent],
  templateUrl: './lab-home.html',
  styleUrl: './lab-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabHomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly phraseIndex = signal(0);
  readonly phrases = HERO_PHRASES;
  readonly morphLexicon = HERO_MORPH_LEXICON;
  readonly featured = POSTS.find((post) => post.slug === 'llava-onevision-2');
  readonly publications = ['onevision-encoder', 'llava-onevision-1-5', 'longvt', 'openmmreasoner']
    .map((slug) => POSTS.find((post) => post.slug === slug))
    .filter((post) => post !== undefined)
    .map((post) => ({ ...post, image: PUBLICATION_IMAGES[post.slug] }));
  readonly featuredTitleParts = this.featured?.title.split(': ') ?? [];

  constructor() {
    inject(SeoService).setPage({ title: SITE_NAME, description: SITE_DESCRIPTION, path: '/' });

    afterNextRender(() => {
      const interval = window.setInterval(
        () => this.phraseIndex.update((index) => (index + 1) % HERO_PHRASES.length),
        HERO_PHRASE_INTERVAL_MS,
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

  postHref(slug: string): string {
    return `/blog/${encodeURIComponent(slug)}`;
  }
}
