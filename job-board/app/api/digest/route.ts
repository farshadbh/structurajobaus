import { NextResponse } from 'next/server'
import { isCrossOrigin, unauthorized } from '@/lib/api'
import { validateDigest } from '@/lib/accounts'
import { DIGEST_USERS_KEY, getCurrentUser, userKey } from '@/lib/auth'
import { addToSet, removeFromSet, setJson } from '@/lib/store'

/**
 * Turns the email digest on or off for the signed-in account.
 *
 * The `digest:users` set is the work queue the GitHub Actions job reads, so the
 * scheduled run never has to scan every account ever created.
 */
export async function PUT(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const body = await request.json().catch(() => null)
  const result = validateDigest(body)
  if (!result.ok) {
    return NextResponse.json({ error: result.errors[0], errors: result.errors }, { status: 422 })
  }

  const updated = {
    ...user,
    digestEnabled: result.value.enabled,
    digestFrequency: result.value.frequency,
  }

  if (!(await setJson(userKey(user.email), updated))) {
    return NextResponse.json({ error: 'Could not save your preferences. Please try again.' }, { status: 502 })
  }

  if (result.value.enabled) await addToSet(DIGEST_USERS_KEY, user.id)
  else await removeFromSet(DIGEST_USERS_KEY, user.id)

  return NextResponse.json({
    ok: true,
    digest: { enabled: updated.digestEnabled, frequency: updated.digestFrequency },
  })
}
