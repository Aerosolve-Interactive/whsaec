import type { ReactNode } from 'react'

/**
 * Small shared primitives for the signed-in surfaces.
 *
 * These exist so the seven portal and admin screens stop each inventing
 * their own card padding, heading size, and status-pill colour. Everything
 * here is presentational; no data or auth logic lives in this file.
 */

/** Field styling shared by every input, select and textarea in the app. */
export const FIELD =
  'w-full rounded-[10px] border border-[var(--hairline-strong)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition-colors focus:border-[var(--brand-sky)] focus:outline-none'

export const BTN_PRIMARY =
  'tactile inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-55'

export const BTN_QUIET =
  'tactile inline-flex items-center justify-center gap-2 rounded-full border border-[var(--hairline-strong)] bg-[var(--panel)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-sky)] disabled:cursor-not-allowed disabled:opacity-55'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--ink-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Panel({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}) {
  return (
    <section
      className={`overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="font-medium text-[var(--ink)]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** Stat strip. Hairlines, not a row of boxes. */
export function StatRow({
  items,
}: {
  items: { label: string; value: ReactNode; tone?: 'default' | 'warn' | 'ok' }[]
}) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`border-[var(--hairline)] px-5 py-5 ${
            i % 2 === 0 ? 'border-r' : ''
          } ${i < items.length - 2 ? 'border-b lg:border-b-0' : ''} ${
            i === 1 ? 'lg:border-r' : ''
          } ${i === 2 ? 'lg:border-r' : ''}`}
        >
          <dd
            className={`stat-figure text-2xl font-semibold leading-none ${
              item.tone === 'warn'
                ? 'text-[var(--warn)]'
                : item.tone === 'ok'
                  ? 'text-[var(--ok)]'
                  : 'text-[var(--ink)]'
            }`}
          >
            {item.value}
          </dd>
          <dt className="mt-2 text-xs text-[var(--ink-muted)]">{item.label}</dt>
        </div>
      ))}
    </dl>
  )
}

export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'ok' | 'warn' | 'info' | 'danger'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-[var(--panel-sunk)] text-[var(--ink-muted)]',
    ok: 'bg-[var(--ok-wash)] text-[var(--ok)]',
    warn: 'bg-[var(--warn-wash)] text-[var(--warn)]',
    info: 'bg-[var(--brand-sky-wash)] text-[var(--brand-sky-deep)]',
    danger: 'bg-[var(--danger-wash)] text-[var(--danger)]',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/** Rows separated by hairlines, with built-in empty and loading states. */
export function Rows({
  loading,
  empty,
  children,
}: {
  loading?: boolean
  empty?: ReactNode
  children?: ReactNode
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    )
  }
  if (empty) {
    return (
      <p className="px-5 py-14 text-center text-sm text-[var(--ink-muted)]">{empty}</p>
    )
  }
  return <div className="divide-y divide-[var(--hairline)]">{children}</div>
}
