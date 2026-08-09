import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiffusionTextComponent, MorphLexicon, renderDiffusionFrame } from './diffusion-text';

const MORPH_LEXICON: MorphLexicon = {
  Building: { zh: ['构建', '建造', '筑基'], ja: ['構築', 'ビルド', '構成'] },
  Feeling: { zh: ['感受', '感知', '体悟'], ja: ['感じる', '感知', '知覚'] },
};

describe('legacy DiffusionText animation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DiffusionTextComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('uses the deterministic multilingual morph before settling on the next phrase', () => {
    const first = renderDiffusionFrame(
      'Building',
      'Feeling',
      1_000,
      2_400,
      'morph',
      MORPH_LEXICON,
    );
    const repeated = renderDiffusionFrame(
      'Building',
      'Feeling',
      1_000,
      2_400,
      'morph',
      MORPH_LEXICON,
    );
    expect(first).toEqual(repeated);
    expect(first.done).toBe(false);
    expect(first.text).not.toBe('Feeling');

    expect(
      renderDiffusionFrame('Building', 'Feeling', 20_000, 2_400, 'morph', MORPH_LEXICON),
    ).toEqual({ text: 'Feeling', done: true });
  });

  it('animates input changes and cancels the pending frame on destroy', () => {
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 42);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(DiffusionTextComponent);
    fixture.componentRef.setInput('text', 'Building');
    fixture.componentRef.setInput('variant', 'morph');
    fixture.componentRef.setInput('revealSpeed', 2_400);
    fixture.componentRef.setInput('morphLexicon', MORPH_LEXICON);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Building');
    requestFrame.mockClear();
    cancelFrame.mockClear();

    fixture.componentRef.setInput('text', 'Feeling');
    fixture.detectChanges();
    expect(requestFrame).toHaveBeenCalled();

    fixture.destroy();
    expect(cancelFrame).toHaveBeenCalledWith(42);
  });
});
