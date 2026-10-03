'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  SESSION_LABELS,
  computeSessionHours,
  formatElapsed,
  formatClockTime,
  formatHours,
  buildGrantTimestamps,
  todayInputValue,
  MAX_GRANT_HOURS,
} from '@/lib/hours'
import {
  PageHeader,
  Panel,
  Pill,
  Rows,
  FIELD,
  BTN_PRIMARY,
  BTN_QUIET,
} from '@/components/app/ui'

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
  member_id: string
  verified_by: string | null
  entry_type: string | null
  clock_in_time: string | null
  clock_out_time: string | null
  member_profile: { full_name: string } | null
  projects: { title: string } | null
}

interface ActiveSession {
  id: string
  member_id: string
  project_id: string | null
  session_type: string | null
  clock_in_time: string
  member_profile: { full_name: string } | null
  projects: { title: string } | null
}

interface Member {
  id: string
  full_name: string
  email: string
}

const HOURS_SELECT = `
  *,
  member_profile:profiles!volunteer_hours_member_id_fkey(full_name),
  projects(title)
`

export default function AdminHoursClient() {
  const supabase = createClient()
  const [hours, setHours] = useState<HourEntry[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'granted'>('pending')
  const [now, setNow] = useState(() => new Date())
  const [closingId, setClosingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // --- Grant Hours form state -------------------------------------------
  const [grantOpen, setGrantOpen] = useState(false)
  const [grantMemberId, setGrantMemberId] = useState('')
  const [grantHoursValue, setGrantHoursValue] = useState('')
  const [grantDate, setGrantDate] = useState(() => todayInputValue())
  const [grantTime, setGrantTime] = useState('')
  const [grantReason, setGrantReason] = useState('')
  const [grantNotes, setGrantNotes] = useState('')
  const [granting, setGranting] = useState(false)
  const [grantError, setGrantError] = useState('')
  const [grantSuccess, setGrantSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const [hoursRes, sessionsRes, membersRes] = await Promise.all([
        supabase.from('volunteer_hours').select(HOURS_SELECT).order('date', { ascending: false }),
        supabase
          .from('active_clock_sessions')
          .select(`
            *,
            member_profile:profiles!active_clock_sessions_member_id_fkey(full_name),
            projects(title)
          `)
          .order('clock_in_time', { ascending: true }),
        supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true }),
      ])
      setHours(hoursRes.data ?? [])
      setActiveSessions(sessionsRes.data ?? [])
      setMembers(membersRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // Keep "elapsed" times fresh for whoever is currently clocked in.
  useEffect(() => {
    if (activeSessions.length === 0) return
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [activeSessions.length])

  async function refreshHours() {
    const { data } = await supabase
      .from('volunteer_hours')
      .select(HOURS_SELECT)
      .order('date', { ascending: false })
    setHours(data ?? [])
  }

  /**
   * Verifies someone else's entry. Verifying your own is refused here and by a
   * database trigger -- hours created and approved by the same person are not
   * something a college or advisor can rely on.
   */
  async function verifyHour(entry: HourEntry) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (entry.member_id === user.id) {
      alert('You cannot verify your own hours. Ask another admin or officer to verify this entry.')
      return
    }

    const { error } = await supabase
      .from('volunteer_hours')
      .update({ verified: true, verified_by: user.id, verified_at: new Date().toISOString() })
      .eq('id', entry.id)

    if (error) {
      alert(error.message)
      return
    }
    setHours(prev => prev.map(h => (h.id === entry.id ? { ...h, verified: true, verified_by: user.id } : h)))
  }

  async function unverifyHour(id: string) {
    await supabase
      .from('volunteer_hours')
      .update({ verified: false, verified_by: null, verified_at: null })
      .eq('id', id)
    setHours(prev => prev.map(h => (h.id === id ? { ...h, verified: false, verified_by: null } : h)))
  }

  async function deleteHour(id: string) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('volunteer_hours').delete().eq('id', id)
    setHours(prev => prev.filter(h => h.id !== id))
  }

  async function forceClockOut(session: ActiveSession) {
    if (!confirm(`Clock out ${session.member_profile?.full_name ?? 'this member'} now? This submits their session for verification using the current time as the end time.`)) return
    setClosingId(session.id)

    const clockOutTime = new Date()
    const hoursComputed = computeSessionHours(session.clock_in_time, clockOutTime)
    const sessionLabel = session.session_type ? SESSION_LABELS[session.session_type] : null

    const { error } = await supabase.from('volunteer_hours').insert({
      member_id: session.member_id,
      project_id: session.project_id,
      date: session.clock_in_time.slice(0, 10),
      hours: hoursComputed,
      description: sessionLabel ? `${sessionLabel} - (clocked out by admin)` : '(clocked out by admin)',
      notes: 'Member did not clock out; an admin closed this session manually.',
      clock_in_time: session.clock_in_time,
      clock_out_time: clockOutTime.toISOString(),
      entry_type: 'clocked',
    })

    if (!error) {
      await supabase.from('active_clock_sessions').delete().eq('id', session.id)
      setActiveSessions(prev => prev.filter(s => s.id !== session.id))
      await refreshHours()
    }
    setClosingId(null)
  }

  /**
   * Grants hours directly to a member. Granting to yourself lands pending:
   * another admin has to verify it, because hours created and approved by the
   * same person defeat the point of the clock-in system.
   */
  async function grantHours(e: React.FormEvent) {
    e.preventDefault()
    setGrantError('')
    setGrantSuccess('')

    const amount = Number(grantHoursValue)
    if (!grantMemberId) return setGrantError('Choose which member these hours are for.')
    if (!Number.isFinite(amount) || amount <= 0) return setGrantError('Enter an hours amount greater than 0.')
    if (amount > MAX_GRANT_HOURS) return setGrantError(`A single grant cannot exceed ${MAX_GRANT_HOURS} hours.`)
    if (!grantDate) return setGrantError('Pick the date these hours were earned.')
    if (!grantReason.trim()) return setGrantError('A reason is required so the entry holds up on a college hour report.')

    const stamps = buildGrantTimestamps(grantDate, grantTime, amount)
    if (!stamps) return setGrantError('That date and time combination is not valid.')

    setGranting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const isSelfGrant = user?.id === grantMemberId

    const { error } = await supabase.from('volunteer_hours').insert({
      member_id: grantMemberId,
      date: grantDate,
      hours: amount,
      description: grantReason.trim(),
      notes: grantNotes.trim(),
      verified: !isSelfGrant,
      verified_by: isSelfGrant ? null : (user?.id ?? null),
      verified_at: isSelfGrant ? null : new Date().toISOString(),
      entry_type: 'admin_grant',
      granted_by: user?.id ?? null,
      clock_in_time: stamps.clockIn,
      clock_out_time: stamps.clockOut,
    })

    if (error) {
      setGrantError(error.message)
      setGranting(false)
      return
    }

    const name = members.find(m => m.id === grantMemberId)?.full_name ?? 'member'
    setGrantSuccess(
      isSelfGrant
        ? `Granted ${formatHours(amount)} hrs to yourself. It is pending until another admin verifies it.`
        : `Granted ${formatHours(amount)} hrs to ${name}.`,
    )
    setGrantMemberId('')
    setGrantHoursValue('')
    setGrantTime('')
    setGrantReason('')
    setGrantNotes('')
    setGrantDate(todayInputValue())
    await refreshHours()
    setGranting(false)
  }

  const memberName = (id: string | null) =>
    id ? members.find(m => m.id === id)?.full_name ?? 'another admin' : null

  const filtered = hours.filter(h => {
    if (filter === 'pending') return !h.verified
    if (filter === 'verified') return h.verified
    if (filter === 'granted') return h.entry_type === 'admin_grant'
    return true
  })

  const pendingCount = hours.filter(h => !h.verified).length

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hours"
        subtitle={loading ? 'Loading...' : `${hours.length} entries, ${pendingCount} awaiting verification`}
        action={
          <button
            onClick={() => {
              setGrantOpen(o => !o)
              setGrantError('')
              setGrantSuccess('')
            }}
            className={grantOpen ? BTN_QUIET : BTN_PRIMARY}
          >
            {grantOpen ? 'Close' : 'Grant hours'}
          </button>
        }
      />

      {grantOpen && (
        <Panel title="Grant hours">
          <form onSubmit={grantHours} className="flex flex-col gap-4 p-5">
            <p className="text-sm text-[var(--ink-muted)]">
              For hours earned outside a clock-in session. The entry is recorded
              as admin-granted and stamped with your name. Granting to yourself
              lands pending until another admin verifies it.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="g-member" className="text-sm font-medium text-[var(--ink)]">Member</label>
                <select
                  id="g-member"
                  value={grantMemberId}
                  onChange={(e) => setGrantMemberId(e.target.value)}
                  className={FIELD}
                >
                  <option value="">Select a member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}{m.email ? ` (${m.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="g-hours" className="text-sm font-medium text-[var(--ink)]">Hours</label>
                <input
                  id="g-hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max={MAX_GRANT_HOURS}
                  value={grantHoursValue}
                  onChange={(e) => setGrantHoursValue(e.target.value)}
                  placeholder="e.g. 3.5"
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="g-date" className="text-sm font-medium text-[var(--ink)]">Date earned</label>
                <input
                  id="g-date"
                  type="date"
                  value={grantDate}
                  onChange={(e) => setGrantDate(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="g-time" className="text-sm font-medium text-[var(--ink)]">
                  Start time <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
                </label>
                <input
                  id="g-time"
                  type="time"
                  value={grantTime}
                  onChange={(e) => setGrantTime(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="g-reason" className="text-sm font-medium text-[var(--ink)]">Reason</label>
              <input
                id="g-reason"
                type="text"
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="e.g. Ran the glider build station at the Frisco library STEM night"
                className={FIELD}
              />
              <p className="text-xs text-[var(--ink-muted)]">
                Be specific. This is the line a college sees on an hour verification report.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="g-notes" className="text-sm font-medium text-[var(--ink)]">
                Notes <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
              </label>
              <textarea
                id="g-notes"
                value={grantNotes}
                onChange={(e) => setGrantNotes(e.target.value)}
                rows={2}
                placeholder="Any context worth keeping on the record"
                className={`${FIELD} resize-none`}
              />
            </div>

            {grantError && (
              <p role="alert" className="rounded-[10px] bg-[var(--danger-wash)] px-4 py-2.5 text-sm text-[var(--danger)]">
                {grantError}
              </p>
            )}
            {grantSuccess && (
              <p className="rounded-[10px] bg-[var(--ok-wash)] px-4 py-2.5 text-sm text-[var(--ok)]">
                {grantSuccess}
              </p>
            )}

            <button type="submit" disabled={granting} className={`${BTN_PRIMARY} self-start`}>
              {granting ? 'Granting...' : 'Grant hours'}
            </button>
          </form>
        </Panel>
      )}

      {activeSessions.length > 0 && (
        <Panel title="Currently clocked in">
          <Rows>
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ok)] opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--ok)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {session.member_profile?.full_name ?? 'Unknown'}
                    </p>
                    <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                      {session.session_type ? SESSION_LABELS[session.session_type] : session.projects?.title ?? 'Session'}
                      {' · since '}{formatClockTime(session.clock_in_time)}
                      {' · '}{formatElapsed(session.clock_in_time, now)} elapsed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => forceClockOut(session)}
                  disabled={closingId === session.id}
                  className="tactile shrink-0 rounded-full bg-[var(--warn-wash)] px-3 py-1.5 text-xs font-medium text-[var(--warn)] transition-colors hover:bg-[var(--danger-wash)] hover:text-[var(--danger)] disabled:opacity-55"
                >
                  {closingId === session.id ? 'Clocking out...' : 'Clock out now'}
                </button>
              </div>
            ))}
          </Rows>
        </Panel>
      )}

      <div className="flex flex-wrap gap-2">
        {(['pending', 'verified', 'granted', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`tactile rounded-full px-4 py-2 text-sm font-medium capitalize ${
              filter === f
                ? 'bg-[var(--brand-navy)] text-white'
                : 'border border-[var(--hairline-strong)] bg-[var(--panel)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel>
        <Rows
          loading={loading}
          empty={!loading && filtered.length === 0 ? 'No entries match this filter.' : undefined}
        >
          {filtered.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                  <span className="truncate">{entry.member_profile?.full_name ?? 'Unknown'}</span>
                  {entry.entry_type === 'admin_grant' && <Pill tone="info">Granted</Pill>}
                </p>
                <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                  {entry.date} · {entry.description}
                  {entry.clock_in_time && entry.clock_out_time
                    ? ` · ${formatClockTime(entry.clock_in_time)}-${formatClockTime(entry.clock_out_time)}`
                    : ''}
                  {entry.notes ? ` · ${entry.notes}` : ''}
                </p>
                {entry.verified && entry.verified_by && (
                  <p className="mt-1 text-xs text-[var(--ok)]">
                    Verified by {memberName(entry.verified_by)}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="nums text-sm font-medium text-[var(--ink)]">
                  {formatHours(Number(entry.hours))} hrs
                </span>

                {entry.verified ? (
                  <button
                    onClick={() => unverifyHour(entry.id)}
                    title="Remove verification"
                    className="tactile rounded-full bg-[var(--ok-wash)] px-3 py-1.5 text-xs font-medium text-[var(--ok)] transition-colors hover:bg-[var(--danger-wash)] hover:text-[var(--danger)]"
                  >
                    Verified
                  </button>
                ) : entry.member_id === currentUserId ? (
                  <span
                    title="You cannot verify your own hours. Ask another admin or officer."
                    className="cursor-default rounded-full bg-[var(--panel-sunk)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]"
                  >
                    Needs another admin
                  </span>
                ) : (
                  <button
                    onClick={() => verifyHour(entry)}
                    className="tactile rounded-full bg-[var(--warn-wash)] px-3 py-1.5 text-xs font-medium text-[var(--warn)] transition-colors hover:bg-[var(--ok-wash)] hover:text-[var(--ok)]"
                  >
                    Verify
                  </button>
                )}

                <button
                  onClick={() => deleteHour(entry.id)}
                  className="tactile text-xs text-[var(--ink-faint)] transition-colors hover:text-[var(--danger)]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </Rows>
      </Panel>
    </div>
  )
}
