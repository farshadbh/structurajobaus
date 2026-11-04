import { NextResponse } from 'next/server'
import { isCrossOrigin } from '@/lib/api'
import { STRIPE_READY, stripe } from '@/lib/stripe'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

/** Opens Stripe's customer portal: change card, download invoices, cancel. */
export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const { user } = await viewer()
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!STRIPE_READY || !user.stripeCustomerId) {
    return NextResponse.json({ error: 'There is no paid membership on this account to manage.' }, { status: 404 })
  }

  try {
    const session = await stripe<{ url: string }>('/billing_portal/sessions', {
      customer: user.stripeCustomerId,
      return_url: `${new URL(request.url).origin}/account`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[billing/portal]', error)
    return NextResponse.json({ error: 'Could not open billing. Please try again.' }, { status: 502 })
  }
}
