/*
 * Professor search over OpenAlex (https://openalex.org) - the open index of
 * scholarly authors, works and institutions.
 *
 * Why OpenAlex and not Google Scholar: Scholar has no API, its terms forbid
 * automated access and it blocks scrapers within a few requests. OpenAlex has
 * the same raw material - who published what, where they work now, how often
 * they are cited - as a free JSON API, so a search here behaves like a Scholar
 * label page ("most-cited people working on X") without breaking anything.
 *
 * "Active" is decided from the data, not guessed:
 *  - the author's most recent institution is a university in the chosen
 *    country (people who moved abroad or into industry drop out);
 *  - they published in the current or previous year (retired, deceased and
 *    departed academics stop publishing, so they drop out);
 *  - they have a research track record (h-index and output thresholds), which
 *    keeps PhD students and one-paper co-authors out of a supervisor list.
 * The university-page check in lib/enrich.ts then catches what publication
 * data cannot: "Emeritus", "not taking students", and so on.
 */

const BASE = (process.env.OPENALEX_BASE_URL || 'https://api.openalex.org').replace(/\/+$/, '')
const DAY = 24 * 60 * 60

export type RegionCode = 'AU' | 'NZ'

export const REGIONS: { code: RegionCode; name: string; flag: string }[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
]

export interface RecentWork {
  title: string
  year: number
  url: string | null
  venue: string | null
}

export interface ProfessorSummary {
  /** OpenAlex author id, e.g. "A5023888391". */
  id: string
  name: string
  orcid: string | null
  institution: {
    id: string
    name: string
    country: RegionCode
  }
  worksCount: number
  citations: number
  hIndex: number
  /** Most frequent research topics, most frequent first. */
  topics: string[]
  /** Broader fields the topics sit in ("Civil and Structural Engineering"). */
  fields: string[]
  /** Papers on the searched topic since the activity window opened. */
  matchingWorks: number
  /** Latest year with at least one publication. */
  lastActiveYear: number
  recentWorks: RecentWork[]
}

export type SortOrder = 'citations' | 'relevance'

export interface SearchOptions {
  query: string
  regions: RegionCode[]
  sort?: SortOrder
  page?: number
  pageSize?: number
}

export interface SearchResult {
  query: string
  total: number
  page: number
  pageSize: number
  professors: ProfessorSummary[]
}

export class OpenAlexError extends Error {}

/* ------------------------------------------------------------------ fetch */

function withAuth(url: URL) {
  // OpenAlex asks API users for a contact address (the "polite pool") and, on
  // paid or high-volume plans, an API key. Both are optional here.
  if (process.env.OPENALEX_API_KEY) url.searchParams.set('api_key', process.env.OPENALEX_API_KEY)
  if (process.env.OPENALEX_MAILTO) url.searchParams.set('mailto', process.env.OPENALEX_MAILTO)
  return url
}

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = withAuth(new URL(BASE + path))
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  let response: Response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'se-jobs-professor-finder' },
      // Search results change slowly; a day of caching keeps us far inside the
      // free quota and makes repeat searches instant.
      next: { revalidate: DAY },
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    throw new OpenAlexError(`OpenAlex could not be reached (${(error as Error).message}).`)
  }

  if (response.status === 429) {
    throw new OpenAlexError(
      process.env.OPENALEX_API_KEY
        ? 'The professor search has reached its daily limit. Please try again tomorrow.'
        : 'The professor search is not configured yet (OPENALEX_API_KEY is missing).',
    )
  }
  if (!response.ok) {
    throw new OpenAlexError(`OpenAlex answered ${response.status} for ${path}.`)
  }
  return (await response.json()) as T
}

/* ------------------------------------------------------------- raw shapes */

interface RawGroup {
  key: string
  key_display_name: string
  count: number
}

interface RawInstitution {
  id: string
  display_name: string
  country_code: string | null
  type: string | null
}

interface RawAuthor {
  id: string
  display_name: string
  orcid: string | null
  works_count: number
  cited_by_count: number
  summary_stats?: { h_index?: number }
  last_known_institutions?: RawInstitution[] | null
  topics?: { display_name: string; count: number; field?: { display_name: string } }[]
  counts_by_year?: { year: number; works_count: number }[]
}

