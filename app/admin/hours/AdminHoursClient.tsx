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
  member_id: string
  member_profile: { full_name: string } | null
  projects: { title: string } | null
}

export default function AdminHoursClient() {
  const supabase = createClient()
  const [hours, setHours] = useState<HourEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('volunteer_hours')
        .select(`
          *,
          member_profile:profiles!volunteer_hours_member_id_fkey(full_name),
          projects(title)
        `)
        .order('date', { ascending: false })
      console.log('data:', data, 'error:', error)
      setHours(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

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

