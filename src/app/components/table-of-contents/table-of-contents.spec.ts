import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TocItem } from '../../models/post.model';
import { TableOfContentsComponent } from './table-of-contents';

describe('TableOfContentsComponent', () => {
  const items: TocItem[] = [
    {
      id: '第一章',
      text: 'First chapter',
      level: 2,
      children: [{ id: 'details', text: 'Details', level: 3, children: [] }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableOfContentsComponent],
    }).compileComponents();
  });

  it('renders a nested navigation list with a path-safe fragment', () => {
    const fixture = TestBed.createComponent(TableOfContentsComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('postPath', '/example-post');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.toc-list > .toc-item')).toHaveLength(1);
    expect(element.querySelectorAll('.toc-sublist > .toc-subitem')).toHaveLength(1);
    expect(element.querySelector<HTMLAnchorElement>('.toc-link')?.getAttribute('href')).toBe(
      '/example-post#%E7%AC%AC%E4%B8%80%E7%AB%A0',
    );
  });

  it('provides a dedicated desktop control beside the contents panel', () => {
    const fixture = TestBed.createComponent(TableOfContentsComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('postPath', '/example-post');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.toc-toggle');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');

    toggle?.click();
    fixture.detectChanges();

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle?.querySelector('i')?.classList.contains('ph-x')).toBe(true);
  });

  it('marks controls that must clear the legacy site masthead', () => {
    const fixture = TestBed.createComponent(TableOfContentsComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('postPath', '/posts/example-post');
    fixture.componentRef.setInput('shell', 'site');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.toc-toggle')?.classList.contains('toc-site-shell')).toBe(true);
    expect(element.querySelector('.post-toc')?.classList.contains('toc-site-shell')).toBe(true);
  });

  it('marks the active child, preserves its parent context, and exposes reading progress', () => {
    const fixture = TestBed.createComponent(TableOfContentsComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('postPath', '/example-post');
    fixture.componentRef.setInput('activeHeadingId', 'details');
    fixture.componentRef.setInput('progress', 0.426);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const currentLinks = element.querySelectorAll('[aria-current="location"]');
    const progress = element.querySelector('[role="progressbar"]');

    expect(currentLinks).toHaveLength(1);
    expect(currentLinks[0]?.getAttribute('data-toc-id')).toBe('details');
    expect(element.querySelector('.toc-item')?.classList.contains('contains-active')).toBe(true);
    expect(progress?.getAttribute('aria-valuenow')).toBe('43');
  });

  it('handles plain navigation while preserving native modified clicks', () => {
    const fixture = TestBed.createComponent(TableOfContentsComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('postPath', '/example-post');
    const selected = vi.fn();
    fixture.componentInstance.headingSelected.subscribe(selected);
    fixture.detectChanges();

    const modifiedClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    fixture.componentInstance.selectHeading(modifiedClick, '第一章');

    expect(modifiedClick.defaultPrevented).toBe(false);
    expect(selected).not.toHaveBeenCalled();

    const plainClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    fixture.componentInstance.selectHeading(plainClick, '第一章');

    expect(plainClick.defaultPrevented).toBe(true);
    expect(selected).toHaveBeenCalledWith('第一章');
  });
});
