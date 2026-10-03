import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import SiteNav from '@/components/site/SiteNav'
import SiteFooter from '@/components/site/SiteFooter'
import BrandMark from '@/components/site/BrandMark'
import HeroIntro from '@/components/site/HeroIntro'
import Reveal from '@/components/site/Reveal'
import CountUp from '@/components/site/CountUp'

const PROJECTS = [
  {
    title: 'Glider Build & Donate',
    status: 'Ongoing',
    meta: 'First donation November 2026',
    description:
      'Members design, build, and donate handcrafted gliders to children in the community, combining aerospace engineering with meaningful service.',
  },
]

const TAUGHT = [
  'Aerodynamics',
  'Glider design',
  'Center of gravity',
  'Lift and drag',
  'Rapid prototyping',
  'Flight testing',
  'CAD modeling',
  'Iterative design',
  'Materials and structures',
  'Team engineering',
]

const STEPS = [
  {
    n: '01',
    title: 'Learn',
    body: 'Members work through real aerospace fundamentals. Lift, drag, stability, structures. Not worksheets.',
  },
  {
    n: '02',
    title: 'Build',
    body: 'Every concept turns into something physical. Members prototype, test, measure, and redesign until it flies.',
  },
  {
    n: '03',
    title: 'Donate',
    body: 'Finished builds go to kids who rarely get hands-on STEM. The engineering is the means. The impact is the point.',
  },
]

