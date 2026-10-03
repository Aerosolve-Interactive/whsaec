'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/site/AuthShell'
import GoogleButton from '@/components/site/GoogleButton'

const FIELD =
  'w-full rounded-[10px] border border-[var(--hairline-strong)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition-colors focus:border-[var(--brand-sky)] focus:outline-none'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Surface anything /auth/callback bounced back here, then clean the URL so a
  // refresh doesn't keep showing a stale error. Read from window rather than
  // useSearchParams so this page can stay statically rendered without a
  // Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('error')
    if (callbackError) {
      setError(callbackError)
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/portal/dashboard')
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard`,
      },
    })
    // On success the browser navigates to Google, so this only runs on failure.
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          No account yet?{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--ink)] underline decoration-[var(--hairline-strong)] underline-offset-4 transition-colors hover:decoration-[var(--brand-sky)]"
          >
            Create one
          </Link>
          <span className="mx-2 text-[var(--hairline-strong)]">|</span>
          <Link href="/" className="transition-colors hover:text-[var(--ink)]">
            Back to site
          </Link>
        </>
      }
    >
      <GoogleButton onClick={handleGoogle} disabled={loading} />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--hairline)]" />
        <span className="text-xs text-[var(--ink-muted)]">or</span>
        <span className="h-px flex-1 bg-[var(--hairline)]" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={FIELD}
            placeholder="you@email.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={FIELD}
            placeholder="Your password"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-[10px] bg-[var(--danger-wash)] px-4 py-2.5 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tactile mt-1 w-full rounded-full bg-[var(--brand-navy)] py-3 text-sm font-medium text-white hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
