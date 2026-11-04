import Anthropic from '@anthropic-ai/sdk'
import type { ProfileCheck, Signal } from './enrich'
import type { Keyword } from './match'
import type { ProfessorSummary } from './openalex'

/*
 * Claude, for paid members only (the routes check the plan before calling
 * anything here):
 *  - reading a CV into research keywords and a one-paragraph profile;
 *  - scoring candidate professors against that profile, with a reason;
 *  - a second reading of a staff page, for the "accepting students" and
 *    "funding" verdicts that keyword rules get wrong.
 *
 * Every call uses structured outputs, so the reply is JSON that matches the
 * schema - no regex over prose. Without ANTHROPIC_API_KEY these helpers are
 * never called and paid members get the in-browser matching instead.
 */

export const CLAUDE_READY = Boolean(process.env.ANTHROPIC_API_KEY)
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5'

let client: Anthropic | null = null
function claude() {
  client ??= new Anthropic()
  return client
}

/** One structured-output call; returns the parsed JSON or null on any failure. */
async function structured<T>(system: string, user: string, schema: Record<string, unknown>, maxTokens = 4000) {
  try {
    const response = await claude().beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      // Short extraction and ranking jobs: low effort keeps them quick and cheap.
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      // A declined request is retried on Anthropic's recommended fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: user }],
    })
    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null
    const text = response.content.find((block) => block.type === 'text')
    return text && text.type === 'text' ? (JSON.parse(text.text) as T) : null
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('[claude] API error', error.status, error.message)
    } else {
      console.error('[claude] call failed', error)
    }
    return null
  }
}

/* ------------------------------------------------------------- CV reading */

export interface CvReading {
  summary: string
  fields: string[]
  keywords: Keyword[]
}

export async function readCvWithClaude(cvText: string): Promise<CvReading | null> {
  const result = await structured<{ summary: string; fields: string[]; keywords: { term: string; weight: number }[] }>(
    'You read a prospective PhD student\'s CV and describe their research profile for matching them with supervisors. Use only what the CV says. Keywords are specific research topics, methods and materials (e.g. "fibre-reinforced polymer", "finite element analysis", "seismic retrofit"), not soft skills, software names alone, or generic words like "engineering".',
    `CV text:\n\n${cvText}`,
    {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Two or three sentences on what the student has worked on and wants to research.' },
        fields: { type: 'array', items: { type: 'string' }, description: 'One to three broad fields, e.g. "Structural Engineering".' },
        keywords: {
          type: 'array',
          description: 'Eight to fifteen research keywords, most central first.',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              weight: { type: 'number', description: '1 (peripheral) to 10 (central to their work).' },
            },
            required: ['term', 'weight'],
            additionalProperties: false,
          },
        },
      },
      required: ['summary', 'fields', 'keywords'],
      additionalProperties: false,
    },
  )
  if (!result || !Array.isArray(result.keywords)) return null
  return {
    summary: result.summary,
    fields: result.fields.slice(0, 3),
    keywords: result.keywords
      .filter((kw) => kw.term?.trim())
      .slice(0, 15)
      .map((kw) => ({ term: kw.term.trim(), weight: Math.max(1, Math.min(10, kw.weight)) })),
  }
}

/* ---------------------------------------------------------------- scoring */

export interface ClaudeScore {
  id: string
  percent: number
  reason: string
}

export async function scoreWithClaude(reading: CvReading, people: ProfessorSummary[]) {
  const candidates = people.map((person) => ({
    id: person.id,
    topics: person.topics,
    recent_papers: person.recentWorks.slice(0, 6).map((work) => `${work.title} (${work.year})`),
  }))

  const result = await structured<{ scores: ClaudeScore[] }>(
    'You match a prospective PhD student with potential supervisors. For each candidate, judge how closely the candidate\'s research (topics and recent papers) fits the student\'s background and interests. 90-100: the student\'s main topic is the candidate\'s main topic. 70-89: strong overlap in methods or applications. 40-69: same field, partial overlap. Below 40: different area. Be calibrated and do not inflate scores. The reason is one short sentence naming the overlap the student should mention in an email.',
    `Student profile:\n${reading.summary}\nFields: ${reading.fields.join(', ')}\nKeywords: ${reading.keywords.map((kw) => kw.term).join(', ')}\n\nCandidates (JSON):\n${JSON.stringify(candidates)}`,
    {
      type: 'object',
      properties: {
        scores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              percent: { type: 'integer' },
              reason: { type: 'string' },
            },
            required: ['id', 'percent', 'reason'],
            additionalProperties: false,
          },
        },
      },
      required: ['scores'],
      additionalProperties: false,
    },
    8000,
  )
  const known = new Set(people.map((person) => person.id))
  return (result?.scores ?? [])
    .filter((row) => known.has(row.id))
    .map((row) => ({ ...row, percent: Math.max(0, Math.min(100, Math.round(row.percent))) }))
}

/* ------------------------------------------------------------ staff pages */

export async function readStaffPageWithClaude(
  pageText: string,
  person: ProfessorSummary,
): Promise<Partial<ProfileCheck> | null> {
  const result = await structured<{
    is_this_person: boolean
    title: string | null
    accepting_students: Signal
    funding: Signal
    inactive: boolean
    evidence: string[]
  }>(
    'You read a university staff profile page and report only what it states. "accepting_students" is "yes" only if the page says they are taking or welcome new research/PhD students or are available to supervise, "no" if it says they are not, otherwise "unknown". "funding" is "yes" only if it mentions funded positions, scholarships or stipends on offer, "no" if it says none are available, otherwise "unknown". "inactive" is true if the person is emeritus, retired or deceased. Evidence is the exact sentences you relied on, copied from the page.',
    `Researcher: ${person.name}, ${person.institution.name}\n\nPage text:\n${pageText}`,
    {
      type: 'object',
      properties: {
        is_this_person: { type: 'boolean', description: 'Whether this page is the profile of this researcher.' },
        title: { type: ['string', 'null'], description: 'Academic title as written, e.g. "Associate Professor".' },
        accepting_students: { type: 'string', enum: ['yes', 'no', 'unknown'] },
        funding: { type: 'string', enum: ['yes', 'no', 'unknown'] },
        inactive: { type: 'boolean' },
        evidence: { type: 'array', items: { type: 'string' } },
      },
      required: ['is_this_person', 'title', 'accepting_students', 'funding', 'inactive', 'evidence'],
      additionalProperties: false,
    },
  )
  if (!result || !result.is_this_person) return null
  return {
    title: result.title,
    acceptingStudents: result.accepting_students,
    funding: result.funding,
    inactive: result.inactive,
    evidence: result.evidence.slice(0, 4),
  }
}
