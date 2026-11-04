/*
 * The university-page check: finds a professor's staff page, reads it, and
 * reports what publication data cannot tell us -
 *   - the published email address;
 *   - whether they say they are taking new research students;
 *   - whether they mention funded positions or scholarships;
 *   - whether the page says Emeritus / retired / in memoriam.
 *
 * It runs when someone opens a professor (not as a nightly crawl of every
 * page), and the result is cached for 30 days, so each page is read at most
 * once a month however many students look at it.
 *
 * Every verdict carries the sentence it came from, so the student can see why
 * the site says "accepting students" instead of having to trust it. Nothing is
 * inferred from a name pattern: no published address means no address.
 */

import { getJson, setJsonEx } from './store'
import { institutionHomepage, type ProfessorSummary } from './openalex'

export type Signal = 'yes' | 'no' | 'unknown'

export interface ProfileCheck {
  checkedAt: string
  /** The staff page that was read, if one was found. */
  homepage: string | null
  /** Where we looked, for the "search the university site" fallback. */
  universitySite: string | null
  email: string | null
  title: string | null
  acceptingStudents: Signal
  funding: Signal
  /** Emeritus, retired or in memoriam: not someone to write to about a PhD. */
  inactive: boolean
  /** Sentences that triggered the verdicts above. */
  evidence: string[]
  /** How the verdict was reached. */
  method: 'rules' | 'claude' | 'none'
}

const CACHE_DAYS = 30
const cacheKey = (id: string) => `prof:v1:${id}`
const UA =
  'Mozilla/5.0 (compatible; SEJobsProfessorFinder/1.0; +https://structuraljobaus.vercel.app/professors)'

/* ------------------------------------------------------------- page fetch */

async function fetchText(url: string, timeoutMs = 9000): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
    if (!response.ok) return null
    const type = response.headers.get('content-type') ?? ''
    if (!type.includes('html') && !type.includes('text')) return null
    return (await response.text()).slice(0, 600_000)
  } catch {
    return null
  }
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#64;|&commat;/g, '@')
    .replace(/&#46;|&period;/g, '.')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

export function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}

const hostOf = (url: string | null) => {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** "uq.edu.au" from "researchers.uq.edu.au": the part a staff email shares. */
export function registrableDomain(host: string) {
  const parts = host.split('.')
  const twoLevel = /^(edu|ac|co|org|gov|govt)\.(au|nz|uk|jp|sg|hk)$/.test(parts.slice(-2).join('.'))
  return parts.slice(twoLevel ? -3 : -2).join('.')
}

/* --------------------------------------------------------- page discovery */

interface SearchHit {
  url: string
  title: string
}

/**
 * A web search restricted to the university's own domain. Brave's API is used
 * because it has a free tier and no scraping is involved; without a key the
 * check falls back to ORCID links only.
 */
async function siteSearch(name: string, domain: string): Promise<SearchHit[]> {
  const key = process.env.BRAVE_SEARCH_API_KEY
  if (!key) return []

  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', `"${name}" site:${domain}`)
  url.searchParams.set('count', '8')

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': key },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!response.ok) return []
    const data = (await response.json()) as { web?: { results?: { url: string; title: string }[] } }
    return (data.web?.results ?? []).map((hit) => ({ url: hit.url, title: hit.title }))
  } catch {
    return []
  }
}

interface OrcidPerson {
  'researcher-urls'?: { 'researcher-url'?: { url?: { value?: string } }[] }
  emails?: { email?: { email?: string }[] }
}

