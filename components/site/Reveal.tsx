'use client'

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms for revealing siblings in sequence. */
  delay?: number
  className?: string
  /** Defaults to a div; pass 'li' / 'section' to keep markup semantic. */
  as?: ElementType
}

/**
 * Reveals children the first time they enter the viewport.
 *
 * The transition lives in `.reveal` / `.reveal[data-shown]` in globals.css,
 * which already no-ops under prefers-reduced-motion, so this component never
 * needs to branch on motion preference itself. Observer disconnects after the
 * first intersection: this is an entrance, not a scroll-linked effect.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-shown={shown ? 'true' : 'false'}
      className={`reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
