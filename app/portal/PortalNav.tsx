'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  fullName: string
  role: string
}

export default function PortalNav({ fullName, role }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg tracking-tight">WHSAEC</Link>

      <div className="flex items-center gap-6">
        <Link href="/portal/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <Link href="/portal/hours" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          My Hours
        </Link>
        <Link href="/portal/projects" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          My Projects
        </Link>
        {(role === 'admin' || role === 'officer') && (
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Admin
          </Link>
        )}

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 pl-4 border-l border-gray-100 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <span>{fullName.split(' ')[0]}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-sm py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-400 capitalize">{role}</p>
              </div>
              <Link
                href="/portal/dashboard"
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}




