import SiteNav from '@/components/site/SiteNav'
import SiteFooter from '@/components/site/SiteFooter'
import Reveal from '@/components/site/Reveal'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Curriculum',
  description:
    'A two year plan that takes AeroServe members from their first build to holding leadership positions in the club.',
}

type PhaseState = 'current' | 'summer' | 'upcoming'

const phases: {
  period: string
  title: string
  subtitle: string
  state: PhaseState
  tag: string
  units: { name: string; description: string; topics: string[]; hours: string }[]
}[] = [
  {
    period: 'Mar to May 2025',
    title: 'Founding Quarter',
    subtitle: '2024-2025 School Year',
    state: 'current',
    tag: 'Current',
    units: [
      {
        name: 'Getting Started',
        description:
          'The club launches. First meetings, first members, first builds. No formal lessons yet, just getting everyone excited and working toward the first glider donation.',
        topics: [
          'Club structure and roles',
          'First glider build',
          'End of year build session (7 to 10 hrs)',
          'Donate first batch of gliders',
        ],
        hours: '8 meetings + 1 build session',
      },
    ],
  },
  {
    period: 'Jun to Aug 2025',
    title: 'Summer Build',
    subtitle: 'Summer 2025',
    state: 'summer',
    tag: 'Summer',
    units: [
      {
        name: 'Experiment and Plan',
        description:
          'Optional sessions for core members. Time to try new build ideas, plan the fall curriculum, and start finding nonprofit partners for the year ahead.',
        topics: [
          'Rubber band powered planes',
          'Model rocket intro',
          'Planning fall curriculum',
          'Nonprofit outreach research',
        ],
        hours: 'Optional, up to 10 hrs',
      },
    ],
  },
  {
    period: 'Aug to Dec 2025',
    title: 'Engineering and Leadership',
    subtitle: '2025-2026 School Year, Fall',
    state: 'upcoming',
    tag: 'Upcoming',
    units: [
      {
        name: 'Unit 1: Engineering Foundations',
        description:
          'Members build real technical knowledge from the ground up. Everything we build gets better when we understand why it works.',
        topics: [
          'How lift and drag work',
          'Basic aerodynamics',
          'Reading technical diagrams',
          'Engineering design process',
          'OpenRocket simulations',
        ],
        hours: 'Aug to Oct',
      },
      {
        name: 'Unit 2: Community and Leadership',
        description:
          'Engineering is only half the mission. This unit covers how to turn a build into a real service project that helps people.',
        topics: [
          'How nonprofits work',
          'Planning a service project',
          'Communication and outreach',
          'Fall build sessions (x2, 7 to 10 hrs each)',
        ],
        hours: 'Oct to Dec',
      },
    ],
  },
  {
    period: 'Jan to May 2026',
    title: 'Advanced Builds and Execution',
    subtitle: '2025-2026 School Year, Spring',
    state: 'upcoming',
    tag: 'Upcoming',
    units: [
      {
        name: 'Unit 3: Advanced Builds',
        description:
          'Members push beyond basic gliders and start tackling harder engineering challenges.',
        topics: [
          'Advanced glider designs',
          'Intro to model rocketry',
          'Basic structural engineering',
          'Spring build sessions (x2, 7 to 10 hrs each)',
        ],
        hours: 'Jan to Mar',
      },
      {
        name: 'Unit 4: Club Roles and Growth',
        description:
          'Members take on more responsibility within the club. Strong contributors move into officer and leadership positions as the year wraps up.',
        topics: [
          'Officer roles and responsibilities',
          'Running a build session',
          'Mentoring newer members',
          'End of year reflection and planning',
        ],
        hours: 'Mar to May',
      },
    ],
  },
]

const hourBreakdown = [
  { label: 'Weekly meetings', value: '~30 hrs/yr' },
  { label: 'Quarterly builds (x4)', value: '28 to 40 hrs/yr' },
  { label: 'Summer sessions', value: 'Up to 10 hrs' },
  { label: 'Total active member', value: '~70 hrs/yr' },
]

