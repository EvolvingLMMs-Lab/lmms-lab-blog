'use client'

import { useEffect, useRef } from 'react'
import { TRANSITION_TIMING } from '../variants'
import styles from './SmoothOverlay.module.css'

interface SmoothOverlayProps {
  phase: 'enter' | 'exit'
  onEnterComplete: () => void
  onExitComplete: () => void
}

export default function SmoothOverlay({ phase, onEnterComplete, onExitComplete }: SmoothOverlayProps) {
  const onEnterRef = useRef(onEnterComplete)
  onEnterRef.current = onEnterComplete
  const onExitRef = useRef(onExitComplete)
  onExitRef.current = onExitComplete
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => {
        if (mountedRef.current) onEnterRef.current()
      }, TRANSITION_TIMING.SMOOTH_ENTER)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        if (mountedRef.current) onExitRef.current()
      }, TRANSITION_TIMING.SMOOTH_EXIT)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div className={`${styles.overlay} ${phase === 'exit' ? styles.exiting : ''}`} />
  )
}
