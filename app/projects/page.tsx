import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteNav from '@/components/site/SiteNav'
import SiteFooter from '@/components/site/SiteFooter'
import Reveal from '@/components/site/Reveal'

export const metadata = {
  title: 'Projects',
  description:
    'Engineering projects AeroServe members design, build, and donate to kids in the community.',
}

const projects = [
  {
    title: 'Glider Build & Donate',
    status: 'Ongoing',
    date: 'Spring 2025',
    partner: 'TBD',
    description:
      'Members design, build, and donate handcrafted gliders to children in the community, combining aerospace engineering with meaningful service.',
    impact:
      'Our first project as a club. Members learn basic aerodynamics, hands-on fabrication, and the value of giving back.',
    tags: ['Aerospace', 'Build', 'Donation'],
  },
]

export default function ProjectsPage() {
  return (
    <>
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--hairline)]">
          <div className="rake-field pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 lg:pb-20 lg:pt-36">
            <h1 className="max-w-2xl text-[clamp(2.25rem,4.8vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--ink)]">
              Every project ends with something in a kid&rsquo;s hands.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              We take on work that combines real engineering with real community
              impact. This is where ideas become action.
            </p>
          </div>
        </section>

        {/* Editorial entries. One project reads as a feature, not a lonely
            card in a three-column grid padded out with empty cells. */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-col gap-5">
            {projects.map((project) => (
              <Reveal key={project.title} as="article">
                <div className="panel-hover rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] p-8 lg:p-12">
                  <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-[var(--ok-wash)] px-3 py-1 text-xs font-medium text-[var(--ok)]">
                          {project.status}
                        </span>
                        <span className="text-sm text-[var(--ink-muted)]">{project.date}</span>
                      </div>

                      <h2 className="mt-6 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)]">
                        {project.title}
                      </h2>
                      <p className="mt-5 max-w-prose leading-relaxed text-[var(--ink-soft)]">
                        {project.description}
                      </p>

                      <ul className="mt-7 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-[var(--hairline)] px-3 py-1 text-xs text-[var(--ink-muted)]"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-6 border-t border-[var(--hairline)] pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                      <div>
                        <h3 className="text-sm font-medium text-[var(--ink)]">Why it matters</h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-muted)]">
                          {project.impact}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--ink)]">Partner</h3>
                        <p className="mt-2.5 text-sm text-[var(--ink-muted)]">{project.partner}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80}>
            <div className="mt-5 rounded-[var(--radius)] border border-dashed border-[var(--hairline-strong)] px-8 py-14 text-center">
              <p className="font-medium text-[var(--ink)]">More projects coming soon</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
                New builds are added each season as members finish design and
                testing. Check back as the program grows.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)]">
                    Want to partner on a project?
                  </h2>
                  <p className="mt-3 max-w-md leading-relaxed text-[var(--ink-soft)]">
                    We are always looking for nonprofits and community
                    organizations to build alongside.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="tactile group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#1e293b]"
                >
                  Partner with us
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
