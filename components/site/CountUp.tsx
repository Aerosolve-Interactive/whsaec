'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  suffix?: string
  decimals?: number
  durationMs?: number
}

/**
 * Counts from 0 up to `value` the first time it scrolls into view, using an
 * ease-out curve so the number decelerates as it lands. Falls straight to the
 * final value for anyone who prefers reduced motion.
 */
export default function CountUp({
  value,
  suffix = '',
  decimals = 0,
  durationMs = 1600,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const reduced =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (reduced || value === 0) {
          setDisplay(value)
          return
        }

        const start = performance.now()
        const tick = (t: number) => {
          const progress = Math.min(1, (t - start) / durationMs)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(value * eased)
          if (progress < 1) frame = requestAnimationFrame(tick)
          else setDisplay(value)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value, durationMs])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
