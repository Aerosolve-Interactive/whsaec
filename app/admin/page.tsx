import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatHours } from '@/lib/hours'
import { PageHeader, Panel, StatRow, Pill, Rows } from '@/components/app/ui'

export default async function AdminPage() {
  const supabase = await createClient()

  const [membersRes, hoursRes, projectsRes] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase
      .from('volunteer_hours')
      .select('*, profiles!volunteer_hours_member_id_fkey(full_name)')
      .order('created_at', { ascending: false }),
    supabase.from('projects').select('*'),
  ])

  const members = membersRes.data ?? []
  const hours = hoursRes.data ?? []
  const projects = projectsRes.data ?? []

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const pendingHours = hours.filter(h => !h.verified)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Overview" subtitle="Manage members, hours, and projects." />

      <StatRow
        items={[
          { label: 'Total members', value: members.length },
          { label: 'Hours logged', value: formatHours(totalHours) },
          {
            label: 'Pending verification',
            value: pendingHours.length,
            tone: pendingHours.length > 0 ? 'warn' : 'default',
          },
          {
            label: 'Active projects',
            value: projects.filter(p => p.status === 'active').length,
          },
        ]}
      />

      <Panel
        title="Pending hours"
        action={
          <Link
            href="/admin/hours"
            className="tactile group inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Review all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <Rows
          empty={pendingHours.length === 0 ? 'Nothing waiting on verification.' : undefined}
        >
          {pendingHours.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ink)]">
                  {(entry.profiles as { full_name?: string } | null)?.full_name ?? 'Unknown'}
                </p>
                <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                  {entry.date} · {entry.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="nums text-sm font-medium text-[var(--ink)]">
                  {formatHours(Number(entry.hours))} hrs
                </span>
                <Pill tone="warn">Pending</Pill>
              </div>
            </div>
          ))}
        </Rows>
      </Panel>

      <Panel
        title="Members"
        action={
          <Link
            href="/admin/members"
            className="tactile group inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <Rows empty={members.length === 0 ? 'No members yet.' : undefined}>
          {members.slice(0, 8).map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-medium text-white">
                  {member.full_name?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">
                    {member.full_name}
                  </p>
                  <p className="truncate text-xs text-[var(--ink-muted)]">{member.email}</p>
                </div>
              </div>
              <Pill tone={member.role === 'admin' || member.role === 'officer' ? 'info' : 'neutral'}>
                {member.role}
              </Pill>
            </div>
          ))}
        </Rows>
      </Panel>
    </div>
  )
}
