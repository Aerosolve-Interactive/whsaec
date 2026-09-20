import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback.
 *
 * @supabase/ssr uses the PKCE flow: Google redirects back here with a `?code=`
 * that has to be exchanged for a session server-side, which writes the auth
 * cookies. Sending Google straight to /portal/dashboard skips that exchange, so
 * no session cookie is ever set and proxy.ts bounces the user back to /login --
 * the classic "Continue with Google does nothing" loop.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  // Only allow relative paths through, so `next` can't be used as an open redirect.
  const requestedNext = searchParams.get('next')
  const next =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/portal/dashboard'

  const failTo = (message: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)

  // Google itself rejected the attempt (user cancelled, app misconfigured, ...).
  if (oauthError) {
    return failTo(oauthErrorDescription ?? oauthError)
  }

  if (!code) {
    return failTo('Google did not return an authorization code. Check that the Google provider is enabled in Supabase.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return failTo(error.message)
  }

  // Behind a proxy (Vercel) `origin` is the internal host, so prefer the
  // forwarded host for the post-login redirect.
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (process.env.NODE_ENV !== 'development' && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
