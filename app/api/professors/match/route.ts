import { NextResponse } from 'next/server'
import { isCrossOrigin, tooMany } from '@/lib/api'
import { CLAUDE_READY, readCvWithClaude, scoreWithClaude, type CvReading } from '@/lib/claude'
import { keywordsToQuery, scoreMatch, type Keyword } from '@/lib/match'
import { OpenAlexError, searchProfessors, type RegionCode } from '@/lib/openalex'
import { hitCounter } from '@/lib/store'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const CLAUDE_RUNS_PER_DAY = Number(process.env.CLAUDE_MATCHES_PER_DAY || 15)

function cleanKeywords(input: unknown): Keyword[] {
  if (!Array.isArray(input)) return []
  return input
    .map((row) => ({
      term: String((row as Keyword)?.term ?? '').trim().slice(0, 80),
      weight: Number((row as Keyword)?.weight) || 1,
    }))
    .filter((kw) => kw.term.length > 1)
    .slice(0, 20)
}

/**
 * CV matching, paid members only.
 *
 * Two modes, chosen by the student on the page:
 *  - private: the browser extracts keywords from the CV and sends only those
 *    keywords; the CV itself never leaves the device;
 *  - Claude: the CV text is sent once, Claude reads it into a research profile
 *    and scores each candidate with a reason. The text is not stored.
 * Both search OpenAlex with the strongest keywords and return professors
 * ranked by match percentage.
 */
export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const { user, plan } = await viewer()
  if (plan !== 'pro' || !user) {
    return NextResponse.json(
      { error: 'CV matching is part of the paid membership.', upgrade: true },
      { status: 402 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    keywords?: unknown
    cvText?: string
    useClaude?: boolean
    region?: string
  } | null

  const regions: RegionCode[] = body?.region === 'AU' || body?.region === 'NZ' ? [body.region] : ['AU', 'NZ']
  const wantsClaude = Boolean(body?.useClaude && CLAUDE_READY && body?.cvText?.trim())

  let reading: CvReading | null = null
  if (wantsClaude) {
    const runs = await hitCounter(`rl:claude-match:${user.id}`, 24 * 3600)
    if (runs > CLAUDE_RUNS_PER_DAY) return tooMany('You have used today\'s AI matches. The private matching still works.')
    reading = await readCvWithClaude(String(body!.cvText).slice(0, 40_000))
  }

  const keywords = reading?.keywords.length ? reading.keywords : cleanKeywords(body?.keywords)
  if (keywords.length === 0) {
    return NextResponse.json(
      { error: 'No research keywords were found in the CV. Add a thesis or project section and try again.' },
      { status: 422 },
    )
  }

  try {
    const result = await searchProfessors({
      query: keywordsToQuery(keywords),
      regions,
      sort: 'relevance',
      pageSize: 30,
    })

    const claudeScores = reading ? await scoreWithClaude(reading, result.professors) : []
    const byId = new Map(claudeScores.map((row) => [row.id, row]))

    const matches = result.professors
      .map((person) => {
        const local = scoreMatch(keywords, person)
        const ai = byId.get(person.id)
        return {
          professor: person,
          match: ai ? { percent: ai.percent, shared: local.shared, reason: ai.reason } : local,
        }
      })
      .sort((a, b) => b.match.percent - a.match.percent)

    return NextResponse.json({
      mode: byId.size ? 'claude' : 'private',
      keywords,
      summary: reading?.summary ?? null,
      total: result.total,
      matches,
    })
  } catch (error) {
    console.error('[professors/match]', error)
    const message = error instanceof OpenAlexError ? error.message : 'Matching failed. Please try again.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/** Whether Claude matching is switched on, for the page to offer the option. */
export async function GET() {
  return NextResponse.json({ claude: CLAUDE_READY })
}
