import { increment } from '@/lib/store'
import { getJobBySlug } from '@/lib/jobs'

/**
 * Records an apply click so outbound conversion can be measured per listing.
 * Fire-and-forget: the browser sends this with sendBeacon, so a failure here
 * must never block the user reaching the employer's page.
 */
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (origin && host && new URL(origin).host !== host) {
    return new Response(null, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug.slice(0, 160) : null

  if (!slug) return new Response(null, { status: 400 })

  const job = await getJobBySlug(slug)
  if (!job) return new Response(null, { status: 404 })

  // Counted in the same Redis as the accounts (no hosting-specific analytics):
  // per listing, and per month for the board as a whole.
  try {
    const month = new Date().toISOString().slice(0, 7)
    await Promise.all([
      increment(`stats:apply:${job.slug}`),
      increment(`stats:apply:month:${month}`),
      increment(`stats:apply:source:${job.source ?? 'direct'}`),
    ])
  } catch {
    // Analytics must never surface as a failure to the visitor.
  }

  return new Response(null, { status: 204 })
}
