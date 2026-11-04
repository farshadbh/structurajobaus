import { createHmac, timingSafeEqual } from 'node:crypto'

/*
 * Stripe over its REST API, in the same spirit as lib/store.ts: a handful of
 * form-encoded requests do not justify the SDK and a lockfile change.
 *
 * Needed in the hosting environment:
 *   STRIPE_SECRET_KEY      sk_live_... (or sk_test_... for the trial run)
 *   STRIPE_PRICE_ID        price_... of the monthly membership
 *   STRIPE_WEBHOOK_SECRET  whsec_... from the webhook endpoint
 * Without them the pricing page says payments are not open yet.
 */

export const STRIPE_READY = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID)

/** Stripe's nested form encoding: { a: { b: 1 } } -> a[b]=1. */
function encode(params: Record<string, unknown>, prefix = '', out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const name = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') encode(item as Record<string, unknown>, `${name}[${index}]`, out)
        else out.append(`${name}[${index}]`, String(item))
      })
    } else if (typeof value === 'object') {
      encode(value as Record<string, unknown>, name, out)
    } else {
      out.append(name, String(value))
    }
  }
  return out
}

export async function stripe<T>(path: string, params: Record<string, unknown> = {}, method = 'POST'): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method === 'GET' ? undefined : encode(params),
    cache: 'no-store',
  })
  const data = (await response.json()) as T & { error?: { message?: string } }
  if (!response.ok) throw new Error(data.error?.message ?? `Stripe answered ${response.status}`)
  return data
}

/**
 * Checks the Stripe-Signature header: HMAC-SHA256 over "timestamp.body" with
 * the endpoint secret, and a timestamp no older than five minutes.
 */
export function verifyWebhook(body: string, header: string | null, toleranceSeconds = 300) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !header) return false

  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...rest] = part.split('=')
      return [key.trim(), rest.join('=')]
    }),
  )
  const timestamp = Number(parts.t)
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false

  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  const signatures = header
    .split(',')
    .filter((part) => part.trim().startsWith('v1='))
    .map((part) => part.trim().slice(3))

  return signatures.some(
    (signature) =>
      signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)),
  )
}

export const stripeCustomerKey = (customerId: string) => `stripe:customer:${customerId}`