interface RawWork {
  id: string
  title: string | null
  display_name?: string | null
  publication_year: number
  doi: string | null
  type?: string | null
  primary_location?: { source?: { display_name?: string } | null; landing_page_url?: string | null } | null
}

/* ----------------------------------------------------------------- tuning */

const THIS_YEAR = new Date().getFullYear()
/** Papers from this year on count towards relevance; older work does not. */
const RELEVANCE_FROM = THIS_YEAR - 3
/** A publication in this year or later means "still active". */
const ACTIVE_FROM = THIS_YEAR - 1
/** Below this the profile is most likely a student or a one-off co-author. */
const MIN_H_INDEX = Number(process.env.FINDER_MIN_H_INDEX || 10)
const MIN_WORKS = Number(process.env.FINDER_MIN_WORKS || 20)
/** How many candidate authors are pulled per search before filtering. */
const CANDIDATES = 200

const bareId = (url: string) => url.replace(/^https?:\/\/openalex\.org\//, '')

function cleanQuery(query: string) {
  return query.replace(/[^\p{L}\p{N}\s\-'"()]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
}

function toSummary(raw: RawAuthor, region: RawInstitution, matchingWorks: number): ProfessorSummary {
  const lastActiveYear = Math.max(
    0,
    ...(raw.counts_by_year ?? []).filter((row) => row.works_count > 0).map((row) => row.year),
  )
  const topics = (raw.topics ?? []).slice(0, 6).map((topic) => topic.display_name)
  const fields = [
    ...new Set((raw.topics ?? []).map((topic) => topic.field?.display_name).filter(Boolean) as string[]),
  ].slice(0, 3)

  return {
    id: bareId(raw.id),
    name: raw.display_name,
    orcid: raw.orcid ? raw.orcid.replace(/^https?:\/\/orcid\.org\//, '') : null,
    institution: {
      id: bareId(region.id),
      name: region.display_name,
      country: (region.country_code?.toUpperCase() ?? 'AU') as RegionCode,
    },
    worksCount: raw.works_count,
    citations: raw.cited_by_count,
    hIndex: raw.summary_stats?.h_index ?? 0,
    topics,
    fields,
    matchingWorks,
    lastActiveYear,
    recentWorks: [],
  }
}

/** The author's current university in one of the chosen countries, if any. */
function currentUniversity(raw: RawAuthor, regions: RegionCode[]) {
  return (raw.last_known_institutions ?? []).find(
    (inst) =>
      inst.type === 'education' &&
      regions.includes((inst.country_code ?? '').toUpperCase() as RegionCode),
  )
}

function isActive(raw: RawAuthor) {
  return (raw.counts_by_year ?? []).some((row) => row.year >= ACTIVE_FROM && row.works_count > 0)
}

function isEstablished(raw: RawAuthor) {
  return (raw.summary_stats?.h_index ?? 0) >= MIN_H_INDEX && raw.works_count >= MIN_WORKS
}

/* ----------------------------------------------------------------- search */

/**
 * Everyone in the chosen countries who has recently published on the query,
 * filtered down to active, established university researchers.
 *
 * Two requests find the candidates, whatever the page:
 *  1. works matching the query, from the last few years, with an author at a
 *     university in the region - grouped by author, which gives each person's
 *     number of matching papers;
 *  2. those authors' profiles, in batches of 50.
 * A third set of small requests then fetches recent papers for the page shown.
 */
async function candidates(query: string, regions: RegionCode[]) {
  const countries = regions.map((code) => code.toLowerCase()).join('|')

  const grouped = await getJson<{ group_by: RawGroup[] }>('/works', {
    search: query,
    filter: [
      `authorships.institutions.country_code:${countries}`,
      `authorships.institutions.type:education`,
      `from_publication_date:${RELEVANCE_FROM}-01-01`,
    ].join(','),
    group_by: 'authorships.author.id',
    per_page: String(CANDIDATES),
  })

  const counts = new Map<string, number>()
  for (const group of grouped.group_by ?? []) {
    if (!group.key || group.key === 'unknown') continue
    counts.set(bareId(group.key), group.count)
  }

  const ids = [...counts.keys()].slice(0, CANDIDATES)
  const authors: RawAuthor[] = []
  const select = [
    'id',
    'display_name',
    'orcid',
    'works_count',
    'cited_by_count',
    'summary_stats',
    'last_known_institutions',
    'topics',
    'counts_by_year',
  ].join(',')

  for (let start = 0; start < ids.length; start += 50) {
    const batch = ids.slice(start, start + 50)
    const page = await getJson<{ results: RawAuthor[] }>('/authors', {
      filter: `openalex:${batch.join('|')}`,
      per_page: '50',
      select,
    })
    authors.push(...(page.results ?? []))
  }

  const professors: ProfessorSummary[] = []
  for (const raw of authors) {
    const university = currentUniversity(raw, regions)
    if (!university || !isActive(raw) || !isEstablished(raw)) continue
    professors.push(toSummary(raw, university, counts.get(bareId(raw.id)) ?? 0))
  }
  return professors
}

/** The few latest papers of one author, newest first. */
export async function recentWorks(authorId: string, limit = 4): Promise<RecentWork[]> {
  const data = await getJson<{ results: RawWork[] }>('/works', {
    filter: `author.id:${authorId},from_publication_date:${THIS_YEAR - 4}-01-01,type:article|review|book-chapter|preprint|book`,
    sort: 'publication_date:desc',
    per_page: String(Math.min(25, limit + 6)),
    select: 'id,title,display_name,publication_year,doi,type,primary_location',
  })

  const seen = new Set<string>()
  const works: RecentWork[] = []
  for (const work of data.results ?? []) {
    const title = (work.title ?? work.display_name ?? '').replace(/<[^>]+>/g, '').trim()
    // Errata and duplicate preprints repeat a title; one copy is enough.
    const key = title.toLowerCase()
    if (!title || seen.has(key) || /^(erratum|correction|corrigendum)\b/i.test(title)) continue
    seen.add(key)
    works.push({
      title,
      year: work.publication_year,
      url: work.doi ?? work.primary_location?.landing_page_url ?? null,
      venue: work.primary_location?.source?.display_name ?? null,
    })
    if (works.length >= limit) break
  }
  return works
}

async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const out: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      out[index] = await task(items[index])
    }
  })
  await Promise.all(workers)
  return out
}