async function orcidPerson(orcid: string): Promise<OrcidPerson | null> {
  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/person`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 7 * 24 * 60 * 60 },
    })
    return response.ok ? ((await response.json()) as OrcidPerson) : null
  } catch {
    return null
  }
}

function nameParts(name: string) {
  const words = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1)
  return { first: words[0]?.toLowerCase() ?? '', last: words[words.length - 1]?.toLowerCase() ?? '' }
}

/** Profile-like URLs rank above news stories and PDFs that merely mention the name. */
function pageScore(hit: SearchHit, name: string) {
  const { first, last } = nameParts(name)
  const haystack = `${hit.url} ${hit.title}`.toLowerCase()
  let score = 0
  if (haystack.includes(last)) score += 3
  if (haystack.includes(first)) score += 2
  if (/(profile|people|staff|researcher|expert|academic|our-people|directory|person)/.test(hit.url)) score += 3
  if (/\.(pdf|docx?)$/i.test(hit.url)) score -= 5
  if (/(news|event|media|handbook|course|study|blog)/i.test(hit.url)) score -= 3
  return score
}

/* ---------------------------------------------------------- page reading */

const ACCEPTING = [
  /\b(currently|now|actively)?\s*(accepting|taking on|recruiting|looking for|seeking|welcom(e|ing)|interested in hearing from)\s+(new\s+|motivated\s+|prospective\s+|enthusiastic\s+){0,2}(phd|ph\.d\.|doctoral|hdr|higher degree by research|research|postgraduate|graduate|master'?s|mphil)\s+(students?|candidates?|applicants?)/i,
  /\bavailable (for|to) supervis/i,
  /\bopen to (new\s+)?(phd|hdr|research|postgraduate) (students?|candidates?|supervision)/i,
  /\b(phd|hdr|postgraduate) (positions?|opportunit(y|ies)) (are |is )?(available|open)/i,
  /\bsupervision available\b/i,
]

const NOT_ACCEPTING = [
  /\b(not|no longer)\s+(currently\s+)?(accepting|taking on|taking|recruiting|supervising)\s+(any\s+)?(new\s+)?(phd|hdr|research|graduate|postgraduate|doctoral)?\s*(students?|candidates?)/i,
  /\bnot available (for|to) supervis/i,
  /\b(unable|not able) to (take on|accept|supervise) (any )?(new )?(students?|candidates?)/i,
  /\bno (phd|hdr|postgraduate) (positions?|vacancies|openings) (are )?(currently )?available/i,
]

const FUNDING_YES = [
  /\b(fully[- ])?funded\s+(phd|ph\.d\.|doctoral|hdr|research|postgraduate)\s+(positions?|scholarships?|opportunit(y|ies)|projects?|places?|studentships?)/i,
  /\b(phd|hdr|postgraduate|research)\s+scholarships?\s+(are\s+|is\s+)?(currently\s+)?(available|on offer|open)/i,
  /\bscholarships? (are |is )?available\b/i,
  /\b(stipend|top[- ]up scholarship)\b/i,
]

const FUNDING_NO = [/\bno (funding|funded positions?|scholarships?) (is |are )?(currently )?available/i]

const INACTIVE = [
  /\b(professor|associate professor)?\s*emerit(us|a)\b/i,
  /\bretired\b/i,
  /\bin memoriam\b/i,
  /\bpassed away\b/i,
  /\b(1[89]\d\d|20[0-2]\d)\s*[-–]\s*(20[0-2]\d)\b.{0,20}\b(professor|dr)\b/i,
]

const TITLES =
  /\b(Distinguished Professor|Emeritus Professor|Professor|Associate Professor|Senior Lecturer|Lecturer|Senior Research Fellow|Research Fellow|Reader|Assistant Professor|Scientia Professor|Laureate Professor)\b/

function sentenceAround(text: string, index: number) {
  const start = Math.max(text.lastIndexOf('\n', index), text.lastIndexOf('. ', index), index - 220)
  const endCandidates = [text.indexOf('\n', index), text.indexOf('. ', index)].filter((n) => n > 0)
  const end = Math.min(index + 260, ...(endCandidates.length ? endCandidates : [index + 260]))
  return text.slice(Math.max(0, start + 1), end + 1).replace(/\s+/g, ' ').trim()
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (match) return sentenceAround(text, match.index)
  }
  return null
}

const EMAIL = /[a-z0-9][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}/gi

/** Mailto links, plain addresses and "name [at] uni [dot] edu" obfuscations. */
function emailsIn(html: string, text: string) {
  const found = new Set<string>()
  for (const match of html.matchAll(/mailto:([^"'?>\s]+)/gi)) found.add(decodeURIComponent(match[1]))
  for (const match of text.matchAll(EMAIL)) found.add(match[0])
  const deobfuscated = text
    .replace(/\s*[[(]\s*at\s*[\])]\s*/gi, '@')
    .replace(/\s*[[(]\s*dot\s*[\])]\s*/gi, '.')
  for (const match of deobfuscated.matchAll(EMAIL)) found.add(match[0])
  return [...found].map((email) => email.toLowerCase().replace(/\.$/, ''))
}

/** The address that belongs to this person at this university, or null. */
export function pickEmail(candidates: string[], name: string, domain: string | null) {
  const { first, last } = nameParts(name)
  const generic = /^(info|enquir|admin|reception|office|contact|hdr|research|future|study|media|web|library|help|support|no-?reply)/
  const ranked = candidates
    .filter((email) => !generic.test(email))
    .filter((email) => !domain || email.endsWith(domain) || email.split('@')[1]?.endsWith(`.${domain}`))
    .map((email) => {
      const local = email.split('@')[0]
      let score = 0
      if (last && local.includes(last)) score += 3
      if (first && local.includes(first)) score += 2
      if (first && local.startsWith(first[0]) && last && local.includes(last)) score += 1
      return { email, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.email ?? null
}

/** The rule-based reading of a staff page. Exported for tests. */
export function readProfilePage(html: string, name: string, domain: string | null) {
  const text = htmlToText(html)
  const evidence: string[] = []

  const notAccepting = firstMatch(text, NOT_ACCEPTING)
  const accepting = notAccepting ? null : firstMatch(text, ACCEPTING)
  if (notAccepting) evidence.push(notAccepting)
  if (accepting) evidence.push(accepting)

  const noFunding = firstMatch(text, FUNDING_NO)
  const funding = noFunding ? null : firstMatch(text, FUNDING_YES)
  if (noFunding) evidence.push(noFunding)
  if (funding) evidence.push(funding)

  // Only the top of the page decides "Emeritus": a reference list further down
  // can mention a retired co-author without saying anything about this person.
  const inactive = firstMatch(text.slice(0, 2500), INACTIVE)
  if (inactive) evidence.push(inactive)

  const title = TITLES.exec(text.slice(0, 4000))?.[0] ?? null

  return {
    text,
    email: pickEmail(emailsIn(html, text), name, domain),
    title,
    acceptingStudents: (notAccepting ? 'no' : accepting ? 'yes' : 'unknown') as Signal,
    funding: (noFunding ? 'no' : funding ? 'yes' : 'unknown') as Signal,
    inactive: Boolean(inactive),
    evidence: [...new Set(evidence)].slice(0, 4),
  }
}

/* ------------------------------------------------------------------ main */

export async function cachedCheck(id: string) {
  return getJson<ProfileCheck>(cacheKey(id))
}

export interface CheckOptions {
  /** A second reading of the page by Claude, for paid members. */
  refine?: (pageText: string, person: ProfessorSummary) => Promise<Partial<ProfileCheck> | null>
}

export async function checkProfile(person: ProfessorSummary, options: CheckOptions = {}): Promise<ProfileCheck> {
  const cached = await cachedCheck(person.id)
  // A rules-only reading is upgraded once when a paid member opens it with
  // Claude available; anything else is served from the cache.
  if (cached && !(cached.method === 'rules' && options.refine)) return cached

  const universitySite = await institutionHomepage(person.institution.id)
  const domain = universitySite ? registrableDomain(hostOf(universitySite) ?? '') : null

  // Candidate pages: links the researcher listed on ORCID first (they chose
  // them), then a search of the university's own site.
  const orcid = person.orcid ? await orcidPerson(person.orcid) : null
  const orcidUrls = (orcid?.['researcher-urls']?.['researcher-url'] ?? [])
    .map((entry) => entry.url?.value)
    .filter((url): url is string => Boolean(url))
  const orcidEmails = (orcid?.emails?.email ?? []).map((entry) => entry.email ?? '').filter(Boolean)

  const hits: SearchHit[] = [
    ...orcidUrls
      .filter((url) => !domain || hostOf(url)?.endsWith(domain))
      .map((url) => ({ url, title: person.name })),
    ...(domain ? await siteSearch(person.name, domain) : []),
  ]
  const ranked = hits
    .map((hit) => ({ hit, score: pageScore(hit, person.name) + (orcidUrls.includes(hit.url) ? 4 : 0) }))
    .filter((row) => row.score >= 4)
    .sort((a, b) => b.score - a.score)

  let result: ProfileCheck = {
    checkedAt: new Date().toISOString(),
    homepage: null,
    universitySite,
    email: pickEmail(orcidEmails, person.name, domain),
    title: null,
    acceptingStudents: 'unknown',
    funding: 'unknown',
    inactive: false,
    evidence: [],
    method: 'none',
  }

  for (const { hit } of ranked.slice(0, 3)) {
    const html = await fetchText(hit.url)
    if (!html) continue
    const reading = readProfilePage(html, person.name, domain)
    // A page that never names the person is a namesake or a listing; skip it.
    if (!reading.text.toLowerCase().includes(nameParts(person.name).last)) continue

    result = {
      ...result,
      homepage: hit.url,
      email: reading.email ?? result.email,
      title: reading.title,
      acceptingStudents: reading.acceptingStudents,
      funding: reading.funding,
      inactive: reading.inactive,
      evidence: reading.evidence,
      method: 'rules',
    }

    if (options.refine) {
      const refined = await options.refine(reading.text.slice(0, 12_000), person).catch(() => null)
      if (refined) result = { ...result, ...refined, method: 'claude' }
    }
    break
  }

  await setJsonEx(cacheKey(person.id), result, CACHE_DAYS * 24 * 60 * 60)
  return result
}
