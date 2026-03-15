'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    const { data, error } = await supabase.from('projects').insert({
      title, description,
      nonprofit_partner: partner,
      start_date: startDate || null,
      status,
      created_by: user?.id,
    }).select().single()
    if (!error && data) {
      setProjects(prev => [data, ...prev])
      setTitle(''); setDescription(''); setPartner(''); setStartDate(''); setStatus('active')
      setAdding(false)
    }
    setSubmitting(false)
  }

  async function handleAssign(projectId: string) {
    if (!assignMember) return
    setAssigning(true)
    const { data, error } = await supabase.from('project_contributions').insert({
      project_id: projectId,
      member_id: assignMember,
      role: assignRole,
      description: assignDescription || null,
    }).select('*, profiles(full_name)').single()
    if (!error && data) {
      setContributions(prev => [...prev, data])
      setAssignMember(''); setAssignRole('Volunteer'); setAssignDescription('')
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
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Manage projects and assign members.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {adding ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold mb-5">New Project</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Project name" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Nonprofit Partner</label>
                <input type="text" value={partner} onChange={(e) => setPartner(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="Organization name" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="What is this project about?" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors">
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Project'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No projects yet.</p>
        ) : projects.map((project) => {
          const projectContributions = contributions.filter(c => c.project_id === project.id)
          const isExpanded = expandedProject === project.id

          return (
            <div key={project.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {project.nonprofit_partner ? project.nonprofit_partner + ' · ' : ''}
                      {projectContributions.length} members assigned
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={project.status} onChange={(e) => updateStatus(project.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400 transition-colors">
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {isExpanded ? 'Hide' : 'Manage'}
                    </button>
                    <button onClick={() => deleteProject(project.id)}
                      className="text-xs text-gray-300 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-50 p-6 bg-gray-50 space-y-5">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Assigned Members</h4>
                    {projectContributions.length === 0 ? (
                      <p className="text-xs text-gray-400">No members assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {projectContributions.map((c) => (
                          <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5">
                            <div>
                              <p className="text-sm font-medium">{(c.profiles as any)?.full_name}</p>
                              <p className="text-xs text-gray-400">{c.role}</p>
                            </div>
                            <button onClick={() => removeContribution(c.id)}
                              className="text-xs text-gray-300 hover:text-red-500 transition-colors">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Assign Member</h4>
                    <div className="space-y-3">
                      <select value={assignMember} onChange={(e) => setAssignMember(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white">
                        <option value="">Select a member</option>
                        {members
                          .filter(m => !projectContributions.some(c => c.member_id === m.id))
                          .map((m) => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                          ))}
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white">
                          <option value="Volunteer">Volunteer</option>
                          <option value="Lead">Lead</option>
                          <option value="Organizer">Organizer</option>
                          <option value="Officer">Officer</option>
                        </select>
                        <input type="text" value={assignDescription} onChange={(e) => setAssignDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white" />
                      </div>
                      <button onClick={() => handleAssign(project.id)} disabled={assigning || !assignMember}
                        className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
                        {assigning ? 'Assigning...' : 'Assign Member'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}



