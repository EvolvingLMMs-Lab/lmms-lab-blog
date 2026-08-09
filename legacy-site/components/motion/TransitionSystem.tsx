'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { TransitionCombo, TransitionContextValue, TransitionPhase, BigTransitionType } from './transitions/transitionTypes'
import StrobeOverlay from './transitions/StrobeOverlay'
import HackingOverlay from './transitions/HackingOverlay'
import SmoothOverlay from './transitions/SmoothOverlay'
import AmbientGlitch from './transitions/AmbientGlitch'

const TransitionCtx = createContext<TransitionContextValue>({
  triggerTransition: () => {},
  phase: 'idle',
})

export function useTransition() {
  return useContext(TransitionCtx)
}

// Max time before force-resetting to idle (deadman switch)
const DEADMAN_MS = 6000

let lastWasEasterEgg = false

function pickCombo(): TransitionCombo {
  const punk = Math.random() < 0.2
  let big: BigTransitionType = 'smooth'
  if (!lastWasEasterEgg && Math.random() < 0.03) {
    big = Math.random() < 0.3 ? 'strobing' : 'hacking'
  }
  lastWasEasterEgg = big !== 'smooth'
  return { punk, big }
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function routeKeyFromParts(pathname: string, search: string): string {
  const path = normalizePathname(pathname || '/')
  if (!search) return path
  return `${path}?${search}`
}

function expectedRouteKeyFromHref(href: string): string {
  // Client-only; called from event handlers.
  try {
    const url = new URL(href, window.location.href)
    return routeKeyFromParts(url.pathname, url.searchParams.toString())
  } catch {
    const withoutHash = (href.split('#')[0] || '').trim()
    const [pathPart, queryPart = ''] = withoutHash.split('?')
    return routeKeyFromParts(pathPart || '/', queryPart)
  }
}

interface ProviderState {
  phase: TransitionPhase
  combo: TransitionCombo | null
  href: string | null
  expectedRouteKey: string | null
}

const IDLE_STATE: ProviderState = {
  phase: 'idle',
  combo: null,
  href: null,
  expectedRouteKey: null,
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<ProviderState>(IDLE_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  const deadmanRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Deadman switch: force-reset if transition jams.
  useEffect(() => {
    if (state.phase !== 'idle') {
      deadmanRef.current = setTimeout(() => {
        setState(IDLE_STATE)
      }, DEADMAN_MS)
      return () => {
        if (deadmanRef.current) {
          clearTimeout(deadmanRef.current)
          deadmanRef.current = null
        }
      }
    }

    if (deadmanRef.current) {
      clearTimeout(deadmanRef.current)
      deadmanRef.current = null
    }
  }, [state.phase])

  const triggerTransition = useCallback((href: string) => {
    if (stateRef.current.phase !== 'idle') return

    // Do not intercept hash-only navigations; they won't change pathname/search.
    if (href.startsWith('#')) {
      router.push(href)
      return
    }

    // Prefetch on trigger to reduce page-swap latency.
    try {
      router.prefetch(href)
    } catch {
      // ignore
    }

    const expectedRouteKey = expectedRouteKeyFromHref(href)
    const currentSearch = typeof window !== 'undefined' ? window.location.search.slice(1) : ''
    const currentRouteKey = routeKeyFromParts(pathname, currentSearch)

    // If we're not actually changing route key, don't animate; just navigate.
    if (expectedRouteKey === currentRouteKey) {
      router.push(href)
      return
    }

    const combo = pickCombo()
    const phase: TransitionPhase = combo.big === 'smooth' ? 'normal-enter' : 'egg-enter'

    setState({
      phase,
      combo,
      href,
      expectedRouteKey,
    })
  }, [router, pathname])

  const startNavigation = useCallback(() => {
    const href = stateRef.current.href
    if (!href) return
    router.push(href)
  }, [router])

  const onNormalEnterComplete = useCallback(() => {
    if (stateRef.current.phase !== 'normal-enter') return
    startNavigation()
    setState(prev => ({
      ...prev,
      phase: 'normal-wait',
    }))
  }, [startNavigation])

  const onNormalExitComplete = useCallback(() => {
    setState(IDLE_STATE)
  }, [])

  const onEggEnterComplete = useCallback(() => {
    if (stateRef.current.phase !== 'egg-enter') return
    startNavigation()
    setState(prev => ({
      ...prev,
      phase: 'egg-wait',
    }))
  }, [startNavigation])

  // Remove overlays when the router commits to the destination.
  useEffect(() => {
    const expected = state.expectedRouteKey
    if (!expected) return

    const currentSearch = typeof window !== 'undefined' ? window.location.search.slice(1) : ''
    const current = routeKeyFromParts(pathname, currentSearch)
    if (current !== expected) return

    if (state.phase === 'normal-wait') {
      setState(prev => ({
        ...prev,
        phase: 'normal-exit',
      }))
      return
    }

    if (state.phase === 'egg-wait') {
      setState(IDLE_STATE)
    }
  }, [pathname, state.expectedRouteKey, state.phase])

  return (
    <TransitionCtx.Provider value={{ triggerTransition, phase: state.phase }}>
      {children}

      {/* Easter egg overlays: play, then jump. */}
      {(state.phase === 'egg-enter' || state.phase === 'egg-wait') && state.combo?.big === 'strobing' && (
        <StrobeOverlay phase="enter" onEnterComplete={onEggEnterComplete} onExitComplete={() => {}} />
      )}

      {(state.phase === 'egg-enter' || state.phase === 'egg-wait') && state.combo?.big === 'hacking' && (
        <HackingOverlay phase="enter" onEnterComplete={onEggEnterComplete} onExitComplete={() => {}} />
      )}

      {/* Normal transition: overlay enter -> navigate -> wait for commit -> overlay exit. */}
      {(state.phase === 'normal-enter' || state.phase === 'normal-wait' || state.phase === 'normal-exit') && state.combo?.big === 'smooth' && (
        <SmoothOverlay
          phase={state.phase === 'normal-exit' ? 'exit' : 'enter'}
          onEnterComplete={onNormalEnterComplete}
          onExitComplete={onNormalExitComplete}
        />
      )}

      {/* Ambient idle glitch (only when no transition running) */}
      <AmbientGlitch active={state.phase === 'idle'} />
    </TransitionCtx.Provider>
  )
}
