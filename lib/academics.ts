import ca from '@/data/academics/ca.json'
import de from '@/data/academics/de.json'
import hk from '@/data/academics/hk.json'
import ie from '@/data/academics/ie.json'
import jp from '@/data/academics/jp.json'
import nsw from '@/data/academics/nsw.json'
import qld from '@/data/academics/qld.json'
import sa from '@/data/academics/sa.json'
import sg from '@/data/academics/sg.json'
import uk from '@/data/academics/uk.json'
import us from '@/data/academics/us.json'
import vic from '@/data/academics/vic.json'
import wa from '@/data/academics/wa.json'

/*
 * A directory of civil and structural engineering academics: who they are, what
 * they research, and how to reach them.
 *
 * Every entry is transcribed from an official university page that was opened
 * while compiling it, and each one carries the URL it came from. Emails appear
 * only where the university published them - nothing here is guessed from a
 * name pattern, because a wrong address sends mail to a stranger.
 *
 * The data lives in data/academics/<region>.json so a correction is a one-line
 * edit in one file.
 */

export type AcademicField =
  | 'structural'
  | 'earthquake'
  | 'geotechnical'
  | 'transport'
  | 'water'
  | 'construction'
  | 'computational'
  | 'risk'

export type CountryCode = 'AU' | 'US' | 'GB' | 'CA' | 'DE' | 'IE' | 'JP' | 'SG' | 'HK'

export interface Country {
  code: CountryCode
  slug: string
  name: string
  /** Short form for chips and filter labels. */
  short: string
  region: string
}

export const COUNTRIES: Country[] = [
  { code: 'AU', slug: 'australia', name: 'Australia', short: 'Australia', region: 'Oceania' },
  { code: 'US', slug: 'united-states', name: 'United States', short: 'USA', region: 'North America' },
  { code: 'GB', slug: 'united-kingdom', name: 'United Kingdom', short: 'UK', region: 'Europe' },
  { code: 'CA', slug: 'canada', name: 'Canada', short: 'Canada', region: 'North America' },
  { code: 'DE', slug: 'germany', name: 'Germany', short: 'Germany', region: 'Europe' },
  { code: 'IE', slug: 'ireland', name: 'Ireland', short: 'Ireland', region: 'Europe' },
  { code: 'JP', slug: 'japan', name: 'Japan', short: 'Japan', region: 'Asia' },
  { code: 'SG', slug: 'singapore', name: 'Singapore', short: 'Singapore', region: 'Asia' },
  { code: 'HK', slug: 'hong-kong', name: 'Hong Kong', short: 'Hong Kong', region: 'Asia' },
]

/** Countries named as next additions but not yet compiled - shown as a roadmap, never faked. */
export const PLANNED_COUNTRIES = ['France', 'Italy', 'Netherlands', 'Switzerland', 'Sweden', 'New Zealand', 'China', 'South Korea']

export interface Academic {
  id: string
  name: string
  /** Set only where the last word of the name is not the family name. */
  surname?: string
  title: string
  university: string
  universitySlug: string
  /** State, province or city. */
  state: string
  country: CountryCode
  countryName: string
  field: AcademicField
  researchFocus: string
  email: string | null
  profileUrl: string
  sourceUrl: string
}

interface RawEntry {
  id: string
  name: string
  surname?: string
  title: string
  university: string
  universitySlug: string
  /** Narrowed to AcademicField when the files are read; JSON has no union types. */
  field: string
  /** State, province or city. Australian files carry it at file level instead. */
  state?: string
  researchFocus: string
  email: string | null
  profileUrl: string
  sourceUrl: string
}

interface RegionFile {
  country: CountryCode
  verifiedAt: string
  people: RawEntry[]
}

/** The Australian files are one per state; the state name lives on the file. */
interface StateFile {
  state: string
  verifiedAt: string
  people: RawEntry[]
}

/* The Australian files are one per state, so the state lives on the file. */
const AU_FILES: { file: StateFile; state: string }[] = [
  { file: nsw as unknown as StateFile, state: 'New South Wales' },
  { file: vic as unknown as StateFile, state: 'Victoria' },
  { file: qld as unknown as StateFile, state: 'Queensland' },
  { file: sa as unknown as StateFile, state: 'South Australia' },
  { file: wa as unknown as StateFile, state: 'Western Australia' },
]

const REGION_FILES: RegionFile[] = [us, uk, ca, de, ie, jp, sg, hk] as unknown as RegionFile[]

export const FIELDS: { slug: AcademicField; name: string; blurb: string }[] = [
  {
    slug: 'structural',
    name: 'Structural',
    blurb: 'Buildings, bridges, steel, concrete and timber, dynamics, resilience and monitoring.',
  },
  {
    slug: 'earthquake',
    name: 'Earthquake',
    blurb: 'Seismic design, structural dynamics, retrofit and performance-based earthquake engineering.',
  },
  {
    slug: 'geotechnical',
    name: 'Geotechnical',
    blurb: 'Soil and rock mechanics, foundations, slopes, tunnels and ground improvement.',
  },
  {
    slug: 'transport',
    name: 'Transport',
    blurb: 'Traffic and networks, public transport, road safety and travel behaviour.',
  },
  {
    slug: 'water',
    name: 'Water',
    blurb: 'Hydrology, hydraulics, water quality, treatment, stormwater and coastal flows.',
  },
  {
    slug: 'construction',
    name: 'Construction & materials',
    blurb: 'Construction management, cement and concrete materials, durability and asset management.',
  },
  {
    slug: 'computational',
    name: 'Computational & optimisation',
    blurb: 'Structural optimisation, computational mechanics, digital fabrication and design automation.',
  },
  {
    slug: 'risk',
    name: 'Risk & resilience',
    blurb: 'Reliability, catastrophe modelling, multi-hazard risk and infrastructure resilience.',
  },
]

