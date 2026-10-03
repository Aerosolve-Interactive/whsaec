import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/app/AppNav'

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/hours', label: 'Hours' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/projects', label: 'Projects' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['officer', 'admin'].includes(profile.role)) {
    redirect('/portal/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--page)]">
      <AppNav
        context="Admin"
        links={LINKS}
        fullName={profile.full_name ?? 'Member'}
        role={profile.role}
        extra={{ href: '/portal/dashboard', label: 'Back to portal' }}
      />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  )
}
