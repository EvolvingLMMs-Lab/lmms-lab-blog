import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  EFFECT_DURATION_MS,
  EFFECT_FRAME_INTERVAL_MS,
  TERMINAL_EFFECT_LABELS,
  TERMINAL_EFFECTS,
  VIDEO_DURATION_MS,
  buildAiMorphLines,
  buildTerminalLines,
} from './hacker-terminal.animation';

const HERO_VIDEO_URL =
  'https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/videos/hero-promo.mp4';

@Component({
  selector: 'app-hacker-terminal',
  standalone: true,
  templateUrl: './hacker-terminal.html',
  styleUrl: './hacker-terminal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HackerTerminalComponent implements AfterViewInit, OnDestroy {
  readonly videoUrl = HERO_VIDEO_URL;
  readonly effectCount = TERMINAL_EFFECTS.length;
  readonly phase = signal<'video' | 'terminal'>('video');
  readonly effectIndex = signal(0);
  readonly lines = signal<readonly string[]>([]);
  readonly aiFrame = signal(0);
  readonly currentEffect = computed(() => TERMINAL_EFFECTS[this.effectIndex()]);
  readonly effectLabel = computed(() => TERMINAL_EFFECT_LABELS[this.currentEffect()]);
  readonly aiLines = computed(() => buildAiMorphLines(this.aiFrame()));
  readonly terminalVisible = computed(() => this.phase() === 'terminal');

  private frame = 0;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private phaseTimeout?: number;
  private effectInterval?: number;

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.startVideoPhase();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startVideoPhase(): void {
    this.clearTimers();
    this.phase.set('video');
    this.phaseTimeout = window.setTimeout(() => {
      this.effectIndex.set(0);
      this.startTerminalEffect(0);
    }, VIDEO_DURATION_MS);
  }

  private startTerminalEffect(index: number): void {
    this.clearTimers();

    if (index >= TERMINAL_EFFECTS.length) {
      this.startVideoPhase();
      return;
    }

    this.frame = 0;
    this.effectIndex.set(index);
    this.phase.set('terminal');
    this.runEffectFrame();
    this.effectInterval = window.setInterval(
      () => this.runEffectFrame(),
      EFFECT_FRAME_INTERVAL_MS,
    );
    this.phaseTimeout = window.setTimeout(
      () => this.startTerminalEffect(index + 1),
      EFFECT_DURATION_MS,
    );
  }

  private runEffectFrame(): void {
    this.frame += 1;
    this.aiFrame.update((frame) => frame + 1);
    this.lines.set(buildTerminalLines(this.currentEffect(), this.frame));
  }

  private clearTimers(): void {
    if (this.phaseTimeout !== undefined) {
      window.clearTimeout(this.phaseTimeout);
      this.phaseTimeout = undefined;
    }
    if (this.effectInterval !== undefined) {
      window.clearInterval(this.effectInterval);
      this.effectInterval = undefined;
    }
  }
}
