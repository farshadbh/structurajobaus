import { NextResponse } from 'next/server'
import { isCrossOrigin } from '@/lib/api'
import { SITE_URL } from '@/lib/format'
import { STRIPE_READY, stripe } from '@/lib/stripe'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

/** Starts a Stripe Checkout subscription for the signed-in member. */
export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const { user, plan } = await viewer()
  if (!user) return NextResponse.json({ error: 'Create an account or sign in first.', signIn: true }, { status: 401 })
  if (plan === 'pro') return NextResponse.json({ error: 'Your membership is already active.' }, { status: 409 })
  if (!STRIPE_READY) {
    return NextResponse.json({ error: 'Payments are not open yet. Please check back soon.' }, { status: 503 })
  }

  const origin = new URL(request.url).origin || SITE_URL
  try {
    const session = await stripe<{ url: string }>('/checkout/sessions', {
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: user.id,
      ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
      subscription_data: { metadata: { userId: user.id } },
      metadata: { userId: user.id },
      allow_promotion_codes: true,
      success_url: `${origin}/account?upgraded=1`,
      cancel_url: `${origin}/pricing?cancelled=1`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[billing/checkout]', error)
    return NextResponse.json({ error: 'Could not start the payment. Please try again.' }, { status: 502 })
  }
}
