import nsw from '@/data/academics/nsw.json'
import qld from '@/data/academics/qld.json'
import sa from '@/data/academics/sa.json'
import vic from '@/data/academics/vic.json'
import wa from '@/data/academics/wa.json'

/*
 * A directory of civil engineering academics at Australian universities:
 * who they are, what they research, and how to reach them.
 *
 * Every entry is transcribed from an official university page that was opened
 * while compiling it, and each one carries the URL it came from. Emails appear
 * only where the university published them - nothing here is guessed from a
 * name pattern, because a wrong address sends mail to a stranger.
 *
 * The data lives in data/academics/<state>.json so a correction is a one-line
 * edit in one file.
 */

export type AcademicField = 'structural' | 'geotechnical' | 'transport' | 'water' | 'construction'

export interface Academic {
  id: string
  name: string
  title: string
  university: string
  universitySlug: string
  state: string
  field: AcademicField
  researchFocus: string
  email: string | null
  profileUrl: string
  sourceUrl: string
}

interface RawEntry {
  id: string
  name: string
  title: string
  university: string
  universitySlug: string
  /** Narrowed to AcademicField when the files are read; JSON has no union types. */
  field: string
  researchFocus: string
  email: string | null
  profileUrl: string
  sourceUrl: string
}

interface StateFile {
  state: string
  verifiedAt: string
  people: RawEntry[]
}

const FILES = [nsw, vic, qld, sa, wa] as unknown as StateFile[]

export const FIELDS: { slug: AcademicField; name: string; blurb: string }[] = [
  {
    slug: 'structural',
    name: 'Structural',
    blurb: 'Buildings, bridges, steel and concrete, dynamics, resilience and monitoring.',
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
    blurb: 'Construction management, asset management and sustainable materials.',
  },
]

export const ACADEMIC_VERIFIED_AT = '2026-11-03'

export const ACADEMICS: Academic[] = FILES.flatMap((file) =>
  file.people
    .map((person) => ({ ...person, state: file.state, field: person.field as AcademicField }))
    .sort((a, b) => a.name.localeCompare(b.name)),
)

export function isAcademicField(value?: string): value is AcademicField {
  return FIELDS.some((field) => field.slug === value)
}

export function fieldName(slug: AcademicField) {
  return FIELDS.find((field) => field.slug === slug)?.name ?? slug
}

export function getAcademics(field?: AcademicField): Academic[] {
  return field ? ACADEMICS.filter((person) => person.field === field) : ACADEMICS
}

export interface UniversityGroup {
  university: string
  state: string
  people: Academic[]
  /** People inside this university, grouped by field in the FIELDS order. */
  byField: { field: AcademicField; name: string; people: Academic[] }[]
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

/** Grouped by university, then by field, so the page reads as a directory. */
export function groupByUniversity(people: Academic[] = ACADEMICS): UniversityGroup[] {
  const groups = new Map<string, Academic[]>()

  for (const person of people) {
    const list = groups.get(person.university) ?? []
    list.push(person)
    groups.set(person.university, list)
  }

  const rank = (name: string) => {
    const index = UNIVERSITY_ORDER.indexOf(name)
    return index === -1 ? UNIVERSITY_ORDER.length : index
  }

  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([university, members]) => ({
      university,
      state: members[0].state,
      people: members,
      byField: FIELDS.map((field) => ({
        field: field.slug,
        name: field.name,
        people: members.filter((person) => person.field === field.slug),
      })).filter((group) => group.people.length > 0),
    }))
}

export const ACADEMIC_STATS = {
  total: ACADEMICS.length,
  universities: new Set(ACADEMICS.map((person) => person.university)).size,
  withEmail: ACADEMICS.filter((person) => person.email).length,
  byField: Object.fromEntries(
    FIELDS.map((field) => [field.slug, ACADEMICS.filter((person) => person.field === field.slug).length]),
  ) as Record<AcademicField, number>,
}
