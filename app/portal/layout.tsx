import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PortalNav from "./PortalNav"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav
        fullName={profile?.full_name ?? 'Member'}
        role={profile?.role ?? 'member'}
      />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}


