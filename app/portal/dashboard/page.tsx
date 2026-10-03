import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatHours } from '@/lib/hours'
import { PageHeader, Panel, StatRow, Pill, Rows } from '@/components/app/ui'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, hoursResult, contributionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('volunteer_hours')
      .select('*, projects(title)')
      .eq('member_id', user.id)
      .order('date', { ascending: false }),
    supabase
      .from('project_contributions')
      .select('*, projects(title, status)')
      .eq('member_id', user.id),
  ])

  const profile = profileResult.data
  const hours = hoursResult.data ?? []
  const contributions = contributionsResult.data ?? []

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const verifiedHours = hours.filter(h => h.verified).reduce((sum, h) => sum + Number(h.hours), 0)
  const pending = totalHours - verifiedHours
  const recentHours = hours.slice(0, 5)

  const firstName = profile?.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        subtitle="Here is your activity summary."
      />

      <StatRow
        items={[
          { label: 'Total hours', value: formatHours(totalHours) },
          { label: 'Verified hours', value: formatHours(verifiedHours), tone: 'ok' },
          { label: 'Pending verification', value: formatHours(pending), tone: pending > 0 ? 'warn' : 'default' },
          { label: 'Projects', value: contributions.length },
        ]}
      />

      <Panel
        title="Recent hours"
        action={
          <Link
            href="/portal/hours"
            className="tactile group inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <Rows
          empty={
            recentHours.length === 0
              ? 'No hours logged yet. Clock in from My Hours to start.'
              : undefined
          }
        >
          {recentHours.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ink)]">
                  {(entry.projects as { title?: string } | null)?.title ?? 'General'}
                </p>
                <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                  {entry.date}
                  {entry.description ? ` · ${entry.description}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="nums text-sm font-medium text-[var(--ink)]">
                  {formatHours(Number(entry.hours))} hrs
                </span>
                <Pill tone={entry.verified ? 'ok' : 'warn'}>
                  {entry.verified ? 'Verified' : 'Pending'}
                </Pill>
              </div>
            </div>
          ))}
        </Rows>
      </Panel>

      <Panel
        title="My projects"
        action={
          <Link
            href="/portal/projects"
            className="tactile group inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <Rows
          empty={
            contributions.length === 0
              ? 'Not assigned to any projects yet. An officer can add you to one.'
              : undefined
          }
        >
          {contributions.map((c) => {
            const project = c.projects as { title?: string; status?: string } | null
            return (
              <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">
                    {project?.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                    {c.role}
                    {c.description ? ` · ${c.description}` : ''}
                  </p>
                </div>
                <Pill tone={project?.status === 'active' ? 'ok' : 'neutral'}>
                  {project?.status}
                </Pill>
              </div>
            )
          })}
        </Rows>
      </Panel>
    </div>
  )
}
