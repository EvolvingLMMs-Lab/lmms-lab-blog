import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { SiteHeaderComponent } from './site-header';

describe('SiteHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('exposes page-specific reading actions beside the compact navigation control', () => {
    const toolbarExtension = TestBed.inject(ToolbarExtensionService);
    const action = vi.fn();
    toolbarExtension.leadingButtons.set([
      {
        icon: 'ph-list-numbers',
        toggleIcon: 'ph-x',
        ariaLabel: 'Toggle table of contents',
        title: 'Table of Contents',
        action,
        ariaControls: 'post-toc',
        isExpanded: () => false,
      },
    ]);

    const fixture = TestBed.createComponent(SiteHeaderComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const pageAction = element.querySelector<HTMLButtonElement>(
      '.mobile-page-action[aria-controls="post-toc"]',
    );

    expect(pageAction).not.toBeNull();
    expect(pageAction?.querySelector('i')?.classList.contains('ph-list-numbers')).toBe(true);
    expect(element.querySelector('.mobile-menu-button')).not.toBeNull();
    expect(element.querySelector('.masthead-inner')?.classList.contains('has-page-actions')).toBe(
      true,
    );

    pageAction?.click();
    expect(action).toHaveBeenCalledOnce();
  });
});
