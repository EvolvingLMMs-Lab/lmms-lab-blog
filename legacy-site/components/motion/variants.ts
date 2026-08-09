import { Variants, BezierDefinition } from 'framer-motion';

// Transition timing constants (ms)
export const TRANSITION_TIMING = {
  PUNK_DURATION: 350,
  STROBE_ENTER: 700,
  STROBE_EXIT: 300,
  HACKING_EXIT: 450,
  SMOOTH_ENTER: 240,
  SMOOTH_EXIT: 280,
  PAGE_SWAP_BUFFER: 80,
} as const;

// Easing curves
export const EASE: BezierDefinition = [0.25, 0.1, 0.25, 1];
export const EASE_EXPO: BezierDefinition = [0.16, 1, 0.3, 1];
export const EASE_SPRING: BezierDefinition = [0.175, 0.885, 0.32, 1.275];

export const menuOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: EASE }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: EASE }
  }
};

// Link hover/tap interactions
export const linkVariants: Variants = {
  initial: { opacity: 1 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: EASE
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASE
    }
  }
};
