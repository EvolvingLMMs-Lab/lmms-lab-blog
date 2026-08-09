import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';

export type DiffusionVariant = 'diffusion' | 'morph';

export interface MorphLexiconEntry {
  readonly zh: readonly string[];
  readonly ja: readonly string[];
}

export type MorphLexicon = Readonly<Record<string, MorphLexiconEntry>>;

const GLYPHS = '█▓▒░>_[]{}—+*!#&';
const BLOCKS = '░▒▓█▄▀';
const DEFAULT_CJK = '构建探索未来智慧视觉语言模型认知思维数据算力网络超维';
const DEFAULT_KANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
const DEFAULT_CJK_KANA = `${DEFAULT_CJK}${DEFAULT_KANA}`;

interface DiffusionFrame {
  readonly text: string;
  readonly done: boolean;
}

function hash(seed: number): number {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

function buildContextualMorphPools(
  previousText: string,
  nextText: string,
  morphLexicon?: MorphLexicon,
): { readonly language: string; readonly cyber: string } {
  const previous = morphLexicon?.[previousText];
  const next = morphLexicon?.[nextText];
  const contextualWords = [
    ...(previous?.zh ?? []),
    ...(previous?.ja ?? []),
    ...(next?.zh ?? []),
    ...(next?.ja ?? []),
  ].join('');
  const language = contextualWords.length > 0 ? contextualWords : DEFAULT_CJK_KANA;

  return { language, cyber: `${language}${GLYPHS}${BLOCKS}` };
}

export function renderDiffusionFrame(
  previousText: string,
  nextText: string,
  elapsed: number,
  revealSpeed: number,
  variant: DiffusionVariant,
  morphLexicon?: MorphLexicon,
  random: () => number = Math.random,
): DiffusionFrame {
  const rawProgress = Math.min(elapsed / revealSpeed, 1);

  if (variant === 'diffusion') {
    const progress = 1 - (1 - rawProgress) ** 3;
    const text = nextText
      .split('')
      .map((character, index) => {
        if (character === ' ' || character === '\n') {
          return character;
        }

        const centerOffset = Math.abs(index - nextText.length / 2) / (nextText.length / 2);
        const revealThreshold = progress * (1.2 + (1 - centerOffset) * 0.5);

        if (revealThreshold > random() * 0.5 + 0.5 || random() > 0.9) {
          return character;
        }
        return GLYPHS[Math.floor(random() * GLYPHS.length)];
      })
      .join('');

    return { text: rawProgress >= 1 ? nextText : text, done: rawProgress >= 1 };
  }

  const length = Math.max(previousText.length, nextText.length);
  const characters: string[] = [];
  const morphSpeed = Math.max(0.9, revealSpeed / 1500);
  const stagger = 220 * morphSpeed;
  const pools = buildContextualMorphPools(previousText, nextText, morphLexicon);
  let morphEnd = 0;

  for (let index = 0; index < length; index++) {
    const targetCharacter = nextText[index] || '';
    const oldCharacter = previousText[index] || '';

    if (targetCharacter === oldCharacter) {
      characters.push(targetCharacter);
      continue;
    }

    const jitter = (hash(index * 7 + 3) - 0.5) * 260;
    const characterDelay = index * stagger + jitter;
    const characterElapsed = elapsed - characterDelay;
    const entryFlicker = (120 + hash(index * 11) * 120) * morphSpeed;
    const noise1Hold = (420 + hash(index * 13) * 360) * morphSpeed;
    const hasFlickerBack = hash(index * 17) > 0.2;
    const flickerBack = hasFlickerBack ? (80 + hash(index * 19) * 100) * morphSpeed : 0;
    const noise2Hold = hasFlickerBack ? (280 + hash(index * 23) * 280) * morphSpeed : 0;
    const hasStutter = hash(index * 53) > 0.55;
    const stutterHold = hasStutter ? (220 + hash(index * 59) * 260) * morphSpeed : 0;
    const settleGlitch = (70 + hash(index * 29) * 70) * morphSpeed;
    const phase1 = entryFlicker;
    const phase2 = phase1 + noise1Hold;
    const phase3 = phase2 + flickerBack;
    const phase4 = phase3 + noise2Hold;
    const phase5 = phase4 + stutterHold;
    const phase6 = phase5 + settleGlitch;
    const characterEnd = characterDelay + phase6;
    morphEnd = Math.max(morphEnd, characterEnd);

    if (characterElapsed < 0) {
      characters.push(oldCharacter);
    } else if (characterElapsed < phase1) {
      const tick = Math.floor(characterElapsed / 80);
      characters.push(
        tick % 2 === 0
          ? oldCharacter
          : BLOCKS[Math.floor(hash(index * 31 + tick) * BLOCKS.length)],
      );
    } else if (characterElapsed < phase2) {
      characters.push(pools.language[Math.floor(hash(index * 37 + 1) * pools.language.length)]);
    } else if (characterElapsed < phase3 && hasFlickerBack) {
      characters.push(oldCharacter);
    } else if (characterElapsed < phase4 && hasFlickerBack) {
      characters.push(pools.cyber[Math.floor(hash(index * 43 + 2) * pools.cyber.length)]);
    } else if (characterElapsed < phase5 && hasStutter) {
      const tick = Math.floor((characterElapsed - phase4) / 160);
      characters.push(
        tick % 2 === 0
          ? targetCharacter
          : pools.language[Math.floor(hash(index * 61 + 3) * pools.language.length)],
      );
    } else if (characterElapsed < phase6) {
      const tick = Math.floor((characterElapsed - phase5) / 50);
      characters.push(
        tick % 2 === 0
          ? targetCharacter
          : BLOCKS[Math.floor(hash(index * 47 + tick) * BLOCKS.length)],
      );
    } else {
      characters.push(targetCharacter);
    }
  }

  const done = elapsed >= morphEnd;
  return { text: done ? nextText : characters.join(''), done };
}

@Component({
  selector: 'app-diffusion-text',
  standalone: true,
  template: '{{ displayText() }}',
  styles: ':host { display: inline; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiffusionTextComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) text = '';
  @Input() revealSpeed = 1500;
  @Input() variant: DiffusionVariant = 'diffusion';
  @Input() paused = false;
  @Input() morphLexicon?: MorphLexicon;

  readonly displayText = signal('');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previousText = '';
  private viewInitialized = false;
  private animationFrameId?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewInitialized || !this.isBrowser) {
      this.cancelAnimation();
      this.displayText.set(this.text);
      this.previousText = this.text;
      return;
    }

    if (this.paused) {
      this.cancelAnimation();
      this.displayText.set(this.text);
      return;
    }

    if (
      changes['text'] ||
      changes['revealSpeed'] ||
      changes['variant'] ||
      changes['paused'] ||
      changes['morphLexicon']
    ) {
      const previousText = this.previousText;
      this.previousText = this.text;
      this.startAnimation(previousText, this.text);
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.previousText = this.text;
    this.displayText.set(this.text);
  }

  ngOnDestroy(): void {
    this.cancelAnimation();
  }

  private startAnimation(previousText: string, nextText: string): void {
    this.cancelAnimation();
    let startTime = 0;

    const animate = (timestamp: number): void => {
      if (!startTime) {
        startTime = timestamp;
      }
      const frame = renderDiffusionFrame(
        previousText,
        nextText,
        timestamp - startTime,
        this.revealSpeed,
        this.variant,
        this.morphLexicon,
      );
      this.displayText.set(frame.text);

      if (!frame.done) {
        this.animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = window.requestAnimationFrame(animate);
  }

  private cancelAnimation(): void {
    if (this.animationFrameId !== undefined && this.isBrowser) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
}
