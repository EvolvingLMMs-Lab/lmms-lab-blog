import { Component, HostListener, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { SearchModalComponent } from '../search-modal/search-modal';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [SearchModalComponent, RouterLink],
  templateUrl: './toolbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './toolbar.css',
})
export class ToolbarComponent {
  toolbarExt = inject(ToolbarExtensionService);
  searchOpen = signal(false);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchOpen.update((value) => !value);
    }
  }

  print() {
    window.print();
  }
}
