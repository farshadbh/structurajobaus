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
 * Only Australian postings are returned.
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

/**
 * University boards write their vacancies as "Lecturer in Civil Engineering"
 * or "Research Fellow", so the general engineering terms alone return almost nothing 
 * from them. These are added only to university sites.
 */
const ACADEMIC_TERMS = [
  'lecturer civil engineering',
  'research fellow civil engineering',
  'structural engineering academic',
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
    company: 'University of Queensland',
    host: 'uq.wd3.myworkdayjobs.com',
    tenant: 'uq',
    site: 'uqcareers',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
  },
  // Universities and contractors whose career sites live on Workday's newer
  // wd105 cluster rather than wd3; the host must match the tenant's cluster.
  {
    company: 'University of Melbourne',
    host: 'unimelb.wd105.myworkdayjobs.com',
    tenant: 'unimelb',
    site: 'UoM_External_Career',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
  },
  {
    company: 'University of Sydney',
    host: 'usyd.wd105.myworkdayjobs.com',
    tenant: 'usyd',
    site: 'USYD_EXTERNAL_CAREER_SITE',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
  },
  {
    company: 'RMIT University',
    host: 'rmit.wd3.myworkdayjobs.com',
    tenant: 'rmit',
    site: 'RMIT_Careers',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
  },
  {
    company: 'Macquarie University',
    host: 'mq.wd3.myworkdayjobs.com',
    tenant: 'mq',
    site: 'CareersatMQ',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
  },
  {
    company: 'Flinders University',
    host: 'flinders.wd3.myworkdayjobs.com',
    tenant: 'flinders',
    site: 'flinders_employment',
    terms: [...SEARCH_TERMS, ...ACADEMIC_TERMS],
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
  // A site can carry its own term list: university boards add the academic terms,
  // and each extra term costs requests.
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
