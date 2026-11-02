#!/usr/bin/env node
/**
 * Refreshes data/jobs.json from the Adzuna AU job search API.
 *
 * Run manually with `pnpm ingest`, or automatically every morning at 06:00
 * Australia/Sydney via .github/workflows/refresh-jobs.yml.
 *
 * Required environment variables:
 *   ADZUNA_APP_ID, ADZUNA_APP_KEY   — free keys from https://developer.adzuna.com
 *
 * Adzuna's terms require the "Adzuna" attribution link on every published
 * listing, which the job card and detail page render for source="adzuna".
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_FILE = path.join(ROOT, 'data', 'jobs.json')

const APP_ID = process.env.ADZUNA_APP_ID?.trim()
const APP_KEY = process.env.ADZUNA_APP_KEY?.trim()

const QUERIES = [
  'structural engineer',
  'structural engineering',
  'senior structural engineer',
  'bridge engineer',
  'civil structural engineer',
  'structural engineer university',
]
const PAGES_PER_QUERY = 2
const RESULTS_PER_PAGE = 50
const MAX_JOBS = 120
const LISTING_DAYS = 30

/* ------------------------------------------------------------------ helpers */

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)

const addDays = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&(?:rsquo|lsquo|#39|apos);/gi, "'")
    .replace(/&(?:quot|ldquo|rdquo);/gi, '"')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n\n')
    .trim()
}

function truncate(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

/* ------------------------------------------------------------- taxonomy maps */

const CITY_STATE = {
  sydney: 'NSW',
  newcastle: 'NSW',
  wollongong: 'NSW',
  parramatta: 'NSW',
  melbourne: 'VIC',
  geelong: 'VIC',
  brisbane: 'QLD',
  'gold-coast': 'QLD',
  'sunshine-coast': 'QLD',
  cairns: 'QLD',
  townsville: 'QLD',
  perth: 'WA',
  adelaide: 'SA',
  hobart: 'TAS',
  launceston: 'TAS',
  canberra: 'ACT',
  darwin: 'NT',
}

const STATE_NAMES = {
  'new south wales': 'NSW',
  victoria: 'VIC',
  queensland: 'QLD',
  'western australia': 'WA',
  'south australia': 'SA',
  tasmania: 'TAS',
  'australian capital territory': 'ACT',
  'northern territory': 'NT',
}

const ACADEMIC_EMPLOYERS =
  /(universit|unsw|monash|rmit|curtin|qut|deakin|swinburne|griffith|macquarie|latrobe|flinders|university of technology|australian national|western sydney|csu|acu|usc|james cook|murdoch|cdu)/i

const ACADEMIC_TITLES =
  /\b(lecturer|professor|postdoc|post-doc|research fellow|research associate|phd|scholarship|academic|dean|head of school)\b/i

/* Ordered most-specific-first so "senior lecturer" never matches "lecturer". */
const ROLE_RULES = [
  [/phd|scholarship/i, 'phd-scholarship'],
  [/senior lecturer/i, 'senior-lecturer'],
  [/associate professor/i, 'associate-professor'],
  [/\bprofessor\b/i, 'professor'],
  [/postdoc|post-doc/i, 'postdoctoral-fellow'],
  [/research fellow|research associate/i, 'research-fellow'],
  [/\blecturer\b/i, 'lecturer'],
  [/principal structural|principal engineer/i, 'principal-structural-engineer'],
  [/senior structural|lead structural/i, 'senior-structural-engineer'],
  [/\bbridge/i, 'bridge-engineer'],
  [/project engineer/i, 'project-engineer'],
  [/design engineer|design manager/i, 'design-engineer'],
  [/\bcivil\b/i, 'civil-engineer'],
]

const RELEVANT_TITLE = /\b(structural|structures|bridge|bridges|civil)\b/i
const NOISE_TITLE =
  /\b(draft|drafter|draught|bim|detailer|estimator|sales|recruit|talent|technician|labourer|laborer|welder|boilermaker|foreman|supervisor)\b/i

function classifyRole(title) {
  for (const [pattern, slug] of ROLE_RULES) {
    if (pattern.test(title)) return slug
  }
  return 'structural-engineer'
}

function classifySector(title, company) {
  return ACADEMIC_EMPLOYERS.test(company) || ACADEMIC_TITLES.test(title) ? 'academic' : 'industry'
}

function classifyLocation(raw) {
  const area = (raw?.location?.area ?? []).map((part) => String(part).toLowerCase())

  let state = null
  let citySlug = null

  for (const part of area) {
    const normalised = part.replace(/\s+/g, '-')
    if (CITY_STATE[normalised]) {
      citySlug = normalised
      state = CITY_STATE[normalised]
      break
    }
    if (STATE_NAMES[part]) state = STATE_NAMES[part]
  }

  if (!state) {
    // Fall back to the region name in the display string, e.g. "Perth, WA".
    const guess = String(raw?.location?.display_name ?? '').match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/)
    state = guess?.[1] ?? 'NSW'
  }

  if (!citySlug) {
    const candidates = area.filter(
      (part) => part !== 'australia' && !STATE_NAMES[part] && part.length > 2,
    )
    citySlug = slugify(candidates[0] ?? state)
  }

  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

  return { citySlug, state, location: `${cityName}, ${state}` }
}

/* ------------------------------------------------------------------ mapping */

