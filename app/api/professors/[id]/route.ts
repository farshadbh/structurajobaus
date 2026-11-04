import { NextResponse } from 'next/server'
import { clientIp, tooMany } from '@/lib/api'
import { CLAUDE_READY, readStaffPageWithClaude } from '@/lib/claude'
import { checkProfile } from '@/lib/enrich'
import { grantAllows } from '@/lib/grant'
import { OpenAlexError, getProfessor } from '@/lib/openalex'
import { hitCounter } from '@/lib/store'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
// Reading a staff page can take a few seconds on a slow university server.
export const maxDuration = 60

type Context = { params: Promise<{ id: string }> }

/**
 * One professor in full: profile, recent papers, and the university-page check
 * (email, accepting students, funding, emeritus). Paid members can open anyone;
 * free members only the professors their search showed them (the signed grant).
 */
export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  const grant = new URL(request.url).searchParams.get('grant')
  const { plan } = await viewer()

  if (plan === 'free') {
    if (!grantAllows(grant, id)) {
      return NextResponse.json(
        { error: 'This professor is part of the paid membership.', upgrade: true },
        { status: 402 },
      )
    }
    const hits = await hitCounter(`rl:prof-check:${clientIp(request)}`, 3600)
    if (hits > 20) return tooMany('Too many profile checks from this network. Try again in an hour.')
  }

  try {
    const { summary, active } = await getProfessor(id)
    const check = await checkProfile(summary, {
      refine: plan === 'pro' && CLAUDE_READY ? readStaffPageWithClaude : undefined,
    })
    return NextResponse.json({ professor: summary, active: active && !check.inactive, check })
  } catch (error) {
    console.error('[professors/id]', error)
    const message = error instanceof OpenAlexError ? error.message : 'Could not load this professor.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
