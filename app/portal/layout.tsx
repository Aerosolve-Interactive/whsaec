import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/app/AppNav'

const LINKS = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/hours', label: 'My Hours' },
  { href: '/portal/projects', label: 'My Projects' },
]

export default async function PortalLayout({
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

  const role = profile?.role ?? 'member'
  const isStaff = role === 'admin' || role === 'officer'

  return (
    <div className="min-h-[100dvh] bg-[var(--page)]">
      <AppNav
        context="Portal"
        links={LINKS}
        fullName={profile?.full_name ?? 'Member'}
        role={role}
        extra={isStaff ? { href: '/admin', label: 'Admin' } : undefined}
      />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  )
}
