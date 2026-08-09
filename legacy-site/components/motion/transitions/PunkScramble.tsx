'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { TRANSITION_TIMING } from '../variants'
import styles from './PunkScramble.module.css'

const GLYPHS = '!@#$%^&*<>{}[]|/\\~'

interface PunkScrambleProps {
  rect: DOMRect
  text: string
  computedStyles: CSSStyleDeclaration
  onComplete: () => void
}

export default function PunkScramble({ rect, text, computedStyles, onComplete }: PunkScrambleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  const scramble = useCallback(() => {
    const now = performance.now()
    if (!startRef.current) startRef.current = now
    const elapsed = now - startRef.current

    if (elapsed >= TRANSITION_TIMING.PUNK_DURATION) {
      onComplete()
      return
    }

    if (containerRef.current) {
      const chars = text.split('')
      const scrambled = chars.map((ch) => {
        if (ch === ' ') return ' '
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }).join('')
      containerRef.current.textContent = scrambled
    }

    rafRef.current = requestAnimationFrame(scramble)
  }, [text, onComplete])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(scramble)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [scramble])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    fontSize: computedStyles.fontSize,
    fontFamily: computedStyles.fontFamily,
    fontWeight: computedStyles.fontWeight,
    lineHeight: computedStyles.lineHeight,
    letterSpacing: computedStyles.letterSpacing,
    color: computedStyles.color,
    display: 'flex',
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  }

  return createPortal(
    <div ref={containerRef} className={styles.scramble} style={style}>
      {text}
    </div>,
    document.body
  )
}
