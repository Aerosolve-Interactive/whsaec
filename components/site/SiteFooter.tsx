import Link from 'next/link'
import BrandMark from './BrandMark'

const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/curriculum', label: 'Curriculum' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Member Portal' },
]

/**
 * One footer, used by every public page.
 *
 * Previously this markup was copy-pasted into four page files, which is how
 * they drifted out of sync and how three of them ended up crediting a
 * different organisation entirely.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--hairline)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-6 w-6" />
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                AeroServe Youth Program
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              A student-led nonprofit turning aerospace engineering into
              hands-on STEM for kids who rarely get it.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--hairline)] pt-6 text-xs text-[var(--ink-faint)] sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 AeroServe Youth Program. All rights reserved.</span>
          <span>Founded at Wakeland High School, Frisco, Texas.</span>
        </div>
      </div>
    </footer>
  )
}
