'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/curriculum', label: 'Curriculum' },
  { href: '/contact', label: 'Contact' },
]

/**
 * Shared public-site header. Starts transparent over the hero aurora and fades
 * in a frosted background + hairline border once the page scrolls, so the nav
 * never competes with the headline on first paint.
 *
 * Uses the real brand mark (/logo.svg) and the full program name so the header
 * is identical on every public page.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/75 backdrop-blur-xl border-b border-slate-900/[0.07]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="group inline-flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            className="h-7 w-7 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-semibold text-lg tracking-tight text-slate-900">
            <span className="hidden sm:inline">AeroServe Youth Program</span>
            <span className="sm:hidden">AeroServe</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`px-3.5 py-2 text-sm transition-colors rounded-lg hover:bg-slate-900/[0.04] ${
                pathname === link.href
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm bg-slate-900 text-white pl-4 pr-3.5 py-2 rounded-full font-medium hover:bg-slate-700 transition-colors"
        >
          Member Portal
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6h7M6.5 3l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </nav>
    </header>
  )
}
