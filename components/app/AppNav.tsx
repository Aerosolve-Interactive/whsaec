'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BrandMark from '@/components/site/BrandMark'

export interface NavLink {
  href: string
  label: string
}

/**
 * Shared chrome for the signed-in surfaces.
 *
 * The portal and the admin area previously had two separate, slightly
 * different headers, so moving between them felt like changing products.
 * This is one component with a context chip, which also means the mobile
 * menu and sign-out only exist once.
 */
export default function AppNav({
  links,
  fullName,
  role,
  context,
  extra,
}: {
  links: NavLink[]
  fullName: string
  role: string
  /** Shown as a chip beside the wordmark. */
  context: string
  /** Optional cross-link, e.g. Admin from the portal or back again. */
  extra?: NavLink
}) {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [pathname])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const allLinks = extra ? [...links, extra] : links
  const initial = fullName?.trim()?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[var(--panel)]">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="tactile flex shrink-0 items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)] sm:inline">
              AeroServe
            </span>
            <span className="rounded-full bg-[var(--panel-sunk)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
              {context}
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {allLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`tactile rounded-full px-3 py-1.5 text-sm ${
                    active
                      ? 'bg-[var(--panel-sunk)] font-medium text-[var(--ink)]'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative hidden md:block" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="tactile flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-[var(--panel-sunk)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-medium text-white">
                {initial}
              </span>
              <span className="max-w-[9rem] truncate text-sm text-[var(--ink)]">
                {fullName.split(' ')[0]}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[var(--ink-faint)] transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)]">
                <div className="border-b border-[var(--hairline)] px-4 py-3">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{fullName}</p>
                  <p className="mt-0.5 text-xs capitalize text-[var(--ink-muted)]">{role}</p>
                </div>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-wash)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            className="tactile -mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--panel-sunk)] md:hidden"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menu && (
        <div className="border-t border-[var(--hairline)] px-5 pb-5 pt-1 md:hidden">
          <ul className="flex flex-col">
            {allLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border-b border-[var(--hairline)] py-3 text-[15px] text-[var(--ink)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{fullName}</p>
              <p className="text-xs capitalize text-[var(--ink-muted)]">{role}</p>
            </div>
            <button
              onClick={signOut}
              className="tactile inline-flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] px-4 py-2 text-sm text-[var(--danger)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
