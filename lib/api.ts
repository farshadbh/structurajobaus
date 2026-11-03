/* Shared plumbing for the account endpoints. */

export const NOT_CONFIGURED =
  'Accounts are not configured on this deployment yet. Add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and AUTH_SECRET to the Vercel project, then redeploy.'

/**
 * Every write checks that the browser sent it from our own origin. The session
 * cookie is SameSite=Lax already, but a JSON POST is cheap to guard twice.
 */
export function isCrossOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return false

  try {
    return new URL(origin).host !== host
  } catch {
    return true
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}

export function tooMany(error: string) {
  return Response.json({ error }, { status: 429 })
}

export function unauthorized() {
  return Response.json({ error: 'Sign in to manage your job alerts.' }, { status: 401 })
}
