'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SESSION_LABELS, computeSessionHours, formatElapsed, formatClockTime } from '@/lib/hours'

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
  member_id: string
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

export default function AdminHoursClient() {
  const supabase = createClient()
  const [hours, setHours] = useState<HourEntry[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')
  const [now, setNow] = useState(() => new Date())
  const [closingId, setClosingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [hoursRes, sessionsRes] = await Promise.all([
        supabase
          .from('volunteer_hours')
          .select(`
            *,
            member_profile:profiles!volunteer_hours_member_id_fkey(full_name),
            projects(title)
          `)
          .order('date', { ascending: false }),
        supabase
          .from('active_clock_sessions')
          .select(`
            *,
            member_profile:profiles!active_clock_sessions_member_id_fkey(full_name),
            projects(title)
          `)
          .order('clock_in_time', { ascending: true }),
      ])
      setHours(hoursRes.data ?? [])
      setActiveSessions(sessionsRes.data ?? [])
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
    })

    if (!error) {
      await supabase.from('active_clock_sessions').delete().eq('id', session.id)
      setActiveSessions(prev => prev.filter(s => s.id !== session.id))
      const { data: refreshed } = await supabase
        .from('volunteer_hours')
        .select(`
          *,
          member_profile:profiles!volunteer_hours_member_id_fkey(full_name),
          projects(title)
        `)
        .order('date', { ascending: false })
      setHours(refreshed ?? [])
    }
    setClosingId(null)
  }

  const filtered = hours.filter(h => {
    if (filter === 'pending') return !h.verified
    if (filter === 'verified') return h.verified
    return true
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hours</h1>
        <p className="text-gray-400 text-sm mt-1">
          {loading ? 'Loading...' : `${hours.length} total entries`}
        </p>
      </div>

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

      <div className="flex gap-2">
        {(['pending', 'verified', 'all'] as const).map((f) => (
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
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{entry.member_profile?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">
                    {entry.date} · {entry.description}
                    {entry.notes ? ' · ' + entry.notes : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">{entry.hours} hrs</span>
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
