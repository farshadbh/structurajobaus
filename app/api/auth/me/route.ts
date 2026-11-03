import { NextResponse } from 'next/server'
import { AUTH_READY, getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Who is signed in, for the header. Reading the session here rather than in the
 * root layout keeps every page statically rendered: the header asks once from
 * the browser instead of making the whole site dynamic.
 */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }

  if (!AUTH_READY) return NextResponse.json({ email: null }, { headers })

  try {
    const user = await getCurrentUser()
    return NextResponse.json({ email: user?.email ?? null }, { headers })
  } catch {
    return NextResponse.json({ email: null }, { headers })
  }
}
