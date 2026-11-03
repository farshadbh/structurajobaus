/**
 * University vacancies from PageUp career sites.
 *
 * Several Australian universities run their careers page on PageUp, which
 * publishes no JSON feed — only server-rendered HTML. Its robots.txt allows the
 * listing and job paths (it disallows /admin, /uat, /staging and similar), so
 * this reads exactly what a visitor reads, slowly and politely, and never
 * touches a blocked path.
 *
 *   GET https://careers.pageuppeople.com/{tenant}/cw/en/listing/?page=N&page-items=100
 *   GET https://careers.pageuppeople.com/{tenant}/cw/en/job/{id}/{slug}   (ad body)
 *
 * The listing table already carries the position, campus and closing date per
 * row, so the ad body is only fetched for the few listings in this board's
 * discipline: PageUp throttles bursts of requests, and a missing body must
 * never cost us the vacancy.
 *
 * PageUp publishes no "date posted", so `postedAt` is left null and the ingest
 * keeps the date each listing was first seen. Without that, every run would
 * re-date every ad and stale vacancies would never expire.
 */

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const BASE = 'https://careers.pageuppeople.com'
const PAGES = 2
const PAGE_ITEMS = 100
const MAX_DETAILS = 15

/**
 * The board only carries civil/structural work, so a university's nursing,
 * library and finance vacancies are skipped before any request is spent.
 */
const DISCIPLINE = /\b(civil|structural|structures?|geotech\w*|bridge|construction|infrastructure)\b/i

/** Tenant ids, read from the careers URL each university publishes. */
export const PAGEUP_SITES = [
  { company: 'Monash University', tenant: '513' },
  { company: 'Deakin University', tenant: '949' },
  { company: 'University of Canberra', tenant: '737' },
  { company: 'Charles Sturt University', tenant: '924' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const decode = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;|&rsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * PageUp throttles bursts of requests, so a retry with a backoff turns a rate
 * limit into a slower read instead of a lost vacancy.
 */
async function get(url) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (error) {
      lastError = error
      await sleep(900 * attempt)
    }
  }
  throw lastError
}

/**
 * One row per vacancy: `<a class="job-link">` carries the title and id, and the
 * sibling cells carry the campus and the closing date.
 */
function parseListing(html) {
  const found = []
  const rows = String(html ?? '').split(/<tr[\s>]/i).slice(1)
  for (const row of rows) {
    const link = row.match(/<a[^>]*class="job-link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!link) continue
    const cell = (className) => {
      const match = row.match(
        new RegExp(`class="${className}"[^>]*>([\\s\\S]*?)</(?:span|td)>`, 'i'),
      )
      return match ? decode(match[1]) : ''
    }
    found.push({
      href: link[1],
      title: decode(link[2]),
      location: cell('location'),
      closing: cell('close-date'),
      // The "Level / Salary" column is unlabelled, so it is read as the first
      // cell that is neither the link, the campus nor the closing date.
      salaryText: decode(
        (row.replace(link[0], '').split(/<\/td>/i).find((part) => /\$/.test(part)) ?? '').replace(
          /<[^>]+>/g,
          ' ',
        ),
      ),
    })
  }
  return found
}

function idFromHref(href) {
  const match = String(href).match(/\/job\/(\d+)/)
  return match ? match[1] : null
}

/** Ad body text, used for the description and the tags the pipeline reads. */
function parseBody(html) {
  const text = String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|li|div|h\d|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;|&rsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n\n')
    .trim()
  return text.slice(0, 4000)
}

/** Returns raw listings for one university board, in buildJob()'s input shape. */
async function fetchSite(cfg, { detailLimit = MAX_DETAILS } = {}) {
  const listings = new Map()

  for (let page = 1; page <= PAGES; page++) {
    const html = await get(
      `${BASE}/${cfg.tenant}/cw/en/listing/?page=${page}&page-items=${PAGE_ITEMS}`,
    )
    const rows = parseListing(html)
    if (rows.length === 0) break
    for (const row of rows) {
      const id = idFromHref(row.href)
      if (id && !listings.has(id)) listings.set(id, { ...row, id })
    }
    await sleep(300)
  }

  const candidates = [...listings.values()]
    .filter((row) => DISCIPLINE.test(row.title))
    .slice(0, detailLimit)

  const raws = []
  for (const row of candidates) {
    const url = `${BASE}${row.href}`
    let body = ''
    await sleep(350)
    try {
      body = parseBody(await get(url))
    } catch {
      // The row already carries the title, campus and closing date, so the
      // vacancy is published even when its ad page cannot be read.
    }

    // The level/salary column ("Level B ($123,138 - $146,228)") goes into the
    // description so the shared pipeline can report a real salary.
    const description = [row.salaryText, row.closing ? `Closes: ${row.closing}` : '', body]
      .filter(Boolean)
      .join('\n')

    raws.push({
      source: 'pageup',
      externalId: row.id,
      title: row.title,
      company: cfg.company,
      description,
      // PageUp has no posted date; the ingest keeps the first-seen date.
      postedAt: null,
      applyUrl: url,
      locationText: row.location,
      salaryMin: NaN,
      salaryMax: NaN,
    })
  }

  return raws
}

/** Every configured board; one failing site is reported and skipped. */
export async function fetchPageUpJobs(sites = PAGEUP_SITES, options = {}) {
  const raws = []
  for (const cfg of sites) {
    try {
      const found = await fetchSite(cfg, options)
      console.log(`[ingest] PageUp ${cfg.company}: ${found.length} listings`)
      raws.push(...found)
    } catch (error) {
      console.warn(
        `[ingest] PageUp ${cfg.company} failed: ${error instanceof Error ? error.message : error}`,
      )
    }
  }
  return raws
}
