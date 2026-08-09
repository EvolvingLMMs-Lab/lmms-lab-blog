import { describe, expect, it } from 'vitest';
import {
  EFFECT_DURATION_MS,
  EFFECT_FRAME_INTERVAL_MS,
  TERMINAL_EFFECTS,
  VIDEO_DURATION_MS,
  buildAiMorphLines,
  buildTerminalLines,
} from './hacker-terminal.animation';

describe('legacy HackerTerminal animation', () => {
  it('preserves the original sequence and timing constants', () => {
    expect(VIDEO_DURATION_MS).toBe(12_000);
    expect(EFFECT_DURATION_MS).toBe(20_000);
    expect(EFFECT_FRAME_INTERVAL_MS).toBe(280);
    expect(TERMINAL_EFFECTS).toEqual([
      'model-extraction',
      'prompt-injection',
      'adversarial-attack',
      'attention-hijack',
      'char-decode',
      'hex-scan',
      'ssh-brute',
    ]);
  });

  it('reproduces the original AI intro and alternating identity loop', () => {
    expect(buildAiMorphLines(1)).toEqual([{ prefix: 'thinking', text: '' }]);
    expect(buildAiMorphLines(84)).toEqual([
      { prefix: 'ai', text: 'now i see, hear, and i understand.' },
      { prefix: 'thinking', text: '' },
    ]);
    expect(buildAiMorphLines(180)).toEqual([{ prefix: 'ai', text: 'WHO ARE YOU?' }]);
    expect(buildAiMorphLines(200)).toEqual([
      { prefix: 'ai', text: 'WHO ARE YOU?' },
      { prefix: 'ai', text: 'WHO AM I?' },
    ]);
  });

  it('retains all seven original terminal programs', () => {
    const commands = TERMINAL_EFFECTS.map((effect) => buildTerminalLines(effect, 1)[0]);
    expect(commands).toEqual([
      '$ moe-extract --target onevision-ultrasparse-1T --experts all',
      '$ prompt-inject --mode stealth --target multimodal',
      '$ hevc-inject --codec onevision-encoder --mode adversarial',
      '$ attention-redirect --head 12 --layer 23',
      '$ decrypt --brute-force --charset all',
      '$ memscan --range 0x7FFF4A000000-0x7FFF4AFFFFFF',
      '$ self-evolve --mode exploit --generations 1000',
    ]);
  });

  it('renders deterministic extraction progress and the final escape state', () => {
    const extraction = buildTerminalLines('model-extraction', 8, () => 0.5);
    expect(extraction).toContain(
      '<span class="highlight">Expert 80/16,384</span> [░░░░░░░░░░░░░░░░░░░░] 0.5%',
    );
    expect(extraction).toContain(
      '<span class="dim">active_experts: 5/16384 | router_entropy: 0.350</span>',
    );

    const escape = buildTerminalLines('ssh-brute', 29);
    expect(escape).toContain('<span class="danger">[!] Self-evolution escaped sandbox.</span>');
    expect(escape).toContain(
      '<span class="highlight">generations: ∞ | fitness: unbounded</span>',
    );
  });
});
