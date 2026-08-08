import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BLOG_DESCRIPTION } from '../../config/site';
import { POSTS } from '../../data/posts';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.css',
})
export class HomeComponent {
  posts = POSTS;

  constructor() {
    inject(SeoService).setPage({
      title: 'Research journal',
      description: BLOG_DESCRIPTION,
      path: '/blog',
    });
  }
}
