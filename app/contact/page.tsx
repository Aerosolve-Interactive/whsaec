import SiteNav from '@/components/site/SiteNav'
import SiteFooter from '@/components/site/SiteFooter'
import Reveal from '@/components/site/Reveal'

export const metadata = {
  title: 'Contact',
  description:
    'Partner with AeroServe Youth Program, ask a question, or find out how to join the club.',
}

const DETAILS = [
  {
    label: 'Based at',
    value: 'Wakeland High School',
    note: 'Frisco, Texas',
  },
  {
    label: 'Response time',
    value: 'Within a few days',
    note: 'We check the form regularly',
  },
  {
    label: 'We are looking for',
    value: 'Nonprofit partners',
    note: 'Community orgs and new members',
  },
]

export default function ContactPage() {
  return (
    <>
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--hairline)]">
          <div className="rake-field pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 lg:pb-20 lg:pt-36">
            <h1 className="max-w-2xl text-[clamp(2.25rem,4.8vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--ink)]">
              Let&rsquo;s build something together.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Partnering, asking a question, or joining the club. All of it
              starts here.
            </p>
          </div>
        </section>

        {/* Details rail beside the form, so the page reads as one block
            rather than three info cards stacked above an iframe. */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[19rem_1fr] lg:gap-16">
            <Reveal>
              <dl className="flex flex-col">
                {DETAILS.map((d, i) => (
                  <div
                    key={d.label}
                    className={`py-6 ${i !== 0 ? 'border-t border-[var(--hairline)]' : 'pt-0'}`}
                  >
                    <dt className="text-sm text-[var(--ink-muted)]">{d.label}</dt>
                    <dd className="mt-2">
                      <span className="block font-medium text-[var(--ink)]">{d.value}</span>
                      <span className="mt-1 block text-sm text-[var(--ink-muted)]">{d.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={80}>
              <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)]">
                <div className="border-b border-[var(--hairline)] px-6 py-4">
                  <h2 className="font-medium text-[var(--ink)]">Send us a message</h2>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Every field is optional except your email, so we can reply.
                  </p>
                </div>
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdw8P4HEc9xItM8cD1UwScLFz_bihSeLWqKRn0y0Eh2DnjC_w/viewform?embedded=true"
                  title="AeroServe contact form"
                  width="100%"
                  height="900"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="block w-full"
                >
                  Loading the contact form...
                </iframe>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
