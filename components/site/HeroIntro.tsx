'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

/**
 * Hero copy block, isolated as a client leaf so the page around it stays a
 * Server Component.
 *
 * The stagger is doing real work: it establishes reading order on first
 * paint (status, then headline, then the promise, then the action) instead
 * of dropping four competing elements at once. It is the only entrance
 * animation on the page, and it collapses to static under reduced motion.
 */
export default function HeroIntro() {
  const reduce = useReducedMotion()

  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
      className="max-w-2xl"
    >
      <motion.p
        variants={rise}
        className="text-sm text-[var(--ink-muted)]"
      >
        Student-led nonprofit in Frisco, Texas
      </motion.p>

      <motion.h1
        variants={rise}
        className="mt-5 text-[clamp(2.35rem,5vw,3.65rem)] font-semibold leading-[1.06] tracking-[-0.038em] text-[var(--ink)]"
      >
        Engineering service.
        <br />
        Building impact.
      </motion.h1>

      <motion.p
        variants={rise}
        className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink-soft)]"
      >
        We design, build, and donate aerospace projects to kids who rarely get
        hands-on STEM.
      </motion.p>

      <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-3">
        <Link
          href="/projects"
          className="tactile group inline-flex items-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#1e293b]"
        >
          See our work
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/contact"
          className="tactile inline-flex items-center rounded-full border border-[var(--hairline-strong)] bg-[var(--panel)] px-6 py-3.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-sky)]"
        >
          Partner with us
        </Link>
      </motion.div>
    </motion.div>
  )
}
