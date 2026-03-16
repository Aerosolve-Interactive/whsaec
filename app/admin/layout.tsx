import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['officer', 'admin'].includes(profile.role)) {
    redirect('/portal/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">WHS AeroSolve Interactive</Link>
          <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Overview</Link>
          <Link href="/admin/hours" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Hours</Link>
          <Link href="/admin/members" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Members</Link>
          <Link href="/admin/projects" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Projects</Link>
          <Link href="/portal/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Back to Portal</Link>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}


