import { NextResponse } from 'next/server'
import { NOT_CONFIGURED, clientIp, isCrossOrigin, tooMany } from '@/lib/api'
import { validateCredentials } from '@/lib/accounts'
import {
  AUTH_READY,
  createSessionToken,
  findUserByEmail,
  sessionCookie,
  verifyPassword,
} from '@/lib/auth'
import { STORE_READY, hitCounter } from '@/lib/store'

const WRONG = 'Email or password is incorrect.'

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  if (!STORE_READY || !AUTH_READY) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 })
  }

  // Ten tries per quarter hour, per network. Slow enough to make guessing pointless.
  const attempts = await hitCounter(`rl:login:${clientIp(request)}`, 900)
  if (attempts > 10) return tooMany('Too many sign-in attempts. Please wait 15 minutes.')

  const body = await request.json().catch(() => null)
  const result = validateCredentials(body)
  if (!result.ok) return NextResponse.json({ error: WRONG }, { status: 401 })

  const user = await findUserByEmail(result.value.email)
  if (!user) return NextResponse.json({ error: WRONG }, { status: 401 })

  if (!(await verifyPassword(result.value.password, user.passwordHash))) {
    return NextResponse.json({ error: WRONG }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } })
  response.cookies.set(sessionCookie.name, createSessionToken(user.id), sessionCookie.options)
  return response
}