function toJob(raw) {
  const title = String(raw.title ?? '').trim()
  const company = String(raw.company?.display_name ?? '').trim() || 'Unnamed employer'

  if (!title || !raw.id) return null
  if (!RELEVANT_TITLE.test(title) || NOISE_TITLE.test(title)) return null

  const description = stripHtml(raw.description ?? '')
  const postedAt = String(raw.created ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(postedAt)) return null

  const { citySlug, state, location } = classifyLocation(raw)

  // Adzuna flags predicted salaries; publishing them as fact would be misleading.
  const hasRealSalary =
    raw.salary_is_predicted === 0 &&
    Number.isFinite(raw.salary_min) &&
    Number.isFinite(raw.salary_max) &&
    raw.salary_max >= raw.salary_min

  const contractTime = String(raw.contract_time ?? '')
  const contractType = String(raw.contract_type ?? '')
  const employmentType =
    contractTime === 'part_time'
      ? 'part-time'
      : contractType === 'contract'
        ? 'contract'
        : 'full-time'

  const workArrangement = /\b(remote|work from home|wfh)\b/i.test(description)
    ? 'remote'
    : /\bhybrid\b/i.test(description)
      ? 'hybrid'
      : 'onsite'

  const tags = [
    raw.category?.label,
    contractType ? contractType.replace(/_/g, ' ') : null,
    contractTime ? contractTime.replace(/_/g, ' ') : null,
    /\b(sponsorship|sponsored|482|tss visa)\b/i.test(description) ? 'Visa sponsorship' : null,
  ]
    .filter(Boolean)
    .map((tag) => String(tag).replace(/\b\w/g, (char) => char.toUpperCase()))
    .slice(0, 4)

  return {
    id: `adzuna-${raw.id}`,
    externalId: String(raw.id),
    slug: `${slugify(title)}-${slugify(company)}-${raw.id}`,
    title,
    roleSlug: classifyRole(title),
    sector: classifySector(title, company),
    organisation: company,
    city: citySlug,
    state,
    location,
    ...(hasRealSalary ? { salaryMin: raw.salary_min, salaryMax: raw.salary_max } : {}),
    salaryPeriod: 'year',
    employmentType,
    workArrangement,
    visaSponsorship: /\b(sponsorship|sponsored|482|tss visa)\b/i.test(description),
    featured: false,
    postedAt,
    closingDate: addDays(postedAt, LISTING_DAYS),
    summary: truncate(description.split('\n')[0] || title, 200),
    description: truncate(description, 2500),
    responsibilities: [],
    requirements: [],
    tags,
    applyUrl: String(raw.redirect_url ?? ''),
    source: 'adzuna',
  }
}

/* -------------------------------------------------------------------- fetch */

async function fetchPage(what, page) {
  const params = new URLSearchParams({
    app_id: APP_ID,
    app_key: APP_KEY,
    results_per_page: String(RESULTS_PER_PAGE),
    what,
    sort_by: 'date',
    'content-type': 'application/json',
  })

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/au/search/${page}?${params.toString()}`,
    { headers: { Accept: 'application/json' } },
  )

  if (!response.ok) {
    throw new Error(`Adzuna ${what} page ${page} returned HTTP ${response.status}`)
  }

  const body = await response.json()
  return Array.isArray(body.results) ? body.results : []
}

/* --------------------------------------------------------------------- main */

async function readExisting() {
  try {
    return JSON.parse(await readFile(DATA_FILE, 'utf8'))
  } catch {
    return { generatedAt: null, source: 'none', jobs: [] }
  }
}

async function main() {
  if (!APP_ID || !APP_KEY) {
    console.warn('[ingest] ADZUNA_APP_ID / ADZUNA_APP_KEY are not set — no refresh performed.')
    console.warn('[ingest] Add them as GitHub Actions secrets (and locally in .env) to enable it.')
    return
  }

  const collected = new Map()

  for (const what of QUERIES) {
    for (let page = 1; page <= PAGES_PER_QUERY; page++) {
      const results = await fetchPage(what, page)
      if (results.length === 0) break

      for (const raw of results) {
        const job = toJob(raw)
        if (!job) continue
        if (!collected.has(job.externalId)) collected.set(job.externalId, job)
      }
    }
  }

  const jobs = [...collected.values()]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .slice(0, MAX_JOBS)

  const existing = await readExisting()

  if (jobs.length === 0) {
    console.warn('[ingest] No matching structural engineering vacancies returned — keeping the previous snapshot.')
    return
  }

  if (jobs.length < 5 && Array.isArray(existing.jobs) && existing.jobs.length > jobs.length) {
    console.warn(
      `[ingest] Only ${jobs.length} listings returned; keeping the previous ${existing.jobs.length}.`,
    )
    return
  }

  await mkdir(path.dirname(DATA_FILE), { recursive: true })
  await writeFile(
    DATA_FILE,
    `${JSON.stringify(
      { generatedAt: new Date().toISOString(), source: 'adzuna', jobs },
      null,
      2,
    )}\n`,
    'utf8',
  )

  const academic = jobs.filter((job) => job.sector === 'academic').length
  console.log(
    `[ingest] Wrote ${jobs.length} listings (${academic} academic, ${jobs.length - academic} industry) to data/jobs.json`,
  )
}

main().catch((error) => {
  console.error('[ingest] Failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