/** Recent papers for each professor shown, a few requests at a time. */
export async function withRecentWorks(professors: ProfessorSummary[], limit = 4) {
  return mapLimit(professors, 5, async (person) => ({
    ...person,
    recentWorks: await recentWorks(person.id, limit).catch(() => []),
  }))
}

export async function searchProfessors(options: SearchOptions): Promise<SearchResult> {
  const query = cleanQuery(options.query)
  if (query.length < 2) throw new OpenAlexError('Type a research topic of at least two letters.')

  const regions = options.regions.length ? options.regions : (['AU', 'NZ'] as RegionCode[])
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 50)
  const page = Math.max(options.page ?? 1, 1)

  const all = await candidates(query, regions)

  // "citations" is the Scholar-label order; "relevance" puts the people who
  // publish most on this exact topic first and breaks ties on citations.
  all.sort((a, b) =>
    options.sort === 'relevance'
      ? b.matchingWorks - a.matchingWorks || b.citations - a.citations
      : b.citations - a.citations,
  )

  const slice = all.slice((page - 1) * pageSize, page * pageSize)
  return {
    query,
    total: all.length,
    page,
    pageSize,
    professors: await withRecentWorks(slice),
  }
}

/** One author, for the profile check and for matching. */
export async function getProfessor(authorId: string, regions: RegionCode[] = ['AU', 'NZ']) {
  if (!/^A\d{4,12}$/.test(authorId)) throw new OpenAlexError('Not an OpenAlex author id.')
  const raw = await getJson<RawAuthor>(`/authors/${authorId}`, {})
  const university = currentUniversity(raw, regions) ?? raw.last_known_institutions?.[0]
  if (!university) throw new OpenAlexError('This researcher has no current institution on record.')
  const summary = toSummary(raw, university, 0)
  summary.recentWorks = await recentWorks(authorId, 8).catch(() => [])
  return { summary, active: isActive(raw) && Boolean(currentUniversity(raw, regions)) }
}

/** The institution's website, used to tell a real staff page from a namesake. */
export async function institutionHomepage(institutionId: string): Promise<string | null> {
  const data = await getJson<{ homepage_url?: string | null }>(`/institutions/${institutionId}`, {
    select: 'homepage_url',
  }).catch(() => null)
  return data?.homepage_url ?? null
}
