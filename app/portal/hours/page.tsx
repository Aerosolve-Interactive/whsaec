'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  SESSION_TYPES,
  SESSION_LABELS,
  isSessionTypeValue,
  computeSessionHours,
  formatElapsed,
  formatClockTime,
  formatHours,
} from '@/lib/hours'
import { PageHeader, Panel, StatRow, Pill, Rows, FIELD, BTN_PRIMARY } from '@/components/app/ui'

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
  entry_type: string | null
  clock_in_time: string | null
  clock_out_time: string | null
  projects: { title: string } | null
}

interface Project {
  id: string
  title: string
}

interface ActiveSession {
  id: string
  project_id: string | null
  session_type: string | null
  clock_in_time: string
}

export default function HoursPage() {
  const supabase = createClient()
  const [hours, setHours] = useState<HourEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [clockInType, setClockInType] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [hoursRes, projectsRes, sessionRes] = await Promise.all([
        supabase
          .from('volunteer_hours')
          .select('*, projects(title)')
          .eq('member_id', user.id)
          .order('date', { ascending: false }),
        supabase.from('projects').select('id, title'),
        supabase
          .from('active_clock_sessions')
          .select('*')
          .eq('member_id', user.id)
          .maybeSingle(),
      ])

      setHours(hoursRes.data ?? [])
      setProjects(projectsRes.data ?? [])
      setActiveSession(sessionRes.data ?? null)
      setLoading(false)
    }
    load()
  }, [])

  // Keep the elapsed display ticking while clocked in. 30s is enough for a
  // minute-resolution label and avoids a per-second re-render.
  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [activeSession])

  async function handleClockIn(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSuccess(false)
    if (!clockInType) {
      setFormError('Select a session type before clocking in.')
      return
    }
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isType = isSessionTypeValue(clockInType)
    const { data, error } = await supabase
      .from('active_clock_sessions')
      .insert({
        member_id: user.id,
        project_id: isType ? null : clockInType,
        session_type: isType ? clockInType : null,
      })
      .select()
      .single()

    if (error) {
      setFormError(error.message)
    } else {
      setActiveSession(data)
      setNow(new Date())
    }
    setSubmitting(false)
  }

  async function handleClockOut(e: React.FormEvent) {
    e.preventDefault()
    if (!activeSession) return
    setFormError('')
    setSuccess(false)
    if (!description.trim()) {
      setFormError('Add a quick description of what you did before clocking out.')
      return
    }
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const clockOutTime = new Date()
    const hoursComputed = computeSessionHours(activeSession.clock_in_time, clockOutTime)
    const sessionLabel = activeSession.session_type
      ? SESSION_LABELS[activeSession.session_type]
      : null

    const { error: insertError } = await supabase.from('volunteer_hours').insert({
      member_id: user.id,
      project_id: activeSession.project_id,
      date: activeSession.clock_in_time.slice(0, 10),
      hours: hoursComputed,
      description: sessionLabel ? `${sessionLabel} - ${description}` : description,
      notes,
      clock_in_time: activeSession.clock_in_time,
      clock_out_time: clockOutTime.toISOString(),
    })

    if (insertError) {
      setFormError(insertError.message)
      setSubmitting(false)
      return
    }

    await supabase.from('active_clock_sessions').delete().eq('id', activeSession.id)

    setActiveSession(null)
    setClockInType('')
    setDescription('')
    setNotes('')
    setSuccess(true)

    const { data: refreshed } = await supabase
      .from('volunteer_hours')
      .select('*, projects(title)')
      .eq('member_id', user.id)
      .order('date', { ascending: false })
    setHours(refreshed ?? [])
    setSubmitting(false)
  }

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const verifiedHours = hours.filter(h => h.verified).reduce((sum, h) => sum + Number(h.hours), 0)
  const pending = totalHours - verifiedHours

  const activeSessionLabel = activeSession
    ? activeSession.session_type
      ? SESSION_LABELS[activeSession.session_type]
      : projects.find(p => p.id === activeSession.project_id)?.title ?? 'Session'
    : null

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="My hours" subtitle="Log and track your volunteer hours." />

      <StatRow
        items={[
          { label: 'Total hours', value: formatHours(totalHours) },
          { label: 'Verified', value: formatHours(verifiedHours), tone: 'ok' },
          { label: 'Pending verification', value: formatHours(pending), tone: pending > 0 ? 'warn' : 'default' },
          { label: 'Entries', value: hours.length },
        ]}
      />

      {/* Clock. The live state is the most important thing on this page, so
          it gets the accent treatment and the running timer at display size. */}
      {!activeSession ? (
        <Panel title="Clock in">
          <form onSubmit={handleClockIn} className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="sessionType" className="text-sm font-medium text-[var(--ink)]">
                Session type
              </label>
              <select
                id="sessionType"
                value={clockInType}
                onChange={(e) => setClockInType(e.target.value)}
                className={FIELD}
              >
                <option value="">Select a session type</option>
                {SESSION_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {formError && (
              <p role="alert" className="rounded-[10px] bg-[var(--danger-wash)] px-4 py-2.5 text-sm text-[var(--danger)]">
                {formError}
              </p>
            )}
            {success && (
              <p className="rounded-[10px] bg-[var(--ok-wash)] px-4 py-2.5 text-sm text-[var(--ok)]">
                Hours logged. They are pending verification by an officer.
              </p>
            )}

            <button type="submit" disabled={submitting} className={`${BTN_PRIMARY} self-start`}>
              {submitting ? 'Clocking in...' : 'Clock in'}
            </button>
          </form>
        </Panel>
      ) : (
        <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--brand-sky)] bg-[var(--panel)]">
          <div className="border-b border-[var(--hairline)] bg-[var(--brand-sky-wash)] px-5 py-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--brand-sky-deep)]">
                  Clocked in &middot; {activeSessionLabel}
                </p>
                <p className="nums mt-1 text-xs text-[var(--ink-muted)]">
                  Since {formatClockTime(activeSession.clock_in_time)}
                </p>
              </div>
              <p className="stat-figure text-3xl font-semibold leading-none text-[var(--ink)]">
                {formatElapsed(activeSession.clock_in_time, now)}
              </p>
            </div>
          </div>

          <form onSubmit={handleClockOut} className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="what" className="text-sm font-medium text-[var(--ink)]">
                What did you do?
              </label>
              <input
                id="what"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className={FIELD}
                placeholder="Brief description of your work"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-medium text-[var(--ink)]">
                Notes <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={`${FIELD} resize-none`}
                placeholder="Any additional notes"
              />
            </div>

            {formError && (
              <p role="alert" className="rounded-[10px] bg-[var(--danger-wash)] px-4 py-2.5 text-sm text-[var(--danger)]">
                {formError}
              </p>
            )}

            <button type="submit" disabled={submitting} className={`${BTN_PRIMARY} self-start`}>
              {submitting ? 'Clocking out...' : 'Clock out'}
            </button>
          </form>
        </section>
      )}

      <Panel title="All entries">
        <Rows
          loading={loading}
          empty={!loading && hours.length === 0 ? 'No hours logged yet.' : undefined}
        >
          {hours.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                  <span className="truncate">{entry.description}</span>
                  {entry.entry_type === 'admin_grant' && <Pill tone="info">Granted</Pill>}
                </p>
                <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                  {entry.date} · {entry.projects?.title ?? 'General'}
                  {entry.clock_in_time && entry.clock_out_time
                    ? ` · ${formatClockTime(entry.clock_in_time)}-${formatClockTime(entry.clock_out_time)}`
                    : ''}
                  {entry.notes ? ` · ${entry.notes}` : ''}
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
    </div>
  )
}
