import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">WHS AeroSolve Interactive</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/projects" className="hover:text-gray-900 transition-colors">Projects</Link>
            <Link href="/curriculum" className="hover:text-gray-900 transition-colors">Curriculum</Link>
            <Link href="/contact" className="text-gray-900 font-medium">Contact</Link>
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
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Reach Out</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Contact</h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            Want to partner with us, ask a question, or learn more about the club? Fill out the form below and we will get back to you.
          </p>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">School</p>
            <p className="font-medium text-sm">Wakeland High School</p>
            <p className="text-sm text-gray-400">Frisco, TX</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Response Time</p>
            <p className="font-medium text-sm">Within a few days</p>
            <p className="text-sm text-gray-400">We check regularly</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Looking For</p>
            <p className="font-medium text-sm">Nonprofit Partners</p>
            <p className="text-sm text-gray-400">Community Orgs</p>
            <p className="text-sm text-gray-400">Club Members</p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdw8P4HEc9xItM8cD1UwScLFz_bihSeLWqKRn0y0Eh2DnjC_w/viewform?embedded=true"
              width="100%"
              height="900"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
            >
              Loading...
            </iframe>
          </div>
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



