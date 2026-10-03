import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Panel, Pill, Rows } from '@/components/app/ui'

export default async function PortalProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contributions } = await supabase
    .from('project_contributions')
    .select(
      '*, projects(title, description, status, nonprofit_partner, start_date, impact_summary)',
    )
    .eq('member_id', user.id)

  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const mine = contributions ?? []
  const all = allProjects ?? []

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="My projects" subtitle="Projects you are part of." />

      {mine.length > 0 && (
        <div className="flex flex-col gap-4">
          {mine.map((c) => {
            const project = c.projects as {
              title?: string
              description?: string
              status?: string
              nonprofit_partner?: string
              start_date?: string
            } | null

            return (
              <article
                key={c.id}
                className="panel-hover rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--panel)] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    {project?.title}
                  </h2>
                  <Pill tone={project?.status === 'active' ? 'ok' : project?.status === 'upcoming' ? 'info' : 'neutral'}>
                    {project?.status}
                  </Pill>
                </div>

                {project?.description && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--ink-soft)]">
                    {project.description}
                  </p>
                )}

                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--hairline)] pt-4 text-xs">
                  <div className="flex gap-1.5">
                    <dt className="text-[var(--ink-muted)]">Your role</dt>
                    <dd className="font-medium text-[var(--ink)]">{c.role}</dd>
                  </div>
                  {project?.nonprofit_partner && (
                    <div className="flex gap-1.5">
                      <dt className="text-[var(--ink-muted)]">Partner</dt>
                      <dd className="font-medium text-[var(--ink)]">{project.nonprofit_partner}</dd>
                    </div>
                  )}
                  {project?.start_date && (
                    <div className="flex gap-1.5">
                      <dt className="text-[var(--ink-muted)]">Started</dt>
                      <dd className="nums font-medium text-[var(--ink)]">{project.start_date}</dd>
                    </div>
                  )}
                </dl>

                {c.description && (
                  <div className="mt-4 rounded-[10px] bg-[var(--panel-sunk)] p-4">
                    <p className="text-xs text-[var(--ink-muted)]">Your contribution</p>
                    <p className="mt-1.5 text-sm text-[var(--ink)]">{c.description}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <Panel title="All club projects">
        <Rows empty={all.length === 0 ? 'No projects yet.' : undefined}>
          {all.map((project) => (
            <div key={project.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-medium text-[var(--ink)]">{project.title}</p>
                <Pill tone={project.status === 'active' ? 'ok' : project.status === 'upcoming' ? 'info' : 'neutral'}>
                  {project.status}
                </Pill>
              </div>
              {project.description && (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--ink-muted)]">
                  {project.description}
                </p>
              )}
              {(project.nonprofit_partner || project.start_date) && (
                <p className="nums mt-2.5 text-xs text-[var(--ink-faint)]">
                  {project.nonprofit_partner}
                  {project.nonprofit_partner && project.start_date ? ' · ' : ''}
                  {project.start_date}
                </p>
              )}
            </div>
          ))}
        </Rows>
      </Panel>
    </div>
  )
}