const TAG_STYLE: Record<PhaseState, string> = {
  current: 'bg-[var(--brand-sky-wash)] text-[var(--brand-sky-deep)]',
  summer: 'bg-[var(--warn-wash)] text-[var(--warn)]',
  upcoming: 'bg-[var(--panel-sunk)] text-[var(--ink-muted)]',
}

export default function CurriculumPage() {
  return (
    <>
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--hairline)]">
          <div className="rake-field pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 lg:pb-20 lg:pt-36">
            <h1 className="max-w-2xl text-[clamp(2.25rem,4.8vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--ink)]">
              Two years, first build to leading the club.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Every semester builds on the last. Members start by making
              something fly and finish by running sessions themselves.
            </p>
          </div>
        </section>

        {/* Hours at a glance. Hairline-separated, no card boxes. */}
        <section className="border-b border-[var(--hairline)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {hourBreakdown.map((item, i) => (
                <Reveal
                  key={item.label}
                  delay={i * 60}
                  className={`border-[var(--hairline)] py-8 ${i % 2 === 0 ? 'border-r' : ''} ${
                    i < 2 ? 'border-b lg:border-b-0' : ''
                  } ${i === 1 ? 'lg:border-r' : ''} ${i === 2 ? 'lg:border-r' : ''}`}
                >
                  <dd className="stat-figure text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold leading-none text-[var(--ink)]">
                    {item.value}
                  </dd>
                  <dt className="mt-2.5 text-[13px] text-[var(--ink-muted)]">{item.label}</dt>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Timeline. A vertical spine with a node per phase reads as a plan
            that moves forward, which four stacked tinted boxes did not. */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="relative">
            <div
              className="absolute bottom-0 left-[7px] top-2 w-px bg-[var(--hairline)] lg:left-[calc(11rem+7px)]"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-16 lg:gap-20">
              {phases.map((phase, pi) => (
                <Reveal key={phase.title} delay={pi * 60}>
                  <div className="relative grid gap-y-6 pl-8 lg:grid-cols-[11rem_1fr] lg:gap-x-12 lg:pl-0">
                    <span
                      className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 lg:left-[11rem] ${
                        phase.state === 'current'
                          ? 'border-[var(--brand-sky)] bg-[var(--brand-sky)]'
                          : 'border-[var(--hairline-strong)] bg-[var(--page)]'
                      }`}
                      aria-hidden="true"
                    />

                    <div className="lg:pr-10 lg:text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TAG_STYLE[phase.state]}`}
                      >
                        {phase.tag}
                      </span>
                      <p className="nums mt-3 text-sm text-[var(--ink-muted)]">{phase.period}</p>
                    </div>

                    <div className="lg:pl-10">
                      <h2 className="text-[clamp(1.5rem,2.8vw,1.95rem)] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">
                        {phase.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-[var(--ink-muted)]">{phase.subtitle}</p>

                      <div className="mt-8 flex flex-col gap-4">
                        {phase.units.map((unit) => (
                          <div
                            key={unit.name}
                            className="panel-hover rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] p-6 lg:p-7"
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                              <h3 className="font-semibold tracking-[-0.015em] text-[var(--ink)]">
                                {unit.name}
                              </h3>
                              <span className="nums text-xs text-[var(--ink-muted)]">
                                {unit.hours}
                              </span>
                            </div>
                            <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--ink-soft)]">
                              {unit.description}
                            </p>
                            <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                              {unit.topics.map((topic) => (
                                <li
                                  key={topic}
                                  className="flex gap-2.5 text-sm text-[var(--ink-muted)]"
                                >
                                  <span
                                    className="mt-[9px] h-px w-3 shrink-0 bg-[var(--hairline-strong)]"
                                    aria-hidden="true"
                                  />
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--panel)]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)]">
                    Want to join?
                  </h2>
                  <p className="mt-3 max-w-md leading-relaxed text-[var(--ink-soft)]">
                    Members log real hours, build real things, and move into
                    leadership as the program grows.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="tactile group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#1e293b]"
                >
                  Join the program
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
