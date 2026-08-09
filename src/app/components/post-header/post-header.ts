import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PostAuthor } from '../../models/post.model';

@Component({
  selector: 'app-post-header',
  standalone: true,
  templateUrl: './post-header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './post-header.css',
})
export class PostHeaderComponent {
  title = input.required<string>();
  date = input.required<string>();
  description = input.required<string>();
  authors = input<PostAuthor[]>([]);
  tags = input<string[]>([]);
  hasMainAuthor = computed(() => this.authors().some((author) => author.main));
}
