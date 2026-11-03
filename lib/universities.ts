import { ACADEMICS } from './academics'
import { QS_2027_RAW } from '@/data/qs-2027'
import { QS_DOMAINS_RAW } from '@/data/qs-domains'
import { UNIVERSITIES_RAW } from '@/data/universities'

/*
 * The coverage list behind /universities: the QS 2027 top 200 followed by the
 * rest of the directory, grouped by country, so a student can see where
 * engineering PhDs exist before narrowing to a supervisor.
 *
 * Two things this file deliberately does not do:
 *  - it never invents a supervisor, an email or a research area for an
 *    institution. The count beside each university is the number of people
 *    actually transcribed from that university's own staff pages, which is zero
 *    for almost all of them;
 *  - the order is the QS World University Rankings 2027 for the institutions in
 *    that table, and Wikidata prominence for the rest. A rank is a property of
 *    an institution, never of a person.
 */

export interface University {
  name: string
  country: string
  /** Bare host, e.g. "unsw.edu.au". Empty when no website is recorded. */
  domain: string
  /** Position in the displayed list: the QS rank where there is one. */
  rank: number
  /** QS World University Rankings 2027 rank, or null when unranked here. */
  qsRank: number | null
  /** Transcribed supervisors at this institution. */
  supervisors: number
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const SUPERVISOR_COUNTS = (() => {
  const counts = new Map<string, number>()
  for (const person of ACADEMICS) {
    const key = normalize(person.university)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
})()

/** "University of New South Wales (UNSW)" should still find "UNSW Sydney"-style entries. */
function supervisorsAt(name: string) {
  const key = normalize(name)
  if (SUPERVISOR_COUNTS.has(key)) return SUPERVISOR_COUNTS.get(key) ?? 0

  for (const [university, count] of SUPERVISOR_COUNTS) {
    if (university.includes(key) || key.includes(university)) return count
  }
  return 0
}

const WIKIDATA_UNIVERSITIES: University[] = UNIVERSITIES_RAW.split('\n')
  .filter((line) => line.trim())
  .map((line, index) => {
    const [name, country, domain = ''] = line.split('|')
    return {
      name: name.trim(),
      country: country.trim(),
      domain: domain.trim(),
      rank: index + 1,
      qsRank: null,
      supervisors: supervisorsAt(name),
    }
  })

export interface QsRank {
  rank: number
  name: string
  country: string
}

/** QS uses its own country vocabulary; the directory keeps one consistent set. */
const COUNTRY_ALIASES: Record<string, string> = {
  'United States of America': 'United States',
  'China (Mainland)': "People's Republic of China",
  'Hong Kong SAR, China': 'Hong Kong',
  'Republic of Korea': 'South Korea',
  'Russian Federation': 'Russia',
  'Macau SAR, China': 'Macau',
}

/** Ranks 1-200 of the QS 2027 table, in the published order. */
export const QS_2027: QsRank[] = QS_2027_RAW.split('\n')
  .filter((line) => line.trim())
  .map((line) => {
    const [rank, name, country] = line.split('|')
    return {
      rank: Number(rank),
      name: name.trim(),
      country: COUNTRY_ALIASES[country.trim()] ?? country.trim(),
    }
  })

/** Matching ignores a leading "The" and any bracketed abbreviation, e.g. "(MIT)". */
function matchKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const WIKIDATA_BY_KEY = new Map(WIKIDATA_UNIVERSITIES.map((entry) => [matchKey(entry.name), entry]))
const QS_DOMAINS = new Map(
  QS_DOMAINS_RAW.split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const [name, domain] = line.split('|')
      return [matchKey(name), domain.trim()] as const
    }),
)
const MATCHED = new Set<string>()

/**
 * The list the page renders: the QS 2027 table first, in rank order, then every
 * other institution already in the directory. Domain and supervisor count come
 * from the Wikidata rows wherever the names line up, otherwise from the QS
 * domain list, otherwise no site at all.
 */
export const UNIVERSITIES: University[] = [
  ...QS_2027.map((entry) => {
    const key = matchKey(entry.name)
    const known = WIKIDATA_BY_KEY.get(key)
    if (known) MATCHED.add(key)
    const name = known?.name ?? entry.name
    return {
      name,
      country: entry.country,
      domain: known?.domain || QS_DOMAINS.get(key) || '',
      rank: entry.rank,
      qsRank: entry.rank,
      supervisors: supervisorsAt(name),
    }
  }),
  ...WIKIDATA_UNIVERSITIES.filter((entry) => !MATCHED.has(matchKey(entry.name))).map(
    (entry, index) => ({
      ...entry,
      rank: QS_2027.length + index + 1,
    }),
  ),
]

export const UNIVERSITIES_WITH_SITE = UNIVERSITIES.filter((university) => university.domain).length

export const UNIVERSITIES_WITH_STAFF = UNIVERSITIES.filter(
  (university) => university.supervisors > 0,
).length

export interface CountryUniversities {
  country: string
  universities: University[]
}

/** Country groups in name order, institutions in rank order inside each. */
export const UNIVERSITIES_BY_COUNTRY: CountryUniversities[] = [...UNIVERSITIES]
  .sort((a, b) => a.rank - b.rank)
  .reduce<CountryUniversities[]>((groups, university) => {
    const group = groups.find((entry) => entry.country === university.country)
    if (group) group.universities.push(university)
    else groups.push({ country: university.country, universities: [university] })
    return groups
  }, [])
  .sort((a, b) => a.country.localeCompare(b.country))

export function universitySlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Where to send someone when an institution has no recorded website. */
export function universityLink(university: University) {
  if (university.domain) return `https://${university.domain}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(`${university.name} engineering staff`)}`
}
