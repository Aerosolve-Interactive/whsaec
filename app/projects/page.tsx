import Link from 'next/link'

const projects = [
  {
    title: 'Glider Build & Donate',
    status: 'Ongoing',
    date: 'Spring 2025',
    partner: 'TBD',
    description: 'Members design, build, and donate handcrafted gliders to children in the community — combining aerospace engineering with meaningful service.',
    impact: 'Our first project as a club. Members learn basic aerodynamics, hands-on fabrication, and the value of giving back.',
    tags: ['Aerospace', 'Build', 'Donation'],
  },
]

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">WHS Aeroserve</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/projects" className="text-gray-900 font-medium">Projects</Link>
            <Link href="/curriculum" className="hover:text-gray-900 transition-colors">Curriculum</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
          <Link
            href="/login"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            Member Portal
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block">
            ← Back to Home
          </Link>
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Our Work</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Projects</h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            Every project we take on combines engineering skills with real community impact. 
            This is where ideas become action.
          </p>
        </div>
      </section>

      {/* PROJECTS LIST */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="border border-gray-100 rounded-2xl p-8 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      project.status === 'Ongoing'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-gray-400">{project.date}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Partner</p>
                  <p className="text-sm text-gray-600">{project.partner}</p>
                </div>
              </div>

              <p className="text-gray-500 leading-relaxed mb-4">{project.description}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Impact</p>
                <p className="text-sm text-gray-600 leading-relaxed">{project.impact}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE for future projects */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-sm">More projects coming soon.</p>
            <p className="text-gray-300 text-xs mt-1">Check back as the club grows.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Want to partner on a project?</h2>
          <p className="text-gray-500 text-sm mb-6">
            We're always looking for nonprofits and community organizations to work with.
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
          <span>© 2025 Wakeland High School AeroSolve Interactive. All rights reserved.</span>
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