export default async function Home() {
  const supabase = await createClient()

  // Aggregates come from a SECURITY DEFINER function so the public page can
  // show real totals without volunteer_hours rows being readable by anyone.
  let hours = 0
  let projectCount = 0

  const { data: impact, error } = await supabase
    .rpc('public_impact_stats')
    .single<{ verified_hours: number; project_count: number }>()

  if (!error && impact) {
    hours = Number(impact.verified_hours) || 0
    projectCount = Number(impact.project_count) || 0
  } else {
    const [h, p] = await Promise.all([
      supabase.from('volunteer_hours').select('hours').eq('verified', true),
      supabase.from('projects').select('id'),
    ])
    hours = (h.data ?? []).reduce((s, r) => s + Number(r.hours), 0)
    projectCount = p.data?.length ?? 0
  }

  const STATS = [
    { value: hours, decimals: Number.isInteger(hours) ? 0 : 1, suffix: '', label: 'Volunteer hours verified' },
    { value: 40, decimals: 0, suffix: '+', label: 'Active members' },
    { value: projectCount, decimals: 0, suffix: '', label: 'Projects launched' },
    { value: 0, decimals: 0, suffix: '', label: 'Nonprofit partners' },
  ]

  return (
    <>
      <SiteNav />

      <main>
        {/* ═══ HERO - asymmetric split, type left, brand geometry right ═══ */}
        <section className="relative overflow-hidden">
          <div className="rake-field pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="brand-bloom pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem]"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14 lg:pb-32 lg:pt-36">
            <HeroIntro />

            {/* The mark at structural scale. Cropped deliberately so it reads
                as geometry the page is built on, not a logo dropped in. */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="relative mx-auto aspect-square w-full max-w-md">
                <BrandMark className="absolute inset-0 h-full w-full opacity-[0.07]" mono />
                <BrandMark className="absolute left-[18%] top-[14%] h-[58%] w-[58%]" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ IMPACT - data band, hairlines not cards ═══ */}
        <section className="border-y border-[var(--hairline)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <Reveal
                  key={s.label}
                  delay={i * 70}
                  className={`border-[var(--hairline)] px-1 py-8 sm:py-10 ${
                    i % 2 === 0 ? 'border-r' : ''
                  } ${i < 2 ? 'border-b lg:border-b-0' : ''} ${
                    i === 2 ? 'lg:border-r' : ''
                  } ${i === 1 ? 'lg:border-r' : ''}`}
                >
                  <dd className="stat-figure text-[clamp(2rem,4.4vw,2.9rem)] font-semibold leading-none text-[var(--ink)]">
                    <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </dd>
                  <dt className="mt-3 text-[13px] leading-snug text-[var(--ink-muted)]">
                    {s.label}
                  </dt>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ═══ HOW IT WORKS - stepped sequence, progressively indented ═══ */}
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--ink)]">
              Three steps, start to finish.
            </h2>
          </Reveal>

          <div className="mt-14">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div
                  className="step-indent grid gap-x-8 gap-y-3 border-t border-[var(--hairline)] py-9 sm:grid-cols-[auto_1fr] lg:py-11"
                  style={{ '--step-indent': `${i * 2.5}rem` } as React.CSSProperties}
                >
                  <span className="nums text-sm text-[var(--brand-sky)] sm:pt-1.5">{step.n}</span>
                  <div className="grid gap-x-10 gap-y-2 md:grid-cols-[14rem_1fr]">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
                      {step.title}
                    </h3>
                    <p className="max-w-prose leading-relaxed text-[var(--ink-soft)]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-[var(--hairline)]" />
          </div>
        </section>

        {/* ═══ MARQUEE - the one on the page ═══ */}
        <section className="border-y border-[var(--hairline)] bg-[var(--panel)] py-5">
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track">
              {[...TAUGHT, ...TAUGHT].map((t, i) => (
                <span
                  key={i}
                  className="shrink-0 px-6 text-sm text-[var(--ink-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WORK - single feature, not a grid padded with filler ═══ */}
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--ink)]">
                What we&rsquo;re building.
              </h2>
              <Link
                href="/projects"
                className="tactile group inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                All projects
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            {PROJECTS.map((p) => (
              <Reveal key={p.title}>
                <article className="panel-hover relative h-full overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] p-8 lg:p-10">
                  <div
                    className="rake-field pointer-events-none absolute inset-0 opacity-60"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <span className="inline-flex items-center rounded-full bg-[var(--ok-wash)] px-3 py-1 text-xs font-medium text-[var(--ok)]">
                      {p.status}
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-[var(--ink)]">
                      {p.title}
                    </h3>
                    <p className="mt-4 max-w-md leading-relaxed text-[var(--ink-soft)]">
                      {p.description}
                    </p>
                    <p className="mt-8 border-t border-[var(--hairline)] pt-5 text-sm text-[var(--ink-muted)]">
                      {p.meta}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}

            <Reveal delay={90}>
              <div className="flex h-full flex-col justify-between rounded-[var(--radius)] border border-dashed border-[var(--hairline-strong)] p-8 lg:p-10">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    More in development
                  </h3>
                  <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
                    New builds are added each season as members finish design and
                    testing.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="tactile group mt-8 inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--brand-sky-deep)]"
                >
                  Suggest a partner
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ MISSION - full-width type statement ═══ */}
        <section className="border-y border-[var(--hairline)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
                <BrandMark className="h-12 w-12 shrink-0" />
                <blockquote className="text-[clamp(1.45rem,3.1vw,2.2rem)] font-medium leading-[1.3] tracking-[-0.025em] text-[var(--ink)]">
                  To develop the next generation of community leaders by
                  combining engineering thinking with meaningful service to
                  those who need it most.
                  <footer className="mt-8">
                    <Link
                      href="/curriculum"
                      className="tactile group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-sky-deep)]"
                    >
                      See what we teach
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </footer>
                </blockquote>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ CTA - split by audience ═══ */}
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)] md:grid-cols-2">
              <div className="bg-[var(--panel)] p-9 lg:p-12">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
                  For nonprofits
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
                  Looking for a partner to build hands-on STEM activities for
                  the kids you serve? We would love to hear from you.
                </p>
                <Link
                  href="/contact"
                  className="tactile group mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-medium text-white hover:bg-[#1e293b]"
                >
                  Partner with us
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="bg-[var(--panel)] p-9 lg:p-12">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
                  For students
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
                  Ready to design, build, and lead? Members log real hours and
                  take on real engineering work.
                </p>
                <Link
                  href="/signup"
                  className="tactile group mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] px-5 py-3 text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-sky)]"
                >
                  Join the program
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
