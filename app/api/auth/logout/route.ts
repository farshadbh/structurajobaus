import { NextResponse } from 'next/server'
import { isCrossOrigin } from '@/lib/api'
import { sessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(sessionCookie.name, '', { ...sessionCookie.options, maxAge: 0 })
  return response
}
