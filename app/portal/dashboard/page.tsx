import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, hoursResult, contributionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('volunteer_hours')
      .select('*, projects(title)')
      .eq('member_id', user.id)
      .order('date', { ascending: false }),
    supabase.from('project_contributions')
      .select('*, projects(title, status)')
      .eq('member_id', user.id),
  ])

  const profile = profileResult.data
  const hours = hoursResult.data ?? []
  const contributions = contributionsResult.data ?? []

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0)
  const verifiedHours = hours.filter(h => h.verified).reduce((sum, h) => sum + Number(h.hours), 0)
  const recentHours = hours.slice(0, 5)

  return (
    <div className="space-y-8">

      {/* WELCOME */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here is your activity summary.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1) },
          { label: 'Verified Hours', value: verifiedHours.toFixed(1) },
          { label: 'Projects', value: contributions.length },
          { label: 'Pending Hours', value: (totalHours - verifiedHours).toFixed(1) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="text-2xl font-semibold tracking-tight mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* RECENT HOURS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Recent Hours</h2>
          <a href="/portal/hours" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            View all
          </a>
        </div>

        {recentHours.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hours logged yet.</p>
        ) : (
          <div className="space-y-3">
            {recentHours.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    {(entry.projects as any)?.title ?? 'General'}
                  </p>
                  <p className="text-xs text-gray-400">{entry.date} {entry.description ? '· ' + entry.description : ''}</p>
                </div>
                <div className="flex items-center gap-3">
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

      {/* PROJECTS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-semibold mb-5">My Projects</h2>
        {contributions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Not assigned to any projects yet.</p>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{(c.projects as any)?.title}</p>
                  <p className="text-xs text-gray-400">{c.role} {c.description ? '· ' + c.description : ''}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  (c.projects as any)?.status === 'active'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {(c.projects as any)?.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}