export const ACADEMIC_VERIFIED_AT = '2026-11-03'

function countryName(code: CountryCode) {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code
}

function toAcademic(person: RawEntry, country: CountryCode, state: string): Academic {
  return {
    ...person,
    state,
    field: person.field as AcademicField,
    country,
    countryName: countryName(country),
  }
}

export const ACADEMICS: Academic[] = [
  ...AU_FILES.flatMap(({ file, state }) =>
    file.people.map((person) => toAcademic(person, 'AU', state)),
  ),
  ...REGION_FILES.flatMap((file) =>
    file.people.map((person: RawEntry) => toAcademic(person, file.country, person.state ?? '')),
  ),
].sort((a, b) => a.name.localeCompare(b.name))

/** Australia only - the pages that talk about Australian universities use these. */
export const AU_ACADEMICS = ACADEMICS.filter((person) => person.country === 'AU')

export function isAcademicField(value?: string): value is AcademicField {
  return FIELDS.some((field) => field.slug === value)
}

export function fieldName(slug: AcademicField) {
  return FIELDS.find((field) => field.slug === slug)?.name ?? slug
}

export function getAcademics(filter?: { country?: CountryCode; field?: AcademicField }): Academic[] {
  return ACADEMICS.filter(
    (person) =>
      (!filter?.country || person.country === filter.country) &&
      (!filter?.field || person.field === filter.field),
  )
}

export function universitiesFor(country?: CountryCode) {
  const source = country ? ACADEMICS.filter((person) => person.country === country) : ACADEMICS
  return [...new Set(source.map((person) => person.university))].sort((a, b) => a.localeCompare(b))
}

export interface UniversityGroup {
  university: string
  state: string
  country: CountryCode
  countryName: string
  people: Academic[]
  /** People inside this university, grouped by field in the FIELDS order. */
  byField: { field: AcademicField; name: string; people: Academic[] }[]
}

export interface CountryGroup {
  country: Country
  universities: UniversityGroup[]
}

const UNIVERSITY_ORDER = [
  'UNSW Sydney',
  'University of Sydney',
  'University of Technology Sydney',
  'University of Newcastle',
  'University of Wollongong',
  'RMIT University',
  'Deakin University',
  'Monash University',
  'University of Queensland',
  'Adelaide University',
  'Curtin University',
]

function groupPeople(people: Academic[], rank: (name: string) => number): UniversityGroup[] {
  const groups = new Map<string, Academic[]>()

  for (const person of people) {
    const list = groups.get(person.university) ?? []
    list.push(person)
    groups.set(person.university, list)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([university, members]) => ({
      university,
      state: members[0].state,
      country: members[0].country,
      countryName: members[0].countryName,
      people: members,
      byField: FIELDS.map((field) => ({
        field: field.slug,
        name: field.name,
        people: members.filter((person) => person.field === field.slug),
      })).filter((group) => group.people.length > 0),
    }))
}

/** Grouped by university, then by field, so the page reads as a directory. */
export function groupByUniversity(people: Academic[] = AU_ACADEMICS): UniversityGroup[] {
  const rank = (name: string) => {
    const index = UNIVERSITY_ORDER.indexOf(name)
    return index === -1 ? UNIVERSITY_ORDER.length : index
  }

  return groupPeople(people, rank)
}

/** Grouped by country, then university, then field. */
export function groupByCountryAndUniversity(people: Academic[] = ACADEMICS): CountryGroup[] {
  return COUNTRIES.map((country) => ({
    country,
    universities: groupByUniversityIn(people.filter((person) => person.country === country.code)),
  })).filter((group) => group.universities.length > 0)
}

function groupByUniversityIn(people: Academic[]) {
  return groupPeople(people, () => 0)
}

export interface AcademicStats {
  total: number
  universities: number
  countries: number
  withEmail: number
  byField: Record<AcademicField, number>
}

export function statsFor(people: Academic[]): AcademicStats {
  return {
    total: people.length,
    universities: new Set(people.map((person) => person.university)).size,
    countries: new Set(people.map((person) => person.country)).size,
    withEmail: people.filter((person) => person.email).length,
    byField: Object.fromEntries(
      FIELDS.map((field) => [field.slug, people.filter((person) => person.field === field.slug).length]),
    ) as Record<AcademicField, number>,
  }
}

export const ACADEMIC_STATS = statsFor(AU_ACADEMICS)
export const ALL_ACADEMIC_STATS = statsFor(ACADEMICS)

export function countriesWithData(): Country[] {
  return COUNTRIES.filter((country) => ACADEMICS.some((person) => person.country === country.code))
}
