import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { ToolbarComponent } from './toolbar';

describe('ToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('keeps page-specific actions in the compact mobile toolbar', () => {
    const toolbarExtension = TestBed.inject(ToolbarExtensionService);
    const action = vi.fn();
    toolbarExtension.leadingButtons.set([
      {
        icon: 'ph-list',
        toggleIcon: 'ph-x',
        ariaLabel: 'Toggle table of contents',
        title: 'Table of Contents',
        action,
        isToggled: () => true,
        ariaControls: 'post-toc',
        isExpanded: () => true,
      },
    ]);

    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const controls = element.querySelectorAll<HTMLButtonElement>(
      'button[aria-controls="post-toc"]',
    );

    expect(controls).toHaveLength(1);
    expect(controls[0]?.closest('.toolbar-mobile')).not.toBeNull();
    expect(controls[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(controls[0]?.querySelector('i')?.classList.contains('ph-x')).toBe(true);

    controls[0]?.click();
    expect(action).toHaveBeenCalledOnce();
  });
});
