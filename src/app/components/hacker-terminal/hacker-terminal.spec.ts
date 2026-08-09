import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EFFECT_DURATION_MS,
  EFFECT_FRAME_INTERVAL_MS,
  TERMINAL_EFFECTS,
  VIDEO_DURATION_MS,
} from './hacker-terminal.animation';
import { HackerTerminalComponent } from './hacker-terminal';

describe('HackerTerminalComponent', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [HackerTerminalComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('cycles from video through every terminal effect and back to video', () => {
    const fixture = TestBed.createComponent(HackerTerminalComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.phase()).toBe('video');
    expect(fixture.componentInstance.effectIndex()).toBe(0);

    vi.advanceTimersByTime(VIDEO_DURATION_MS);
    fixture.detectChanges();
    expect(fixture.componentInstance.phase()).toBe('terminal');
    expect(fixture.componentInstance.effectIndex()).toBe(0);
    expect(fixture.componentInstance.aiFrame()).toBe(1);

    vi.advanceTimersByTime(EFFECT_DURATION_MS);
    fixture.detectChanges();
    expect(fixture.componentInstance.effectIndex()).toBe(1);

    vi.advanceTimersByTime(EFFECT_DURATION_MS * (TERMINAL_EFFECTS.length - 1));
    fixture.detectChanges();
    expect(fixture.componentInstance.phase()).toBe('video');

    vi.advanceTimersByTime(VIDEO_DURATION_MS);
    fixture.detectChanges();
    expect(fixture.componentInstance.phase()).toBe('terminal');
    expect(fixture.componentInstance.effectIndex()).toBe(0);

    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders generated terminal markup inside the full CRT layer stack', () => {
    const fixture = TestBed.createComponent(HackerTerminalComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(VIDEO_DURATION_MS + EFFECT_FRAME_INTERVAL_MS);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.terminalLayer')?.classList.contains('visible')).toBe(true);
    expect(element.querySelector('.output .dim')?.textContent).toContain(
      'Connecting to Ultra-Sparse MoE cluster',
    );
    expect(element.querySelectorAll('.scanlines, .rgbShift, .vignette, .curvature, .reflection, .noise')).toHaveLength(6);
    expect(element.querySelector<HTMLVideoElement>('video')?.preload).toBe('metadata');

    fixture.destroy();
  });
});
