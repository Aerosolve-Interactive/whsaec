import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [membersRes, hoursRes, projectsRes] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('volunteer_hours').select('*, profiles(full_name)').order('created_at', { ascending: false }),
    supabase.from('projects').select('*'),
  ])

  const members = membersRes.data ?? []
  const hours = hoursRes.data ?? []
  const projects = projectsRes.data ?? []

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const pendingHours = hours.filter(h => !h.verified)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Manage members, hours, and projects.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length },
          { label: 'Total Hours Logged', value: totalHours.toFixed(1) },
          { label: 'Pending Verification', value: pendingHours.length },
          { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="text-2xl font-semibold tracking-tight mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Pending Hours</h2>
          <a href="/admin/hours" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">View all</a>
        </div>
        {pendingHours.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No pending hours.</p>
        ) : (
          <div className="space-y-3">
            {pendingHours.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{(entry.profiles as any)?.full_name}</p>
                  <p className="text-xs text-gray-400">{entry.date} · {entry.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{entry.hours} hrs</span>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Members</h2>
          <a href="/admin/members" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">View all</a>
        </div>
        <div className="space-y-3">
          {members.slice(0, 8).map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                  {member.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.full_name}</p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                member.role === 'admin' || member.role === 'officer'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

