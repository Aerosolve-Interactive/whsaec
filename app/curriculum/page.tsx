import Link from 'next/link'

const phases = [
  {
    period: 'Mar to May 2025',
    title: 'Founding Quarter',
    subtitle: '2024-2025 School Year',
    color: 'bg-blue-50 border-blue-100',
    tag: 'Current',
    tagColor: 'bg-blue-50 text-blue-600',
    units: [
      {
        name: 'Getting Started',
        description: 'The club launches. First meetings, first members, first builds. No formal lessons yet, just getting everyone excited and working toward the first glider donation.',
        topics: ['Club structure and roles', 'First glider build', 'End of year build session (7 to 10 hrs)', 'Donate first batch of gliders'],
        hours: '8 meetings + 1 build session',
      },
    ],
  },
  {
    period: 'Jun to Aug 2025',
    title: 'Summer Build',
    subtitle: 'Summer 2025',
    color: 'bg-amber-50 border-amber-100',
    tag: 'Summer',
    tagColor: 'bg-amber-50 text-amber-600',
    units: [
      {
        name: 'Experiment and Plan',
        description: 'Optional sessions for core members. Time to try new build ideas, plan the fall curriculum, and start finding nonprofit partners for the year ahead.',
        topics: ['Rubber band powered planes', 'Model rocket intro', 'Planning fall curriculum', 'Nonprofit outreach research'],
        hours: 'Optional, up to 10 hrs',
      },
    ],
  },
  {
    period: 'Aug to Dec 2025',
    title: 'Engineering and Leadership',
    subtitle: '2025-2026 School Year, Fall',
    color: 'bg-gray-50 border-gray-100',
    tag: 'Upcoming',
    tagColor: 'bg-gray-100 text-gray-500',
    units: [
      {
        name: 'Unit 1: Engineering Foundations',
        description: 'Members build real technical knowledge from the ground up. Everything we build gets better when we understand why it works.',
        topics: ['How lift and drag work', 'Basic aerodynamics', 'Reading technical diagrams', 'Engineering design process', 'OpenRocket simulations'],
        hours: 'Aug to Oct',
      },
      {
        name: 'Unit 2: Community and Leadership',
        description: 'Engineering is only half the mission. This unit covers how to turn a build into a real service project that helps people.',
        topics: ['How nonprofits work', 'Planning a service project', 'Communication and outreach', 'Fall build sessions (x2, 7 to 10 hrs each)'],
        hours: 'Oct to Dec',
      },
    ],
  },
  {
    period: 'Jan to May 2026',
    title: 'Advanced Builds and Execution',
    subtitle: '2025-2026 School Year, Spring',
    color: 'bg-gray-50 border-gray-100',
    tag: 'Upcoming',
    tagColor: 'bg-gray-100 text-gray-500',
    units: [
      {
        name: 'Unit 3: Advanced Builds',
        description: 'Members push beyond basic gliders and start tackling harder engineering challenges.',
        topics: ['Advanced glider designs', 'Intro to model rocketry', 'Basic structural engineering', 'Spring build sessions (x2, 7 to 10 hrs each)'],
        hours: 'Jan to Mar',
      },
      {
        name: 'Unit 4: Club Roles and Growth',
        description: 'Members take on more responsibility within the club. Strong contributors move into officer and leadership positions as the year wraps up.',
        topics: ['Officer roles and responsibilities', 'Running a build session', 'Mentoring newer members', 'End of year reflection and planning'],
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

export default function CurriculumPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">WHS AeroSolve Interactive</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/projects" className="hover:text-gray-900 transition-colors">Projects</Link>
            <Link href="/curriculum" className="text-gray-900 font-medium">Curriculum</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
          <Link href="/login" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
            Member Portal
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block">
            Back to Home
          </Link>
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">What We Learn</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Curriculum</h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            A two year plan that takes members from first build to holding leadership positions in the club.
            Every semester builds on the last.
          </p>
        </div>
      </section>

      {/* HOURS BREAKDOWN */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {hourBreakdown.map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-2xl p-5">
              <div className="text-xl font-semibold tracking-tight mb-1">{item.value}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PHASES */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {phases.map((phase) => (
            <div key={phase.title} className={`border rounded-2xl p-8 ${phase.color}`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${phase.tagColor}`}>
                      {phase.tag}
                    </span>
                    <span className="text-xs text-gray-400">{phase.period}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{phase.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{phase.subtitle}</p>
                </div>
              </div>

              <div className="space-y-6">
                {phase.units.map((unit) => (
                  <div key={unit.name} className="bg-white rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-semibold text-sm">{unit.name}</h3>
                      <span className="text-xs text-gray-400 shrink-0">{unit.hours}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{unit.description}</p>
                    <ul className="space-y-1">
                      {unit.topics.map((topic) => (
                        <li key={topic} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="text-gray-300 mt-0.5">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Want to join?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Reach out to learn how to get involved with the club.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>2025 Wakeland High School AeroSolve Interactive. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
            <Link href="/curriculum" className="hover:text-gray-600 transition-colors">Curriculum</Link>
            <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Portal</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}



