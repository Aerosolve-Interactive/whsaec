'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HourEntry {
  id: string
  date: string
  hours: number
  description: string
  notes: string
  verified: boolean
  projects: { title: string } | null
}

interface Project {
  id: string
  title: string
}

const SESSION_TYPES = [
  { value: 'club-session', label: 'Club Meeting' },
  { value: 'build-session', label: 'Build Session' },
  { value: 'quarterly-build', label: 'Quarterly Build' },
  { value: 'summer-session', label: 'Summer Session' },
  { value: 'volunteer-event', label: 'Volunteer Event' },
]

const SESSION_LABELS: Record<string, string> = {
  'club-session': 'Club Meeting',
  'build-session': 'Build Session',
  'quarterly-build': 'Quarterly Build',
  'summer-session': 'Summer Session',
  'volunteer-event': 'Volunteer Event',
}

export default function HoursPage() {
  const supabase = createClient()
  const [hours, setHours] = useState<HourEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  const [date, setDate] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [hoursVal, setHoursVal] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [hoursRes, projectsRes] = await Promise.all([
        supabase
          .from('volunteer_hours')
          .select('*, projects(title)')
          .eq('member_id', user.id)
          .order('date', { ascending: false }),
        supabase.from('projects').select('id, title'),
      ])

      setHours(hoursRes.data ?? [])
      setProjects(projectsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isSessionType = Object.keys(SESSION_LABELS).includes(selectedProject)

    const { error: insertError } = await supabase.from('volunteer_hours').insert({
      member_id: user.id,
      project_id: isSessionType ? null : (selectedProject || null),
      date,
      hours: parseFloat(hoursVal),
      description: isSessionType
        ? `${SESSION_LABELS[selectedProject]} - ${description}`
        : description,
      notes,
    })

    if (insertError) {
      setFormError(insertError.message)
    } else {
      setSuccess(true)
      setDate('')
      setSelectedProject('')
      setHoursVal('')
      setDescription('')
      setNotes('')

      const { data: refreshed } = await supabase
        .from('volunteer_hours')
        .select('*, projects(title)')
        .eq('member_id', user.id)
        .order('date', { ascending: false })
      setHours(refreshed ?? [])
    }
    setSubmitting(false)
  }

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const verifiedHours = hours.filter(h => h.verified).reduce((sum, h) => sum + Number(h.hours), 0)

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
        <h2 className="font-semibold mb-5">Log Hours</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1.5">Hours</label>
              <input
                type="number"
                value={hoursVal}
                onChange={(e) => setHoursVal(e.target.value)}
                required
                min="0.5"
                max="24"
                step="0.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1.5">Session Type</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
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
          {success && (
            <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">Hours logged successfully.</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Logging...' : 'Log Hours'}
          </button>
        </form>
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

