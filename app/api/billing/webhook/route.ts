import { NextResponse } from 'next/server'
import { findUserById, userKey, type StoredUser } from '@/lib/auth'
import { getJson, setJson } from '@/lib/store'
import { stripeCustomerKey, verifyWebhook } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

interface StripeEvent {
  type: string
  data: { object: Record<string, unknown> }
}

async function save(user: StoredUser, changes: Partial<StoredUser>) {
  await setJson(userKey(user.email), { ...user, ...changes })
}

async function userForCustomer(customerId: unknown, metadataUserId?: unknown) {
  if (typeof metadataUserId === 'string' && metadataUserId) {
    const user = await findUserById(metadataUserId)
    if (user) return user
  }
  if (typeof customerId !== 'string') return null
  const userId = await getJson<string>(stripeCustomerKey(customerId))
  return userId ? findUserById(userId) : null
}

/**
 * Stripe tells us when a membership starts, renews, lapses or is cancelled.
 * The membership state lives on the user record; lib/plans.ts reads it.
 */
export async function POST(request: Request) {
  const body = await request.text()
  if (!verifyWebhook(body, request.headers.get('stripe-signature'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const event = JSON.parse(body) as StripeEvent
  const object = event.data.object

  if (event.type === 'checkout.session.completed') {
    const user = await userForCustomer(object.customer, object.client_reference_id)
    if (user && typeof object.customer === 'string') {
      await setJson(stripeCustomerKey(object.customer), user.id)
      await save(user, {
        plan: 'pro',
        proUntil: undefined,
        stripeCustomerId: object.customer,
        stripeSubscriptionId: typeof object.subscription === 'string' ? object.subscription : user.stripeSubscriptionId,
      })
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const metadata = (object.metadata ?? {}) as Record<string, unknown>
    const user = await userForCustomer(object.customer, metadata.userId)
    if (user) {
      const status = String(object.status)
      const periodEnd = Number(
        object.current_period_end ??
          ((object.items as { data?: { current_period_end?: number }[] })?.data?.[0]?.current_period_end ?? 0),
      )
      const until = periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString()
      const live = status === 'active' || status === 'trialing' || status === 'past_due'
      await save(user, {
        plan: live || event.type === 'customer.subscription.updated' ? 'pro' : 'free',
        // Cancelled at period end (or ended): pro until the paid time runs out.
        proUntil: live && !object.cancel_at_period_end ? undefined : until,
        stripeSubscriptionId: typeof object.id === 'string' ? object.id : user.stripeSubscriptionId,
      })
    }
  }

  return NextResponse.json({ received: true })
}
