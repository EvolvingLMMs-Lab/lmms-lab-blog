import { useEffect, useRef, useState } from 'react'
import { TRANSITION_TIMING } from '../variants'
import styles from './StrobeOverlay.module.css'

interface StrobeOverlayProps {
  phase: 'enter' | 'exit'
  onEnterComplete: () => void
  onExitComplete: () => void
}

/* ── Tear strip descriptor ── */
interface Tear {
  y: number
  h: number
  dx: number
}

/* ── Build the static dithered rift texture onto an offscreen canvas ── */
function drawRiftTexture(cw: number, ch: number): HTMLCanvasElement {
  const off = document.createElement('canvas')
  off.width = cw
  off.height = ch
  const ctx = off.getContext('2d')!

  const cx = cw / 2
  const img = ctx.createImageData(cw, ch)
  const d = img.data

  // Horizontal band density variation (sine modulation + random dark gaps)
  const band = new Float32Array(ch)
  for (let y = 0; y < ch; y++) {
    band[y] = 0.35 +
      0.2  * Math.sin(y * 0.07 + Math.random() * 6.28) +
      0.15 * Math.sin(y * 0.17 + Math.random() * 6.28) +
      0.1  * Math.sin(y * 0.41 + Math.random() * 6.28)
    if (Math.random() < 0.06) band[y] *= 0.05
  }

  // Main particle field
  for (let y = 0; y < ch; y++) {
    if (y % 3 === 0) continue // scanline gap
    const rowD = band[y]
    for (let x = 0; x < cw; x++) {
      const dx = (x - cx) / (cw / 2)
      if (Math.random() < Math.exp(-dx * dx * 3.5) * rowD) {
        const idx = (y * cw + x) * 4
        const b = 180 + Math.floor(Math.random() * 75)
        d[idx] = b; d[idx + 1] = b; d[idx + 2] = b
        d[idx + 3] = Math.floor((0.25 + Math.random() * 0.75) * 255)
      }
    }
  }

  // Wider bright data-band streaks
  for (let i = 0; i < 20; i++) {
    const by = Math.floor(Math.random() * ch)
    const bh = 1 + Math.floor(Math.random() * 2)
    const boff = (Math.random() - 0.5) * cw * 0.25
    const bw = 15 + Math.random() * 80
    const x0 = Math.max(0, Math.floor(cx + boff - bw / 2))
    const x1 = Math.min(cw, Math.ceil(cx + boff + bw / 2))
    for (let y = by; y < Math.min(ch, by + bh); y++) {
      for (let x = x0; x < x1; x++) {
        if (Math.random() < 0.65) {
          const idx = (y * cw + x) * 4
          d[idx] = 255; d[idx + 1] = 255; d[idx + 2] = 255
          d[idx + 3] = Math.floor((0.25 + Math.random() * 0.5) * 255)
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0)

  // Central vertical beam with warm glow
  const beamW = Math.max(30, cw * 0.04)
  const g = ctx.createLinearGradient(cx - beamW, 0, cx + beamW, 0)
  g.addColorStop(0,    'rgba(255,245,220,0)')
  g.addColorStop(0.3,  'rgba(255,245,220,0.02)')
  g.addColorStop(0.44, 'rgba(255,248,230,0.12)')
  g.addColorStop(0.49, 'rgba(255,252,240,0.7)')
  g.addColorStop(0.5,  'rgba(255,255,250,1)')
  g.addColorStop(0.51, 'rgba(255,252,240,0.7)')
  g.addColorStop(0.56, 'rgba(255,248,230,0.12)')
  g.addColorStop(0.7,  'rgba(255,245,220,0.02)')
  g.addColorStop(1,    'rgba(255,245,220,0)')
  ctx.fillStyle = g
  ctx.fillRect(cx - beamW, 0, beamW * 2, ch)

  return off
}

/* ── Generate a fresh set of tear strips ── */
function generateTears(ch: number): Tear[] {
  const count = 5 + Math.floor(Math.random() * 6)
  const tears: Tear[] = []
  for (let i = 0; i < count; i++) {
    // Mix of micro-tears and wider tears
    const wide = Math.random() < 0.25
    tears.push({
      y:  Math.floor(Math.random() * ch),
      h:  wide ? (12 + Math.floor(Math.random() * 30)) : (1 + Math.floor(Math.random() * 6)),
      dx: Math.floor((Math.random() - 0.5) * (wide ? 60 : 30)),
    })
  }
  // Occasional large slab tear (full-width visual jolt)
  if (Math.random() < 0.3) {
    tears.push({
      y:  Math.floor(Math.random() * ch * 0.6 + ch * 0.2),
      h:  Math.floor(ch * (0.05 + Math.random() * 0.1)),
      dx: Math.floor((Math.random() - 0.5) * 40),
    })
  }
  return tears.sort((a, b) => a.y - b.y)
}

export default function StrobeOverlay({ phase, onEnterComplete, onExitComplete }: StrobeOverlayProps) {
  const [visible, setVisible] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onEnterRef = useRef(onEnterComplete)
  onEnterRef.current = onEnterComplete
  const onExitRef = useRef(onExitComplete)
  onExitRef.current = onExitComplete

  // Draw base texture + run tear animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const maybeCtx = canvas.getContext('2d')
    if (!maybeCtx) return
    const ctx = maybeCtx

    const scale = 0.5
    const cw = Math.floor(window.innerWidth * scale)
    const ch = Math.floor(window.innerHeight * scale)
    canvas.width = cw
    canvas.height = ch

    // Build static rift texture once
    const offscreen = drawRiftTexture(cw, ch)

    let frame = 0
    let tears = generateTears(ch)
    let globalDx = 0
    let rafId: number

    function render() {
      frame++

      // Refresh tears every 3 frames (~20 Hz) for stepped digital feel
      if (frame % 3 === 0) {
        tears = generateTears(ch)
        // Occasional whole-image horizontal jolt
        globalDx = Math.random() < 0.15
          ? Math.floor((Math.random() - 0.5) * 16)
          : 0
      }

      ctx.clearRect(0, 0, cw, ch)

      // Draw base image in horizontal strips, displacing tear zones
      let y = 0
      for (const tear of tears) {
        const tearEnd = Math.min(ch, tear.y + tear.h)
        // Normal section before this tear
        if (y < tear.y) {
          ctx.drawImage(offscreen, 0, y, cw, tear.y - y, globalDx, y, cw, tear.y - y)
        }
        // Torn section: displaced horizontally
        ctx.drawImage(offscreen, 0, tear.y, cw, tearEnd - tear.y, tear.dx + globalDx, tear.y, cw, tearEnd - tear.y)

        // Bright edge line at tear boundary (white artifact)
        if (Math.abs(tear.dx) > 5) {
          ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.2})`
          ctx.fillRect(globalDx, tear.y, cw, 1)
        }

        y = tearEnd
      }
      // Remaining section below last tear
      if (y < ch) {
        ctx.drawImage(offscreen, 0, y, cw, ch - y, globalDx, y, cw, ch - y)
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Phase timers
  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => onEnterRef.current(), TRANSITION_TIMING.STROBE_ENTER)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setVisible(false)
        onExitRef.current()
      }, TRANSITION_TIMING.STROBE_EXIT)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (!visible) return null

  return (
    <div className={`${styles.overlay} ${phase === 'exit' ? styles.exiting : ''}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
