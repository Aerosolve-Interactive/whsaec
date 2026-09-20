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

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
  member_id: string
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

  async function verifyHour(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('volunteer_hours')
      .update({ verified: true, verified_by: user?.id, verified_at: new Date().toISOString() })
      .eq('id', id)
    setHours(prev => prev.map(h => h.id === id ? { ...h, verified: true } : h))
  }

  async function unverifyHour(id: string) {
    await supabase
      .from('volunteer_hours')
      .update({ verified: false, verified_by: null, verified_at: null })
      .eq('id', id)
    setHours(prev => prev.map(h => h.id === id ? { ...h, verified: false } : h))
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
   * Grants hours directly to a member. Unlike a clocked session these hours are
   * not derived from a timer, so the entry records who granted them and why,
   * and lands already verified -- an admin granting hours IS the verification.
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

    const { error } = await supabase.from('volunteer_hours').insert({
      member_id: grantMemberId,
      date: grantDate,
      hours: amount,
      description: grantReason.trim(),
      notes: grantNotes.trim(),
      verified: true,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
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

    const memberName = members.find(m => m.id === grantMemberId)?.full_name ?? 'member'
    setGrantSuccess(`Granted ${formatHours(amount)} hrs to ${memberName}.`)
    setGrantMemberId('')
    setGrantHoursValue('')
    setGrantTime('')
    setGrantReason('')
    setGrantNotes('')
    setGrantDate(todayInputValue())
    await refreshHours()
    setGranting(false)
  }

  const filtered = hours.filter(h => {
    if (filter === 'pending') return !h.verified
    if (filter === 'verified') return h.verified
    if (filter === 'granted') return h.entry_type === 'admin_grant'
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hours</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Loading...' : `${hours.length} total entries`}
          </p>
        </div>
        <button
          onClick={() => { setGrantOpen(o => !o); setGrantError(''); setGrantSuccess('') }}
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors shrink-0"
        >
          {grantOpen ? 'Close' : 'Grant Hours'}
        </button>
      </div>

      {grantOpen && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold">Grant Hours</h2>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            For hours earned outside a clock-in session. The entry is recorded as admin-granted,
            stamped with your name, and counts as verified immediately.
          </p>

          <form onSubmit={grantHours} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Member</label>
                <select
                  value={grantMemberId}
                  onChange={(e) => setGrantMemberId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="">Select a member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}{m.email ? ` (${m.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Hours</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max={MAX_GRANT_HOURS}
                  value={grantHoursValue}
                  onChange={(e) => setGrantHoursValue(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Date earned</label>
                <input
                  type="date"
                  value={grantDate}
                  onChange={(e) => setGrantDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1.5">
                  Start time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="time"
                  value={grantTime}
                  onChange={(e) => setGrantTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">Reason</label>
              <input
                type="text"
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="e.g. Ran the glider build station at the Frisco library STEM night"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Be specific. This is the line a college sees on an hour verification report.
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1.5">Notes <span className="text-gray-400">(optional)</span></label>
              <textarea
                value={grantNotes}
                onChange={(e) => setGrantNotes(e.target.value)}
                rows={2}
                placeholder="Any context worth keeping on the record"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
              />
            </div>

            {grantError && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{grantError}</p>
            )}
            {grantSuccess && (
              <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">{grantSuccess}</p>
            )}

            <button
              type="submit"
              disabled={granting}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {granting ? 'Granting...' : 'Grant Hours'}
            </button>
          </form>
        </div>
      )}

      {activeSessions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Currently Clocked In</h2>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <div>
                    <p className="text-sm font-medium">{session.member_profile?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400">
                      {session.session_type ? SESSION_LABELS[session.session_type] : session.projects?.title ?? 'Session'}
                      {' · since '}{formatClockTime(session.clock_in_time)}
                      {' · '}{formatElapsed(session.clock_in_time, now)} elapsed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => forceClockOut(session)}
                  disabled={closingId === session.id}
                  className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {closingId === session.id ? 'Clocking out...' : 'Clock Out Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['pending', 'verified', 'granted', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No entries found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span className="truncate">{entry.member_profile?.full_name ?? 'Unknown'}</span>
                    {entry.entry_type === 'admin_grant' && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                        Granted
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {entry.date} · {entry.description}
                    {entry.clock_in_time && entry.clock_out_time
                      ? ` · ${formatClockTime(entry.clock_in_time)}–${formatClockTime(entry.clock_out_time)}`
                      : ''}
                    {entry.notes ? ' · ' + entry.notes : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">{formatHours(Number(entry.hours))} hrs</span>
                  {entry.verified ? (
                    <button
                      onClick={() => unverifyHour(entry.id)}
                      className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      Verified
                    </button>
                  ) : (
                    <button
                      onClick={() => verifyHour(entry.id)}
                      className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => deleteHour(entry.id)}
                    className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
