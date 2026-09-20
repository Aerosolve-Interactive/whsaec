import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteNav from '@/components/site/SiteNav'
import Reveal from '@/components/site/Reveal'
import CountUp from '@/components/site/CountUp'

const projectsList = [
  {
    title: 'Glider Build & Donate',
    description:
      'Members design, build, and donate handcrafted gliders to children in the community — combining aerospace engineering with meaningful service.',
    status: 'Ongoing',
    partner: 'TBD',
  },
]

const marqueeItems = [
  'Aerodynamics',
  'Glider Design',
  'Center of Gravity',
  'Lift & Drag',
  'Rapid Prototyping',
  'Flight Testing',
  'CAD Modeling',
  'Iterative Design',
  'Materials & Structures',
  'Community Service',
  'Team Engineering',
  'Hands-On STEM',
]

const pillars = [
  {
    step: '01',
    title: 'Learn',
    body: 'Members work through real aerospace fundamentals — lift, drag, stability, and structures — not worksheets.',
  },
  {
    step: '02',
    title: 'Build',
    body: 'Every concept turns into something physical. Members prototype, test, measure, and redesign until it flies.',
  },
  {
    step: '03',
    title: 'Donate',
    body: 'Finished builds go to kids who rarely get hands-on STEM. The engineering is the means; the impact is the point.',
  },
]

