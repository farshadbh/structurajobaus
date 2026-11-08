import { NextResponse } from 'next/server'
import { NOT_CONFIGURED, clientIp, isCrossOrigin, tooMany } from '@/lib/api'
import { validateCredentials, unsubKey } from '@/lib/accounts'
import {
  createSessionToken,
  findUserByEmail,
  hashPassword,
  newId,
  sessionCookie,
  type StoredUser,
  userKey,
  userIdKey,
} from '@/lib/auth'
import { STORE_READY, hitCounter, setJson } from '@/lib/store'

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  if (!STORE_READY) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 })
  }

  // Cheap abuse guard: ten sign-ups per hour per network is generous for humans.
  const attempts = await hitCounter(`rl:register:${clientIp(request)}`, 3600)
  if (attempts > 10) return tooMany('Too many sign-ups from this network. Try again later.')

  const body = await request.json().catch(() => null)
  const result = validateCredentials(body)
  if (!result.ok) {
    return NextResponse.json({ error: result.errors[0], errors: result.errors }, { status: 422 })
  }

  const { email, password } = result.value
  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: 'An account with that email already exists. Sign in instead.' },
      { status: 409 },
    )
  }

  const user: StoredUser = {
    id: newId(),
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    // Alerts start off: nobody should receive email they did not switch on.
    digestEnabled: false,
    digestFrequency: 'weekly',
    unsubscribeToken: newId(20),
  }

  const saved = await setJson(userKey(user.email), user)
  const indexed = await setJson(userIdKey(user.id), user.email)
  await setJson(unsubKey(user.unsubscribeToken), user.id)

  if (!saved || !indexed) {
    return NextResponse.json(
      { error: 'Could not create the account. Please try again in a moment.' },
      { status: 502 },
    )
  }

  const response = NextResponse.json(
    { ok: true, user: { id: user.id, email: user.email } },
    { status: 201 },
  )
  response.cookies.set(sessionCookie.name, createSessionToken(user.id), sessionCookie.options)
  return response
}
