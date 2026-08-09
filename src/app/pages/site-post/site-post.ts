import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PostComponent } from '../post/post';

@Component({
  selector: 'app-site-post',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './site-post.html',
  styleUrl: './site-post.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitePostComponent {}
