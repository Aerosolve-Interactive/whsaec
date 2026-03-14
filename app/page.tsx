import Link from 'next/link'

const stats = [
  { value: '1', label: 'Projects Launched' },
  { value: '40+', label: 'Active Members' },
  { value: '0', label: 'Nonprofits Partnered' },
  { value: '0', label: 'Volunteer Hours Logged' },
]

const projects = [
  {
    title: 'Glider Build & Donate',
    description: 'Members design, build, and donate handcrafted gliders to children in the community — combining aerospace engineering with meaningful service.',
    status: 'Ongoing',
    partner: 'TBD',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">WHSAEC</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/projects" className="hover:text-gray-900 transition-colors">Projects</Link>
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

      {/* HERO */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Wakeland High School · Frisco, TX
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight mb-6">
            Engineering Service.
            <br />
            <span className="text-gray-400">Building Impact.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            We design, build, and donate — starting with gliders for kids and growing into
            a full community service program powered by aerospace and engineering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects"
              className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              View Our Projects
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 px-6 py-3 rounded-full text-sm font-medium border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-semibold tracking-tight mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS PREVIEW */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Our Work</p>
              <h2 className="text-3xl font-semibold tracking-tight">Current Projects</h2>
            </div>
            <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    project.status === 'Ongoing'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{project.description}</p>
                <p className="text-xs text-gray-400">Partner: {project.partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">Our Mission</p>
          <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed text-gray-100">
            "To develop the next generation of community leaders by combining
            engineering thinking with meaningful service to those who need it most."
          </blockquote>
          <div className="mt-10">
            <Link
              href="/curriculum"
              className="inline-block border border-gray-600 text-gray-300 px-6 py-3 rounded-full text-sm hover:border-gray-400 hover:text-white transition-colors"
            >
              See What We Teach →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Ready to make an impact?</h2>
          <p className="text-gray-500 mb-8">
            Whether you're a nonprofit looking for partners or a student ready to lead,
            we'd love to connect.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2025 Wakeland High School AEC. All rights reserved.</span>
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


