'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/site/AuthShell'
import GoogleButton from '@/components/site/GoogleButton'

const FIELD =
  'w-full rounded-[10px] border border-[var(--hairline-strong)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition-colors focus:border-[var(--brand-sky)] focus:outline-none'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
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
      title="Create account"
      subtitle="Join the program and start logging hours."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--ink)] underline decoration-[var(--hairline-strong)] underline-offset-4 transition-colors hover:decoration-[var(--brand-sky)]"
          >
            Sign in
          </Link>
          <span className="mx-2 text-[var(--hairline-strong)]">|</span>
          <Link href="/" className="transition-colors hover:text-[var(--ink)]">
            Back to site
          </Link>
        </>
      }
    >
      <GoogleButton onClick={handleGoogle} disabled={loading} label="Sign up with Google" />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--hairline)]" />
        <span className="text-xs text-[var(--ink-muted)]">or</span>
        <span className="h-px flex-1 bg-[var(--hairline)]" />
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium text-[var(--ink)]">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={FIELD}
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={FIELD}
            placeholder="At least 6 characters"
          />
          <p className="text-xs text-[var(--ink-muted)]">Minimum 6 characters.</p>
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
