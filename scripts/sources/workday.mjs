/**
 * Employer-direct listings from Workday career sites.
 *
 * Workday career pages fetch their vacancies from a public, unauthenticated
 * endpoint, so this reads the same JSON the employer's own page reads:
 *
 *   POST https://{host}/wday/cxs/{tenant}/{site}/jobs
 *   GET  https://{host}/wday/cxs/{tenant}/{site}{externalPath}   (full ad)
 *
 * That needs no key, no account and no HTML scraping. It is undocumented, so
 * every site is listed explicitly, failures are per-site and never fatal, and a
 * renamed site simply drops out of the run instead of breaking the snapshot.
 *
 * Only Australian postings are returned: these boards are global (Aurecon lists
 * Hong Kong and Ho Chi Minh City, SMEC lists Dhaka), and the board is for
 * Australia.
 */

const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

/** Terms chosen for the roles the board advertises, not the full board dump. */
const SEARCH_TERMS = [
  'structural engineer',
  'senior structural engineer',
  'civil engineer',
  'geotechnical engineer',
  'bridge engineer',
  'design engineer',
  'project engineer',
]
const PAGES_PER_TERM = 2
const RESULTS_PER_PAGE = 20
const MAX_DETAIL_FETCHES = 60

/**
 * Australian locations only. The state code or "Australia" is decisive; the
 * city list deliberately leaves out Newcastle, which is also a UK city, so that
 * a British posting is never filed under NSW.
 */
const AUSTRALIA =
  /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b|australia|sydney|melbourne|brisbane|perth|adelaide|canberra|hobart|darwin|gold coast|geelong|wollongong|toowoomba|cairns|townsville|sunshine coast|st lucia|camperdown|wallumattagal|macquarie park|clayton|parkville|caulfield|bundoora|acton|bedford park|gardens point|kelvin grove|callaghan|crawley|bentley/i

const isAustralian = (text) => AUSTRALIA.test(String(text ?? ''))

/**
 * The sites that were confirmed to answer with Australian vacancies. `company`
 * is the employer name shown on the card; the ads themselves often omit it.
 */
export const WORKDAY_SITES = [
  {
    company: 'Aurecon',
    host: 'aurecongroup.wd3.myworkdayjobs.com',
    tenant: 'aurecongroup',
    site: 'aurecon',
  },
  {
    company: 'SMEC',
    host: 'surbanajurong.wd3.myworkdayjobs.com',
    tenant: 'surbanajurong',
    site: 'careersatsmec',
  },
  {
    company: 'Fulton Hogan',
    host: 'fultonhogan.wd3.myworkdayjobs.com',
    tenant: 'fultonhogan',
    site: 'Fultonhogan',
  },
  {
    company: 'ACCIONA',
    host: 'acciona.wd3.myworkdayjobs.com',
    tenant: 'acciona',
    site: 'ACCIONA_Employment_Channel',
  },
  {
    company: 'Lendlease',
    host: 'lendlease.wd3.myworkdayjobs.com',
    tenant: 'lendlease',
    site: 'LendleaseCareers',
  },
  {
    company: 'Service Stream',
    host: 'servicestream.wd3.myworkdayjobs.com',
    tenant: 'servicestream',
    site: 'servicestream_careers',
  },
]

const base = (cfg) => `https://${cfg.host}`

async function readJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json', ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** One page of a Workday site's search results. */
async function searchPage(cfg, term, page) {
  const body = JSON.stringify({
    appliedFacets: {},
    limit: RESULTS_PER_PAGE,
    offset: (page - 1) * RESULTS_PER_PAGE,
    searchText: term,
  })
  const data = await readJson(`${base(cfg)}/wday/cxs/${cfg.tenant}/${cfg.site}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  return Array.isArray(data?.jobPostings) ? data.jobPostings : []
}

async function readDetail(cfg, externalPath) {
  const data = await readJson(`${base(cfg)}/wday/cxs/${cfg.tenant}/${cfg.site}${externalPath}`)
  return data?.jobPostingInfo ?? null
}

/** Workday paths end in an external id, usually after the last underscore. */
function externalIdFrom(externalPath) {
  const last = String(externalPath).split('/').filter(Boolean).pop() ?? ''
  const id = last.includes('_') ? last.split('_').pop() : last
  return id.replace(/[^A-Za-z0-9-]/g, '') || last
}

function isoDay(value) {
  const candidate = String(value ?? '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : null
}

/**
 * Returns raw listing objects for one employer board, in the shape
 * `buildJob()` in scripts/ingest-jobs.mjs expects. Classification (discipline,
 * role, sector) is left to the shared pipeline so every source is judged by the
 * same rules.
 */
async function fetchSite(cfg, { terms, detailLimit = MAX_DETAIL_FETCHES } = {}) {
  const seen = new Map()
  // Every site is searched with the same industry terms.
  const searchTerms = terms ?? cfg.terms ?? SEARCH_TERMS

  for (const term of searchTerms) {
    for (let page = 1; page <= PAGES_PER_TERM; page++) {
      const postings = await searchPage(cfg, term, page)
      if (postings.length === 0) break
      for (const posting of postings) {
        const path = posting?.externalPath
        if (!path || seen.has(path)) continue
        // Drop non-Australian locations before spending a detail request on them.
        if (!isAustralian(posting.locationsText)) continue
        seen.set(path, posting)
      }
    }
  }

  const raws = []
  for (const posting of [...seen.values()].slice(0, detailLimit)) {
    let detail = null
    try {
      detail = await readDetail(cfg, posting.externalPath)
    } catch {
      // The listing alone is still publishable; the ad just carries less text.
    }

    const location = detail?.location ?? posting.locationsText ?? ''
    if (!isAustralian(location)) continue

    const raw = {
      source: 'workday',
      externalId: externalIdFrom(posting.externalPath),
      title: detail?.title ?? posting.title,
      company: detail?.organization ?? cfg.company,
      description: detail?.jobDescription ?? '',
      postedAt: isoDay(detail?.startDate),
      applyUrl: `${base(cfg)}/en-US/${cfg.site}${posting.externalPath}`,
      locationText: location,
      salaryMin: NaN,
      salaryMax: NaN,
    }
    if (raw.title && raw.postedAt) raws.push(raw)
  }

  return raws
}

/**
 * Every configured board. One failing site is reported and skipped: a removed
 * or renamed career site must never stop the daily refresh.
 */
export async function fetchWorkdayJobs(sites = WORKDAY_SITES, options = {}) {
  const raws = []
  for (const cfg of sites) {
    try {
      const found = await fetchSite(cfg, options)
      console.log(`[ingest] Workday ${cfg.company}: ${found.length} Australian listings`)
      raws.push(...found)
    } catch (error) {
      console.warn(
        `[ingest] Workday ${cfg.company} failed: ${error instanceof Error ? error.message : error}`,
      )
    }
  }
  return raws
}
