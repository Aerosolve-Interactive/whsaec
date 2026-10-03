'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  suffix?: string
  decimals?: number
  durationMs?: number
  className?: string
}

/**
 * Counts up to `value` once, the first time it scrolls into view.
 *
 * Animating a real impact number earns its motion: the count draws the eye to
 * the figure that matters and signals the number is live rather than painted
 * on. Values that are genuinely zero skip the animation, because counting
 * from 0 to 0 is just a flicker.
 *
 * Runs on requestAnimationFrame writing to one leaf's state. No scroll
 * listener, no per-frame work in the wider tree.
 */
export default function CountUp({
  value,
  suffix = '',
  decimals = 0,
  durationMs = 1400,
  className = '',
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
          const p = Math.min(1, (t - start) / durationMs)
          // Ease-out cubic: fast arrival, slow settle.
          setDisplay(value * (1 - Math.pow(1 - p, 3)))
          if (p < 1) frame = requestAnimationFrame(tick)
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
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
