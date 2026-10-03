'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import BrandMark from './BrandMark'

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/curriculum', label: 'Curriculum' },
  { href: '/contact', label: 'Contact' },
]

/**
 * Public site header. One line, 64px, on every marketing page.
 *
 * Starts transparent over the hero and fades in a hairline + blur once the
 * page scrolls, so the nav never competes with the headline on first paint.
 *
 * The previous version dropped its links entirely below md with no menu to
 * replace them, which left phone visitors unable to reach Projects,
 * Curriculum or Contact at all. This one has a real disclosure menu.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the menu on route change, and lock the page behind it while open.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? 'border-b border-[var(--hairline)] bg-[var(--page)]/85 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="tactile group flex shrink-0 items-center gap-2.5"
          aria-label="AeroServe Youth Program, home"
        >
          <BrandMark className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              AeroServe
            </span>
            <span className="hidden text-[13px] font-normal text-[var(--ink-muted)] sm:inline">
              Youth Program
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`tactile relative rounded-full px-3.5 py-2 text-sm ${
                  active
                    ? 'text-[var(--ink)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-px h-px bg-[var(--brand-sky)]" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="tactile group hidden items-center gap-1.5 rounded-full bg-[var(--brand-navy)] py-2 pl-4 pr-3.5 text-sm font-medium text-white hover:bg-[#1e293b] sm:inline-flex"
          >
            Member Portal
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="tactile -mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--panel-sunk)] md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="site-menu"
          className="border-t border-[var(--hairline)] bg-[var(--page)] px-5 pb-6 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between border-b border-[var(--hairline)] py-3.5 text-[15px] text-[var(--ink)]"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-[var(--ink-faint)]" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="tactile mt-5 flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-navy)] py-3 text-sm font-medium text-white"
          >
            Member Portal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </header>
  )
}