export default async function Home() {
  const supabase = await createClient()

  const [hoursRes, projectsRes] = await Promise.all([
    supabase.from('volunteer_hours').select('hours').eq('verified', true),
    supabase.from('projects').select('id'),
  ])

  const totalVerifiedHours = (hoursRes.data ?? []).reduce((sum, h) => sum + Number(h.hours), 0)
  const totalProjects = projectsRes.data?.length ?? 0

  const stats = [
    { value: totalProjects, suffix: '', decimals: 0, label: 'Projects Launched' },
    { value: 40, suffix: '+', decimals: 0, label: 'Active Members' },
    { value: 0, suffix: '', decimals: 0, label: 'Nonprofits Partnered' },
    {
      value: totalVerifiedHours,
      suffix: '',
      decimals: Number.isInteger(totalVerifiedHours) ? 0 : 1,
      label: 'Volunteer Hours Logged',
    },
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <SiteNav />

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative px-6 pt-40 pb-28">
        {/* Animated colour field */}
        <div className="aurora" aria-hidden="true">
          <div className="aurora-blob aurora-blob--a" />
          <div className="aurora-blob aurora-blob--b" />
          <div className="aurora-blob aurora-blob--c" />
        </div>
        {/* Fine grid, masked to fade downward */}
        <div className="grid-fade absolute inset-0" aria-hidden="true" />

        {/* Decorative glider tracing a flight path */}
        <div
          className="pointer-events-none absolute right-[5%] top-44 hidden lg:block"
          aria-hidden="true"
        >
          <svg width="300" height="220" viewBox="0 0 300 220" fill="none">
            <path
              className="flight-path"
              d="M8 198C62 176 92 134 138 102c44-31 86-44 148-72"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.45"
            />
            {/* Glider drawn pointing along +x, then rotated -25° to match the
                tangent of the flight path where it ends. */}
            <g className="float-drift">
              <g transform="translate(252 38) rotate(-25) scale(1.8)">
                <path
                  d="M20 0 L-14 -12 L-6 0 L-14 12 Z"
                  fill="white"
                  stroke="#0f172a"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path d="M20 0 L-6 0" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-900/[0.08] bg-white/70 px-4 py-1.5 text-xs text-slate-600 shadow-sm backdrop-blur-sm">
            <span className="pulse-ring relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
            Student-led youth nonprofit · Frisco, TX
          </div>

          <h1 className="mt-8 text-[clamp(2.75rem,8vw,5.25rem)] font-semibold leading-[1.06] tracking-[-0.045em]">
            <span className="rise block" style={{ animationDelay: '80ms' }}>
              Engineering Service.
            </span>
            <span className="rise ink-gradient block" style={{ animationDelay: '220ms' }}>
              Building Impact.
            </span>
          </h1>

          <p
            className="rise mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-500"
            style={{ animationDelay: '360ms' }}
          >
            We design, build, and donate to children. Starting with gliders for kids and growing
            into a full community service program powered by aerospace and engineering.
          </p>

          <div
            className="rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '480ms' }}
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20"
            >
              View Our Projects
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
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 bg-white/60 px-6 py-3.5 text-sm font-medium text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-slate-400 hover:text-slate-900"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════ */}
      <section className="relative px-6 pb-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-900/[0.07] bg-slate-900/[0.07] md:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90}>
                <div className="h-full bg-white px-6 py-9 text-center">
                  <div className="text-[2.5rem] font-semibold leading-none tracking-[-0.04em]">
                    <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="mt-2.5 text-xs uppercase tracking-[0.12em] text-slate-400">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ════════════════════════════════════════════ */}
      <section className="py-14">
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-3 px-7 text-sm text-slate-400"
              >
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">How it works</p>
              <h2 className="mt-3 text-[clamp(1.85rem,4vw,2.65rem)] font-semibold leading-tight tracking-[-0.035em]">
                Three steps, start to finish.
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.step} delay={i * 110}>
                <div className="lift group h-full rounded-3xl border border-slate-900/[0.07] bg-white p-7">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/[0.04] text-[11px] font-medium tracking-wider text-slate-400 transition-colors duration-300 group-hover:bg-slate-900 group-hover:text-white">
                    {pillar.step}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{pillar.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{pillar.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═══════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Our work</p>
                <h2 className="mt-3 text-[clamp(1.85rem,4vw,2.65rem)] font-semibold leading-tight tracking-[-0.035em]">
                  Current Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="group hidden shrink-0 items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 sm:inline-flex"
              >
                View all
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
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projectsList.map((project, i) => (
              <Reveal key={project.title} delay={i * 110}>
                <div className="lift h-full rounded-3xl border border-slate-900/[0.07] bg-white p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {project.status}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{project.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                    {project.description}
                  </p>
                  <p className="mt-5 border-t border-slate-900/[0.06] pt-4 text-xs text-slate-400">
                    Partner: {project.partner}
                  </p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={projectsList.length * 110}>
              <div className="flex h-full min-h-[15rem] flex-col items-start justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-7">
                <p className="text-sm font-medium text-slate-600">More in development</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  New builds are added each season as members finish design and testing.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900"
                >
                  Suggest a partner
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ MISSION ════════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-900/[0.07] px-8 py-20 text-center md:px-16">
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-cyan-50"
                aria-hidden="true"
              />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Our mission</p>
                <blockquote className="mx-auto mt-7 max-w-2xl text-[clamp(1.35rem,3vw,1.95rem)] font-medium leading-[1.45] tracking-[-0.02em] text-slate-800">
                  To develop the next generation of community leaders by combining engineering
                  thinking with meaningful service to those who need it most.
                </blockquote>
                <Link
                  href="/curriculum"
                  className="group mt-10 inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white/70 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-slate-900/40 hover:text-slate-900"
                >
                  See what we teach
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
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[clamp(1.85rem,4vw,2.65rem)] font-semibold leading-tight tracking-[-0.035em]">
              Ready to make an impact?
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-slate-500">
              Whether you are a nonprofit looking for partners or a student ready to lead, we would
              love to connect.
            </p>
            <Link
              href="/contact"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20"
            >
              Get in Touch
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
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════ */}
      <footer className="border-t border-slate-900/[0.07] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-5 text-sm text-slate-400 md:flex-row">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-6 w-6" />
              <span>© 2026 AeroServe Youth Program. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/projects" className="transition-colors hover:text-slate-700">Projects</Link>
              <Link href="/curriculum" className="transition-colors hover:text-slate-700">Curriculum</Link>
              <Link href="/contact" className="transition-colors hover:text-slate-700">Contact</Link>
              <Link href="/login" className="transition-colors hover:text-slate-700">Portal</Link>
            </div>
          </div>
          <p className="mt-7 border-t border-slate-900/[0.05] pt-6 text-center text-xs text-slate-400 md:text-left">
            Founded at Wakeland High School · Frisco, Texas
          </p>
        </div>
      </footer>
    </main>
  )
}
