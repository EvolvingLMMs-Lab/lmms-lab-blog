'use client'

import { type ReactNode } from 'react'
import styles from './PageTransition.module.css'

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className={styles.transitionWrapper}>
      {children}
    </div>
  )
}
