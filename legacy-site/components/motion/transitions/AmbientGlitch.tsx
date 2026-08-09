'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './AmbientGlitch.module.css'

const GLYPHS = '!@#$%^&*<>{}[]|/\\~'

// Check interval range (ms)
const CHECK_MIN = 12_000
const CHECK_MAX = 25_000

// Chance per check to trigger an ambient glitch
const TRIGGER_CHANCE = 0.15

// 85% text scramble, 15% disconnect flash
const DISCONNECT_CHANCE = 0.15

const DISCONNECT_LINES = [
  { text: 'CONNECTION LOST', color: '#FF0040' },
  { text: 'ERR_CONNECTION_RESET', color: '#FFD700' },
  { text: 'attempting reconnect...', color: '#00FF41' },
  { text: '......................', color: '#00FF41' },
  { text: '[OK] link re-established', color: '#00FF41' },
]

// Selectors for text elements eligible for ambient scramble
const TEXT_SELECTORS = 'h1, h2, h3, p, span, a, time, button'

interface ScrambleTarget {
  element: HTMLElement
  originalText: string
  rect: DOMRect
  styles: CSSStyleDeclaration
}

function pickRandomTextElement(): ScrambleTarget | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(TEXT_SELECTORS))
    .filter(el => {
      const text = el.textContent?.trim() || ''
      if (text.length < 3 || text.length > 60) return false
      // Must be visible
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      if (rect.top < 0 || rect.bottom > window.innerHeight) return false
      // Skip if it has child elements with text (avoid double-scrambling containers)
      if (el.children.length > 0 && el.childElementCount > 0) {
        const childText = Array.from(el.children).reduce((sum, c) => sum + (c.textContent || '').length, 0)
        if (childText > text.length * 0.5) return false
      }
      return true
    })

  if (candidates.length === 0) return null
  const el = candidates[Math.floor(Math.random() * candidates.length)]
  return {
    element: el,
    originalText: el.textContent || '',
    rect: el.getBoundingClientRect(),
    styles: window.getComputedStyle(el),
  }
}

export default function AmbientGlitch({ active }: { active: boolean }) {
  const [scrambleTarget, setScrambleTarget] = useState<ScrambleTarget | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [disconnectVisible, setDisconnectVisible] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const scrambleRafRef = useRef<number>(0)
  const scrambleContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Text scramble effect ──
  const runScramble = useCallback((target: ScrambleTarget) => {
    const duration = 250 + Math.random() * 150
    const start = performance.now()

    const loop = () => {
      if (!mountedRef.current) return
      const elapsed = performance.now() - start

      if (elapsed >= duration) {
        // Restore original
        setScrambleTarget(null)
        return
      }

      if (scrambleContainerRef.current) {
        const scrambled = target.originalText.split('').map(ch => {
          if (ch === ' ') return ' '
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }).join('')
        scrambleContainerRef.current.textContent = scrambled
      }

      scrambleRafRef.current = requestAnimationFrame(loop)
    }

    // Hide original element temporarily
    target.element.style.visibility = 'hidden'
    setScrambleTarget(target)
    scrambleRafRef.current = requestAnimationFrame(loop)

    // Safety restore
    setTimeout(() => {
      target.element.style.visibility = ''
      if (mountedRef.current) setScrambleTarget(null)
    }, duration + 50)
  }, [])

  // ── Disconnect flash effect ──
  const runDisconnect = useCallback(() => {
    setDisconnecting(true)
    setDisconnectVisible(0)

    let count = 0
    const total = DISCONNECT_LINES.length

    const revealNext = () => {
      if (!mountedRef.current) return
      count++
      setDisconnectVisible(count)
      if (count < total) {
        const delay = count <= 2 ? 200 + Math.random() * 300 : 80 + Math.random() * 120
        setTimeout(revealNext, delay)
      } else {
        // Hold, then dismiss
        setTimeout(() => {
          if (mountedRef.current) {
            setDisconnecting(false)
            setDisconnectVisible(0)
          }
        }, 400)
      }
    }

    setTimeout(revealNext, 100)
  }, [])

  // ── Ambient timer loop ──
  useEffect(() => {
    if (!active) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const scheduleNext = () => {
      const delay = CHECK_MIN + Math.random() * (CHECK_MAX - CHECK_MIN)
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current || !active) return

        if (Math.random() < TRIGGER_CHANCE) {
          if (Math.random() < DISCONNECT_CHANCE) {
            runDisconnect()
          } else {
            const target = pickRandomTextElement()
            if (target) runScramble(target)
          }
        }

        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (scrambleRafRef.current) cancelAnimationFrame(scrambleRafRef.current)
    }
  }, [active, runScramble, runDisconnect])

  return (
    <>
      {/* Ambient text scramble portal */}
      {scrambleTarget && createPortal(
        <div
          ref={scrambleContainerRef}
          className={styles.scramble}
          style={{
            position: 'fixed',
            top: scrambleTarget.rect.top,
            left: scrambleTarget.rect.left,
            width: scrambleTarget.rect.width,
            height: scrambleTarget.rect.height,
            fontSize: scrambleTarget.styles.fontSize,
            fontFamily: scrambleTarget.styles.fontFamily,
            fontWeight: scrambleTarget.styles.fontWeight,
            lineHeight: scrambleTarget.styles.lineHeight,
            letterSpacing: scrambleTarget.styles.letterSpacing,
            color: scrambleTarget.styles.color,
            display: 'flex',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {scrambleTarget.originalText}
        </div>,
        document.body
      )}

      {/* Disconnect flash overlay */}
      {disconnecting && (
        <div className={styles.disconnectOverlay}>
          <div className={styles.disconnectTerminal}>
            {DISCONNECT_LINES.slice(0, disconnectVisible).map((line, i) => (
              <div key={i} className={styles.disconnectLine} style={{ color: line.color }}>
                {line.text}
                {i === disconnectVisible - 1 && <span className={styles.cursor}>_</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
