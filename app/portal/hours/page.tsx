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
} from '@/lib/hours'

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
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

  // Keep the elapsed-time display ticking while clocked in.
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
    const sessionLabel = activeSession.session_type ? SESSION_LABELS[activeSession.session_type] : null

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

  const activeSessionLabel = activeSession
    ? (activeSession.session_type
        ? SESSION_LABELS[activeSession.session_type]
        : projects.find(p => p.id === activeSession.project_id)?.title ?? 'Session')
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Hours</h1>
        <p className="text-gray-400 text-sm mt-1">Log and track your volunteer hours.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-semibold mb-1">{totalHours.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Total Hours</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-semibold mb-1">{verifiedHours.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Verified Hours</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-semibold mb-1">{(totalHours - verifiedHours).toFixed(1)}</div>
          <div className="text-xs text-gray-400">Pending Verification</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {!activeSession ? (
          <>
            <h2 className="font-semibold mb-5">Clock In</h2>
            <form onSubmit={handleClockIn} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Session Type</label>
                <select
                  value={clockInType}
                  onChange={(e) => setClockInType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="">Select a session type</option>
                  {SESSION_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                  {projects.length > 0 && projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{formError}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">Hours logged successfully.</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Clocking in...' : 'Clock In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <h2 className="font-semibold">
                Clocked in &middot; {activeSessionLabel} &middot; since {formatClockTime(activeSession.clock_in_time)} &middot; {formatElapsed(activeSession.clock_in_time, now)} elapsed
              </h2>
            </div>
            <form onSubmit={handleClockOut} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">What did you do?</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Brief description of your work"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="Any additional notes"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Clocking out...' : 'Clock Out'}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-semibold mb-5">All Entries</h2>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : hours.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hours logged yet.</p>
        ) : (
          <div className="space-y-3">
            {hours.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-gray-400">
                    {entry.date} · {entry.projects?.title ?? 'General'}
                    {entry.clock_in_time && entry.clock_out_time
                      ? ` · ${formatClockTime(entry.clock_in_time)}–${formatClockTime(entry.clock_out_time)}`
                      : ''}
                    {entry.notes ? ' · ' + entry.notes : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">{entry.hours} hrs</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.verified
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {entry.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
