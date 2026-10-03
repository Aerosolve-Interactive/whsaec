import Link from 'next/link'
import type { ReactNode } from 'react'
import BrandMark from './BrandMark'

/**
 * Split layout shared by /login and /signup.
 *
 * Both pages were a centered card floating on plain white, which is the most
 * anonymous screen on the site and the first thing a new member sees. The
 * left panel gives it the brand and says what the portal is actually for;
 * the form keeps its own column so nothing about the flow changes.
 *
 * Collapses to form-only below lg, so phones get the form immediately rather
 * than a screen of marketing above the fold.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-[var(--hairline)] bg-[var(--panel)] lg:flex lg:flex-col lg:justify-between">
        <div className="rake-field pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="brand-bloom pointer-events-none absolute -left-20 bottom-0 h-96 w-96"
          aria-hidden="true"
        />

        <div className="relative p-12">
          <Link href="/" className="tactile inline-flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              AeroServe Youth Program
            </span>
          </Link>
        </div>

        <div className="relative p-12">
          <BrandMark className="h-14 w-14" />
          <p className="mt-7 max-w-sm text-[1.6rem] font-medium leading-[1.3] tracking-[-0.025em] text-[var(--ink)]">
            Clock in, log what you built, and let your hours speak for
            themselves.
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">
            Hours are timed, not typed. Every verified hour is signed off by
            someone other than the member who earned it.
          </p>
        </div>

        <div className="relative p-12">
          <p className="text-xs text-[var(--ink-faint)]">
            Founded at Wakeland High School, Frisco, Texas.
          </p>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex flex-col justify-center px-5 py-14 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="tactile mb-10 inline-flex items-center gap-2.5 lg:hidden"
          >
            <BrandMark className="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              AeroServe
            </span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 text-sm text-[var(--ink-muted)]">{footer}</div>
        </div>
      </div>
    </main>
  )
}
