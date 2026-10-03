'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PageHeader,
  Panel,
  Pill,
  Rows,
  FIELD,
  BTN_PRIMARY,
  BTN_QUIET,
} from '@/components/app/ui'

interface Project {
  id: string
  title: string
  description: string
  status: string
  nonprofit_partner: string
  start_date: string
}

interface Member {
  id: string
  full_name: string
  email: string
}

interface Contribution {
  id: string
  member_id: string
  project_id: string
  role: string
  description?: string | null
  profiles: { full_name: string } | null
}

export default function AdminProjectsPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [partner, setPartner] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState('active')

  const [assignMember, setAssignMember] = useState('')
  const [assignRole, setAssignRole] = useState('Volunteer')
  const [assignDescription, setAssignDescription] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    async function load() {
      const [projectsRes, membersRes, contributionsRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('project_contributions').select('*, profiles(full_name)'),
      ])
      setProjects(projectsRes.data ?? [])
      setMembers(membersRes.data ?? [])
      setContributions(contributionsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        nonprofit_partner: partner,
        start_date: startDate || null,
        status,
        created_by: user?.id,
      })
      .select()
      .single()
    if (!error && data) {
      setProjects(prev => [data, ...prev])
      setTitle('')
      setDescription('')
      setPartner('')
      setStartDate('')
      setStatus('active')
      setAdding(false)
    }
    setSubmitting(false)
  }

  async function handleAssign(projectId: string) {
    if (!assignMember) return
    setAssigning(true)
    const { data, error } = await supabase
      .from('project_contributions')
      .insert({
        project_id: projectId,
        member_id: assignMember,
        role: assignRole,
        description: assignDescription || null,
      })
      .select('*, profiles(full_name)')
      .single()
    if (!error && data) {
      setContributions(prev => [...prev, data])
      setAssignMember('')
      setAssignRole('Volunteer')
      setAssignDescription('')
    }
    setAssigning(false)
  }

  async function removeContribution(id: string) {
    if (!confirm('Remove this member from the project?')) return
    await supabase.from('project_contributions').delete().eq('id', id)
    setContributions(prev => prev.filter(c => c.id !== id))
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('projects').update({ status }).eq('id', id)
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, status } : p)))
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Projects"
        subtitle="Manage projects and assign members."
        action={
          <button
            onClick={() => setAdding(!adding)}
            className={adding ? BTN_QUIET : BTN_PRIMARY}
          >
            {adding ? 'Cancel' : 'Add project'}
          </button>
        }
      />

      {adding && (
        <Panel title="New project">
          <form onSubmit={handleAdd} className="flex flex-col gap-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="p-title" className="text-sm font-medium text-[var(--ink)]">Title</label>
                <input
                  id="p-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={FIELD}
                  placeholder="Project name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="p-partner" className="text-sm font-medium text-[var(--ink)]">
                  Nonprofit partner
                </label>
                <input
                  id="p-partner"
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className={FIELD}
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="p-desc" className="text-sm font-medium text-[var(--ink)]">Description</label>
              <textarea
                id="p-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={`${FIELD} resize-none`}
                placeholder="What is this project about?"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="p-start" className="text-sm font-medium text-[var(--ink)]">Start date</label>
                <input
                  id="p-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="p-status" className="text-sm font-medium text-[var(--ink)]">Status</label>
                <select
                  id="p-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={FIELD}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting} className={`${BTN_PRIMARY} self-start`}>
              {submitting ? 'Adding...' : 'Add project'}
            </button>
          </form>
        </Panel>
      )}

      <Panel>
        <Rows
          loading={loading}
          empty={!loading && projects.length === 0 ? 'No projects yet.' : undefined}
        >
          {projects.map((project) => {
            const projectContributions = contributions.filter(c => c.project_id === project.id)
            const isExpanded = expandedProject === project.id

            return (
              <div key={project.id}>
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--ink)]">{project.title}</p>
                    <p className="nums mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                      {project.nonprofit_partner ? `${project.nonprofit_partner} · ` : ''}
                      {projectContributions.length} assigned
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <select
                      aria-label={`Status for ${project.title}`}
                      value={project.status}
                      onChange={(e) => updateStatus(project.id, e.target.value)}
                      className={`${FIELD} w-auto py-1.5 text-xs`}
                    >
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      aria-expanded={isExpanded}
                      className="tactile text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                    >
                      {isExpanded ? 'Hide' : 'Manage'}
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="tactile text-xs text-[var(--ink-faint)] transition-colors hover:text-[var(--danger)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex flex-col gap-6 border-t border-[var(--hairline)] bg-[var(--panel-sunk)] px-5 py-5">
                    <div>
                      <h3 className="text-sm font-medium text-[var(--ink)]">Assigned members</h3>
                      {projectContributions.length === 0 ? (
                        <p className="mt-2.5 text-sm text-[var(--ink-muted)]">
                          No members assigned yet.
                        </p>
                      ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                          {projectContributions.map((c) => (
                            <li
                              key={c.id}
                              className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--panel)] px-4 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[var(--ink)]">
                                  {c.profiles?.full_name}
                                </p>
                                <p className="truncate text-xs text-[var(--ink-muted)]">{c.role}</p>
                              </div>
                              <button
                                onClick={() => removeContribution(c.id)}
                                className="tactile shrink-0 text-xs text-[var(--ink-faint)] transition-colors hover:text-[var(--danger)]"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-[var(--ink)]">Assign a member</h3>
                      <div className="mt-3 flex flex-col gap-3">
                        <select
                          aria-label="Member to assign"
                          value={assignMember}
                          onChange={(e) => setAssignMember(e.target.value)}
                          className={FIELD}
                        >
                          <option value="">Select a member</option>
                          {members
                            .filter(m => !projectContributions.some(c => c.member_id === m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>{m.full_name}</option>
                            ))}
                        </select>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            aria-label="Role"
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            className={FIELD}
                          >
                            <option value="Volunteer">Volunteer</option>
                            <option value="Lead">Lead</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Officer">Officer</option>
                          </select>
                          <input
                            type="text"
                            aria-label="Contribution description"
                            value={assignDescription}
                            onChange={(e) => setAssignDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className={FIELD}
                          />
                        </div>

                        <button
                          onClick={() => handleAssign(project.id)}
                          disabled={assigning || !assignMember}
                          className={`${BTN_PRIMARY} self-start`}
                        >
                          {assigning ? 'Assigning...' : 'Assign member'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </Rows>
      </Panel>
    </div>
  )
}
