import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LEGACY_NOTE_ROUTES,
  LEGACY_POST_ROUTES,
  LegacyArticleRoute,
  legacyArticlePath,
} from '../../config/legacy-routes';
import { POSTS } from '../../data/posts';
import { Post } from '../../models/post.model';
import { SeoService } from '../../services/seo.service';

type ArchiveKind = 'posts' | 'notes';

interface ArchiveEntry {
  route: LegacyArticleRoute;
  post: Post;
  href: string;
}

const POSTS_BY_SLUG = new Map(POSTS.map((post) => [post.slug, post]));
const PAGE_SIZE = 10;

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './archive.html',
  styleUrl: './archive.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveComponent {
  private readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as ArchiveKind;
  readonly currentPage = signal(1);
  readonly pageTitle = this.kind === 'posts' ? 'Posts' : 'Notes';
  readonly label = this.kind === 'posts' ? 'Archive' : 'Field Notes';
  readonly systemPath =
    this.kind === 'posts' ? 'SYS://research/publications - index' : 'SYS://research/notes - log';
  readonly entries = this.buildEntries();
  readonly totalPages = Math.max(1, Math.ceil(this.entries.length / PAGE_SIZE));
  readonly visibleEntries = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.entries.slice(start, start + PAGE_SIZE);
  });
  readonly pageNumbers = Array.from({ length: this.totalPages }, (_, index) => index + 1);

  constructor() {
    inject(SeoService).setPage({
      title: this.pageTitle,
      description:
        this.kind === 'posts'
          ? 'Blog posts from the LMMs-Lab research team.'
          : 'Quick notes and thoughts from LMMs-Lab.',
      path: `/${this.kind}`,
    });
  }

  goToPage(page: number): void {
    const nextPage = Math.min(this.totalPages, Math.max(1, page));
    this.currentPage.set(nextPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(date: string): string {
    return date.replaceAll('-', '.');
  }

  entryNumber(index: number): string {
    const absoluteIndex = (this.currentPage() - 1) * PAGE_SIZE + index + 1;
    return absoluteIndex.toString().padStart(2, '0');
  }

  private buildEntries(): ArchiveEntry[] {
    const routes = this.kind === 'posts' ? LEGACY_POST_ROUTES : LEGACY_NOTE_ROUTES;
    return routes
      .map((route) => {
        const post = POSTS_BY_SLUG.get(route.blogSlug);
        return post
          ? {
              route,
              post,
              href: legacyArticlePath(route.blogSlug, this.kind),
            }
          : undefined;
      })
      .filter((entry): entry is ArchiveEntry => entry !== undefined)
      .sort((left, right) => {
        const byDate = right.post.date.localeCompare(left.post.date);
        return byDate || routes.indexOf(left.route) - routes.indexOf(right.route);
      });
  }
}
