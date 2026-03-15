import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PortalProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contributions } = await supabase
    .from('project_contributions')
    .select('*, projects(title, description, status, nonprofit_partner, start_date, impact_summary)')
    .eq('member_id', user.id)

  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
        <p className="text-gray-400 text-sm mt-1">Projects you are part of.</p>
      </div>

      {contributions && contributions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Your Contributions</h2>
          {contributions.map((c) => {
            const project = c.projects as any
            return (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-semibold text-lg">{project?.title}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    project?.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : project?.status === 'upcoming'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {project?.status}
                  </span>
                </div>
                {project?.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{project.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span>Your role: <span className="text-gray-600 font-medium">{c.role}</span></span>
                  {project?.nonprofit_partner && (
                    <span>Partner: <span className="text-gray-600 font-medium">{project.nonprofit_partner}</span></span>
                  )}
                  {project?.start_date && (
                    <span>Started: <span className="text-gray-600 font-medium">{project.start_date}</span></span>
                  )}
                </div>
                {c.description && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Your contribution</p>
                    <p className="text-sm text-gray-600">{c.description}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest">All Club Projects</h2>
        {allProjects && allProjects.length > 0 ? (
          allProjects.map((project) => (
            <div key={project.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold">{project.title}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  project.status === 'active'
                    ? 'bg-green-50 text-green-600'
                    : project.status === 'upcoming'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                {project.nonprofit_partner && (
                  <span>Partner: <span className="text-gray-600 font-medium">{project.nonprofit_partner}</span></span>
                )}
                {project.start_date && (
                  <span>Started: <span className="text-gray-600 font-medium">{project.start_date}</span></span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No projects yet.</p>
        )}
      </div>
    </div>
  )
}

