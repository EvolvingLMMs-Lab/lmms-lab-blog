'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { TRANSITION_TIMING } from '../variants'
import { getRandomHackingSequence, type HackingLine } from './hackingLines'
import styles from './HackingOverlay.module.css'

interface HackingOverlayProps {
  phase: 'enter' | 'exit'
  onEnterComplete: () => void
  onExitComplete: () => void
}

const LINE_COUNT = 16
const COLOR_MAP: Record<string, string> = {
  green: '#00FF41',
  red: '#FF0040',
  yellow: '#FFD700',
  cyan: '#00E5FF',
  white: '#FFFFFF',
}

// Base delay between lines (ms), before pause is added
const BASE_MIN = 50
const BASE_MAX = 100

export default function HackingOverlay({ phase, onEnterComplete, onExitComplete }: HackingOverlayProps) {
  const [lines] = useState<HackingLine[]>(() => getRandomHackingSequence(LINE_COUNT))
  const [visibleCount, setVisibleCount] = useState(0)
  const [fading, setFading] = useState(false)
  const mountedRef = useRef(true)

  const onEnterRef = useRef(onEnterComplete)
  onEnterRef.current = onEnterComplete
  const onExitRef = useRef(onExitComplete)
  onExitRef.current = onExitComplete

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const revealLines = useCallback(() => {
    let count = 0
    const total = lines.length

    const step = () => {
      if (!mountedRef.current) return
      const currentLine = lines[count]
      count++
      setVisibleCount(count)

      if (count < total) {
        // Base typing delay + per-line dramatic pause + random jitter
        const base = BASE_MIN + Math.random() * (BASE_MAX - BASE_MIN)
        const pause = currentLine?.pause ?? 0
        // Add +-20% jitter to pauses so they feel organic
        const jitter = pause > 0 ? pause * (0.8 + Math.random() * 0.4) : 0
        setTimeout(step, base + jitter)
      } else {
        // Hold on last line briefly before signaling complete
        const finalPause = currentLine?.pause ?? 200
        setTimeout(() => {
          if (mountedRef.current) onEnterRef.current()
        }, finalPause)
      }
    }

    // Initial delay before first line
    setTimeout(step, 120 + Math.random() * 80)
  }, [lines])

  useEffect(() => {
    if (phase === 'enter') {
      revealLines()
    } else {
      setFading(true)
      const t = setTimeout(() => {
        if (mountedRef.current) onExitRef.current()
      }, TRANSITION_TIMING.HACKING_EXIT)
      return () => clearTimeout(t)
    }
  }, [phase, revealLines])

  return (
    <div className={`${styles.overlay} ${fading ? styles.fading : ''}`}>
      <div className={styles.terminal}>
        {lines.slice(0, visibleCount).map((line, i) => (
          <div
            key={i}
            className={styles.line}
            style={{ color: COLOR_MAP[line.color || 'green'] }}
          >
            {line.text}
            {i === visibleCount - 1 && <span className={styles.cursor}>_</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
