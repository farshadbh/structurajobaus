import { NextResponse } from 'next/server'
import { clientIp, tooMany } from '@/lib/api'
import { createGrant } from '@/lib/grant'
import { OpenAlexError, searchProfessors, type RegionCode, type SortOrder } from '@/lib/openalex'
import { FREE_VISIBLE } from '@/lib/plans'
import { hitCounter } from '@/lib/store'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

function regionsFrom(value: string | null): RegionCode[] {
  if (value === 'AU' || value === 'NZ') return [value]
  return ['AU', 'NZ']
}

/**
 * Keyword search for active professors in Australia and New Zealand.
 *
 * Free members and visitors get page 1 only, with the first FREE_VISIBLE
 * professors in full and a count of the rest, which the page shows blurred.
 * The hidden professors' details never leave the server.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const query = params.get('q')?.trim() ?? ''
  const sort: SortOrder = params.get('sort') === 'relevance' ? 'relevance' : 'citations'
  const page = Math.max(1, Number(params.get('page')) || 1)
  if (query.length < 2) {
    return NextResponse.json({ error: 'Type a research topic of at least two letters.' }, { status: 422 })
  }

  const { plan } = await viewer()

  if (plan === 'free') {
    const hits = await hitCounter(`rl:prof-search:${clientIp(request)}`, 3600)
    if (hits > 40) return tooMany('Too many searches from this network. Try again in an hour.')
    if (page > 1) {
      return NextResponse.json(
        { error: 'More results are part of the paid membership.', upgrade: true },
        { status: 402 },
      )
    }
  }

  try {
    const result = await searchProfessors({
      query,
      regions: regionsFrom(params.get('region')),
      sort,
      page,
      pageSize: 20,
    })

    if (plan === 'pro') {
      return NextResponse.json({ ...result, plan, locked: 0, grant: null })
    }

    const visible = result.professors.slice(0, FREE_VISIBLE)
    return NextResponse.json({
      ...result,
      plan,
      professors: visible,
      // How many more were found, so the page can show that many blurred cards.
      locked: Math.max(0, result.total - visible.length),
      grant: createGrant(visible.map((person) => person.id)),
    })
  } catch (error) {
    const message = error instanceof OpenAlexError ? error.message : 'The search failed. Please try again.'
    console.error('[professors/search]', error)
    return NextResponse.json({ error: message }, { status: error instanceof OpenAlexError ? 502 : 500 })
  }
}
