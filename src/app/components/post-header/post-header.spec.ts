import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PostHeaderComponent } from './post-header';

describe('PostHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PostHeaderComponent] }).compileComponents();
  });

  it('uses the compact title scale only for extra-long research titles', () => {
    const fixture = TestBed.createComponent(PostHeaderComponent);
    fixture.componentRef.setInput('title', 'A'.repeat(85));
    fixture.componentRef.setInput('date', '2026-01-15');
    fixture.componentRef.setInput('description', 'A compact project summary.');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.title') as HTMLElement;
    expect(title.classList.contains('title-long')).toBe(true);
    expect(title.classList.contains('title-extra-long')).toBe(true);

    fixture.componentRef.setInput('title', 'A'.repeat(84));
    fixture.detectChanges();
    expect(title.classList.contains('title-long')).toBe(true);
    expect(title.classList.contains('title-extra-long')).toBe(false);
  });
});
