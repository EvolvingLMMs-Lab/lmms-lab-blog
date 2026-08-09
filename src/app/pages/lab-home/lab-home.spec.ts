import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HERO_PHRASE_INTERVAL_MS, LabHomeComponent } from './lab-home';

describe('LabHomeComponent legacy headline timing', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [LabHomeComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(LabHomeComponent, { set: { template: '' } })
      .compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('changes phrases every 9.6 seconds and clears its interval on destroy', () => {
    const fixture = TestBed.createComponent(LabHomeComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.phraseIndex()).toBe(0);

    vi.advanceTimersByTime(HERO_PHRASE_INTERVAL_MS - 1);
    expect(fixture.componentInstance.phraseIndex()).toBe(0);
    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance.phraseIndex()).toBe(1);
    vi.advanceTimersByTime(HERO_PHRASE_INTERVAL_MS * 2);
    expect(fixture.componentInstance.phraseIndex()).toBe(0);

    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
