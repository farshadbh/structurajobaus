import { ACADEMICS } from './academics'
import { UNIVERSITIES_RAW } from '@/data/universities'

/*
 * The coverage list behind /universities: five hundred institutions, grouped by
 * country, so a student can see where engineering PhDs exist before narrowing to
 * a supervisor.
 *
 * Two things this file deliberately does not do:
 *  - it never invents a supervisor, an email or a research area for an
 *    institution. The count beside each university is the number of people
 *    actually transcribed from that university's own staff pages, which is zero
 *    for almost all of them;
 *  - it does not call the order a ranking. `rank` is the position in the
 *    Wikidata prominence order, shown as a number so the list is navigable.
 */

export interface University {
  name: string
  country: string
  /** Bare host, e.g. "unsw.edu.au". Empty when Wikidata has no website. */
  domain: string
  /** Position in the prominence order, 1-based. */
  rank: number
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

export const UNIVERSITIES: University[] = UNIVERSITIES_RAW.split('\n')
  .filter((line) => line.trim())
  .map((line, index) => {
    const [name, country, domain = ''] = line.split('|')
    return {
      name: name.trim(),
      country: country.trim(),
      domain: domain.trim(),
      rank: index + 1,
      supervisors: supervisorsAt(name),
    }
  })

export const UNIVERSITIES_WITH_SITE = UNIVERSITIES.filter((university) => university.domain).length

export const UNIVERSITIES_WITH_STAFF = UNIVERSITIES.filter(
  (university) => university.supervisors > 0,
).length

export interface CountryUniversities {
  country: string
  universities: University[]
}

/** Country groups in name order, institutions in prominence order inside each. */
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
