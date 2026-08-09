export type TransitionPhase =
  | 'idle'
  | 'normal-enter'
  | 'normal-wait'
  | 'normal-exit'
  | 'egg-enter'
  | 'egg-wait'

export type BigTransitionType = 'strobing' | 'hacking' | 'smooth'

export interface TransitionCombo {
  punk: boolean
  big: BigTransitionType
}

export interface TransitionContextValue {
  triggerTransition: (href: string) => void
  phase: TransitionPhase
}
