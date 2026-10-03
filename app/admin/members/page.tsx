'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, Panel, Pill, Rows, FIELD } from '@/components/app/ui'

interface Member {
  id: string
  full_name: string
  email: string
  role: string
  grade: number | null
  join_date: string
  created_at: string
}

export default function AdminMembersPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Only admins may change roles or remove members. Officers can see the
  // roster and work with hours, but role and deletion controls are theirs to
  // read, not to use -- enforced by the profiles_protect_role trigger and the
  // "admins can delete profiles" policy, mirrored here so officers get a clear
  // state instead of a failed request.
  const isAdmin = currentRole === 'admin'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const [membersRes, meRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        user
          ? supabase.from('profiles').select('role').eq('id', user.id).single()
          : Promise.resolve({ data: null }),
      ])

      setMembers(membersRes.data ?? [])
      setCurrentRole((meRes.data as { role?: string } | null)?.role ?? null)
      setLoading(false)
    }
    load()
  }, [])

  async function updateRole(id: string, role: string) {
    setError('')
    const previous = members.find(m => m.id === id)?.role
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, role } : m)))

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (updateError) {
      // Roll the optimistic change back so the UI can't claim a change the
      // database refused.
      setMembers(prev => prev.map(m => (m.id === id ? { ...m, role: previous ?? m.role } : m)))
      setError(updateError.message)
    }
  }

  async function deleteMember(id: string) {
    setError('')
    if (!confirm('Delete this member? This cannot be undone.')) return

    const { error: deleteError } = await supabase.from('profiles').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Members"
        subtitle={
          <>
            {members.length} total
            {currentRole && !isAdmin && '. Roles and removal are admin-only.'}
          </>
        }
      />

      {error && (
        <p
          role="alert"
          className="rounded-[10px] bg-[var(--danger-wash)] px-4 py-2.5 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <Panel>
        <Rows loading={loading} empty={!loading && members.length === 0 ? 'No members yet.' : undefined}>
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-medium text-white">
                  {member.full_name?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">
                    {member.full_name}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-xs font-normal text-[var(--ink-faint)]">you</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--ink-muted)]">{member.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {isAdmin && member.id !== currentUserId ? (
                  <select
                    aria-label={`Role for ${member.full_name}`}
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value)}
                    className={`${FIELD} w-auto py-1.5 text-xs`}
                  >
                    <option value="member">member</option>
                    <option value="officer">officer</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span
                    title={
                      member.id === currentUserId
                        ? 'You cannot change your own role. Ask another admin.'
                        : 'Only an admin can change member roles.'
                    }
                  >
                    <Pill tone={member.role === 'admin' || member.role === 'officer' ? 'info' : 'neutral'}>
                      {member.role}
                    </Pill>
                  </span>
                )}

                {isAdmin && member.id !== currentUserId && (
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="tactile text-xs text-[var(--ink-faint)] transition-colors hover:text-[var(--danger)]"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </Rows>
      </Panel>
    </div>
  )
}
