'use client'

import Link, { type LinkProps } from 'next/link'
import { motion } from 'framer-motion'
import { type ReactNode, type ComponentProps, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { linkVariants } from './variants'
import { useTransition } from './TransitionSystem'

type TransitionLinkProps = LinkProps & ComponentProps<'a'> & {
  children: ReactNode
  className?: string
  href: string
  style?: React.CSSProperties
  fullDocument?: boolean
}

export default function TransitionLink({ children, className, style, onClick, onMouseEnter, onFocus, fullDocument = false, ...props }: TransitionLinkProps) {
  const { triggerTransition, phase } = useTransition()
  const router = useRouter()

  const handlePrefetch = useCallback(() => {
    if (fullDocument) return
    router.prefetch(props.href)
  }, [fullDocument, router, props.href])

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      onClick?.(e)
      return
    }

    if (phase !== 'idle') {
      e.preventDefault()
      return
    }

    e.preventDefault()

    triggerTransition(props.href)
    onClick?.(e)
  }, [triggerTransition, phase, props.href, onClick])

  if (fullDocument) {
    return (
      <motion.div
        variants={linkVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        style={style}
      >
        <a
          href={props.href}
          className={className}
          aria-label={props["aria-label"]}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onFocus={onFocus}
        >
          {children}
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={linkVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      style={style}
    >
      <Link 
        className={className} 
        {...props} 
        onClick={handleClick}
        onMouseEnter={(e) => {
            handlePrefetch()
            onMouseEnter?.(e)
        }}
        onFocus={(e) => {
            handlePrefetch()
            onFocus?.(e)
        }}
        prefetch={true}
      >
        {children}
      </Link>
    </motion.div>
  )
}
