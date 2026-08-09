"use client";

import React, { useEffect, useState, useRef } from "react";

export type DiffusionVariant = "diffusion" | "morph";

type MorphLexiconEntry = {
	zh: string[];
	ja: string[];
};

type MorphLexicon = Record<string, MorphLexiconEntry>;

interface DiffusionTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  revealSpeed?: number;
  variant?: DiffusionVariant;
  paused?: boolean;
  morphLexicon?: MorphLexicon;
}

const GLYPHS = "█▓▒░>_[]{}—+*!#&";

const BLOCKS = "░▒▓█▄▀";
const DEFAULT_CJK = "构建探索未来智慧视觉语言模型认知思维数据算力网络超维";
const DEFAULT_KANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノ";
const DEFAULT_CJK_KANA = `${DEFAULT_CJK}${DEFAULT_KANA}`;

const _hash = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function buildContextualMorphPools(
	prevText: string,
	nextText: string,
	morphLexicon?: MorphLexicon,
) {
	const prev = morphLexicon?.[prevText];
	const next = morphLexicon?.[nextText];

	const contextualWords = [
		...(prev?.zh ?? []),
		...(prev?.ja ?? []),
		...(next?.zh ?? []),
		...(next?.ja ?? []),
	].join("");

	const langPool = contextualWords.length > 0 ? contextualWords : DEFAULT_CJK_KANA;
	const cyberPool = `${langPool}${GLYPHS}${BLOCKS}`;

	return { langPool, cyberPool };
}

export function DiffusionText({ 
  text, 
  className = "", 
  revealSpeed = 1500,
  variant = "diffusion",
  paused = false,
  morphLexicon,
}: DiffusionTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const prevTextRef = useRef(text);
  const isMounted = useRef(false);

  useEffect(() => {
    if (paused) {
      setDisplayText(text);
      return;
    }
  }, [paused, text]);
  
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (paused) return;

    const prevText = prevTextRef.current;
    prevTextRef.current = text;
    
    let startTime = 0;
    let animationFrameId: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / revealSpeed, 1);
      
      let currentString = "";
      let morphDuration = 0;

      if (variant === "diffusion") {
        // --- Variant A: Diffusion (Matrix/Glitch style) ---
        // Center-out reveal with heavy noise
        const progress = 1 - Math.pow(1 - rawProgress, 3); // Ease out
        const chars = text.split('');
        
        currentString = chars.map((char, index) => {
          if (char === " " || char === "\n") return char;
          
          const centerOffset = Math.abs(index - text.length / 2) / (text.length / 2);
          const revealThreshold = progress * (1.2 + (1 - centerOffset) * 0.5); 
          
          if (revealThreshold > Math.random() * 0.5 + 0.5) return char;
          if (Math.random() > 0.9) return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join('');

      } else {
        // --- Variant B: Broken neon / stuttering terminal text ---
        const length = Math.max(prevText.length, text.length);
        const chars: string[] = [];
        const morphSpeed = Math.max(0.9, revealSpeed / 1500);
        const stagger = 220 * morphSpeed;
        const { langPool, cyberPool } = buildContextualMorphPools(prevText, text, morphLexicon);
        let morphEnd = 0;

        for (let i = 0; i < length; i++) {
          const targetChar = text[i] || "";
          const oldChar = prevText[i] || "";

          if (targetChar === oldChar) {
            chars.push(targetChar);
            continue;
          }

          const jitter = (_hash(i * 7 + 3) - 0.5) * 260;
          const charDelay = i * stagger + jitter;
          const t = elapsed - charDelay;

          const entryFlicker   = (120 + _hash(i * 11) * 120) * morphSpeed;
          const noise1Hold     = (420 + _hash(i * 13) * 360) * morphSpeed;
          const hasFlickerBack = _hash(i * 17) > 0.2;
          const flickerBack    = hasFlickerBack ? (80 + _hash(i * 19) * 100) * morphSpeed : 0;
          const noise2Hold     = hasFlickerBack ? (280 + _hash(i * 23) * 280) * morphSpeed : 0;
          const hasStutter     = _hash(i * 53) > 0.55;
          const stutterHold    = hasStutter ? (220 + _hash(i * 59) * 260) * morphSpeed : 0;
          const settleGlitch   = (70 + _hash(i * 29) * 70) * morphSpeed;

          const t1 = entryFlicker;
          const t2 = t1 + noise1Hold;
          const t3 = t2 + flickerBack;
          const t4 = t3 + noise2Hold;
          const t5 = t4 + stutterHold;
          const t6 = t5 + settleGlitch;

          const charEnd = charDelay + t6;
          if (charEnd > morphEnd) morphEnd = charEnd;

          if (t < 0) {
            chars.push(oldChar);
          } else if (t < t1) {
            const tick = Math.floor(t / 80);
            chars.push(
              tick % 2 === 0
                ? oldChar
                : BLOCKS[Math.floor(_hash(i * 31 + tick) * BLOCKS.length)]
            );
          } else if (t < t2) {
            chars.push(langPool[Math.floor(_hash(i * 37 + 1) * langPool.length)]);
          } else if (t < t3 && hasFlickerBack) {
            chars.push(oldChar);
          } else if (t < t4 && hasFlickerBack) {
            chars.push(cyberPool[Math.floor(_hash(i * 43 + 2) * cyberPool.length)]);
          } else if (t < t5 && hasStutter) {
            const tick = Math.floor((t - t4) / 160);
            chars.push(
              tick % 2 === 0
                ? targetChar
                : langPool[Math.floor(_hash(i * 61 + 3) * langPool.length)]
            );
          } else if (t < t6) {
            const tick = Math.floor((t - t5) / 50);
            chars.push(
              tick % 2 === 0
                ? targetChar
                : BLOCKS[Math.floor(_hash(i * 47 + tick) * BLOCKS.length)]
            );
          } else {
            chars.push(targetChar);
          }
        }

        currentString = chars.join('');
        morphDuration = morphEnd;
      }
      
      setDisplayText(currentString);

      const done = variant === "morph"
        ? elapsed >= morphDuration
        : rawProgress >= 1;

      if (done) {
        setDisplayText(text);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [text, revealSpeed, variant, paused, morphLexicon]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}
