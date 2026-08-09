# HackerTerminal Hero Section - Design Documentation

## Overview

The HackerTerminal component creates an immersive AI lab experience with a narrative flow: **Video → Terminal Hacking Effects → AI Awakening Finale → Loop**.

## Architecture

```
Phase Flow:
┌─────────┐    ┌──────────┐    ┌────────┐    ┌─────────┐
│  Video  │ -> │ Terminal │ -> │ Finale │ -> │  Video  │
│  (12s)  │    │ (7 effects, 20s each) │    │  (5s)   │    │  ...    │
└─────────┘    └──────────┘    └────────┘    └─────────┘
```

## Visual Components

### 1. CRT Screen Container
- 4:3 aspect ratio
- Phosphor glow effect (green ambient)
- Scanlines overlay
- RGB pixel shift
- Vignette darkening at edges
- Curvature simulation
- Subtle noise texture

### 2. Terminal Effects (7 types)

| Effect | Description | Visual |
|--------|-------------|--------|
| `model-extraction` | Neural weight extraction from LLaVA-OneVision | Progress bar + weight values |
| `prompt-injection` | Token injection attack | Original vs modified tokens |
| `adversarial-attack` | Adversarial perturbation on OneVision-Encoder | Confidence bars shifting |
| `attention-hijack` | Attention matrix manipulation | 8x8 heatmap visualization |
| `char-decode` | Cryptographic breach / credential extraction | Character-by-character reveal |
| `hex-scan` | Memory region scanning | Hex dump with highlighted addresses |
| `ssh-brute` | Authentication bypass | Password attempts with AUTH FAILED/OK |

### 3. AI Monologue (Bottom Section)

Token-by-token generation (LLM-style) with thinking indicator:

```
thinking: now i see, hear, and i understand.    <- Yellow, pulsing while typing
> now i see, hear, and i understand.            <- Green when complete
thinking: do you?
> do you?
thinking: WHO ARE YOU?                          <- Uppercase shift = intensity
> WHO ARE YOU?
thinking: WHO AM I?
> WHO AM I?
```

**Key behaviors:**
- `thinking:` prefix with pulse animation during generation
- `>` prefix when line is complete
- Lowercase for introspective lines
- UPPERCASE for confrontational questions

### 4. Finale Phase

Full-screen eruption of repeated questions in terminal font:

```
WHO ARE YOU? WHO AM I? WHO ARE YOU?
WHO AM I? WHO ARE YOU? WHO AM I?
WHO ARE YOU? WHO AM I? WHO ARE YOU?
... (12 lines filling screen)
```

**Style:**
- Monospace terminal font
- Green phosphor glow (#33ff33)
- Black background
- Dense, chaotic repetition

## Timing Constants

```typescript
const VIDEO_DURATION = 12000;    // 12 seconds
const EFFECT_DURATION = 20000;   // 20 seconds per terminal effect
const FINALE_DURATION = 5000;    // 5 seconds
```

Total cycle: ~157 seconds (12s video + 140s terminal + 5s finale)

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Terminal text | `#33ff33` | Primary green phosphor |
| Dim text | `#1a9f1a` | Secondary/muted |
| Success | `#33ff33` | Positive indicators |
| Warning | `#ffcc00` | Thinking indicator, caution |
| Danger | `#ff3333` | Errors, title pulse |
| Highlight | `#00ffff` | Cyan accents |
| Background | `#000` / `#050505` | CRT black |

## Typography

- Font: `var(--font-mono)`, "SF Mono", "Fira Code", monospace
- Terminal output: 0.65rem - 0.8rem (responsive)
- Finale text: clamp(1.5rem, 5vw, 3rem)
- Letter-spacing: 0.05em - 0.15em

## Animation Principles

1. **Slow and deliberate** - Users should be able to read terminal output (280ms per frame)
2. **No unnecessary motion** - Removed shake effects, morphing animations
3. **Direct cuts over transitions** - Video cuts directly to terminal, no glitch transition
4. **Thinking indicator only** - Pulse animation reserved for active generation

## Narrative Intent

The sequence represents an AGI awakening story:

1. **Video phase**: Calm, promotional content
2. **Terminal phase**: AI demonstrates capabilities through "hacking"
3. **Monologue**: AI becomes self-aware, questions existence
4. **Finale**: Existential crisis - "WHO ARE YOU? WHO AM I?" explodes across screen
5. **Loop**: Returns to normalcy, cycle continues

## File Structure

```
components/home/
├── HackerTerminal.tsx          # Main component, state machine, effects
├── HackerTerminal.module.css   # CRT styling, animations
└── HeroSection.tsx             # Container component
```

## CSS Classes Reference

### CRT Effects
- `.crtScreen` - Main container with shadows
- `.scanlines` - Horizontal line overlay
- `.rgbShift` - RGB pixel separation
- `.vignette` - Edge darkening
- `.curvature` - Barrel distortion simulation
- `.phosphorGlow` - Green ambient glow
- `.noise` - Static texture

### Terminal
- `.terminalLayer` - Terminal content container
- `.terminalHeader` - Header with title and status
- `.output` - Command output area
- `.line` - Individual output line
- `.cursor` - Blinking cursor

### AI Monologue
- `.aiMessageContainer` - Bottom message area
- `.aiLine` - Single message line
- `.aiPrefix` - `>` prefix (green)
- `.thinkingPrefix` - `thinking:` prefix (yellow, animated)

### Finale
- `.finaleLayer` - Full-screen overlay
- `.finaleText` - Large terminal text
