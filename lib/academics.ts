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

/*
 * AcademicField is derived from DISCIPLINES further down, so adding a
 * specialisation is one line of data instead of a type edit plus every switch.
 */

export type CountryCode = 'AU' | 'US' | 'GB' | 'CA' | 'DE' | 'IE' | 'JP' | 'SG' | 'HK'

export interface Country {
  code: CountryCode
  slug: string
  name: string
  /** Short form for chips and filter labels. */
  short: string
  region: string
  /** Emoji flag, so the country reads at a glance in the filter and headings. */
  flag: string
}

export const COUNTRIES: Country[] = [
  { code: 'AU', slug: 'australia', name: 'Australia', short: 'Australia', region: 'Oceania', flag: '🇦🇺' },
  { code: 'US', slug: 'united-states', name: 'United States', short: 'USA', region: 'North America', flag: '🇺🇸' },
  { code: 'GB', slug: 'united-kingdom', name: 'United Kingdom', short: 'UK', region: 'Europe', flag: '🇬🇧' },
  { code: 'CA', slug: 'canada', name: 'Canada', short: 'Canada', region: 'North America', flag: '🇨🇦' },
  { code: 'DE', slug: 'germany', name: 'Germany', short: 'Germany', region: 'Europe', flag: '🇩🇪' },
  { code: 'IE', slug: 'ireland', name: 'Ireland', short: 'Ireland', region: 'Europe', flag: '🇮🇪' },
  { code: 'JP', slug: 'japan', name: 'Japan', short: 'Japan', region: 'Asia', flag: '🇯🇵' },
  { code: 'SG', slug: 'singapore', name: 'Singapore', short: 'Singapore', region: 'Asia', flag: '🇸🇬' },
  { code: 'HK', slug: 'hong-kong', name: 'Hong Kong', short: 'Hong Kong', region: 'Asia', flag: '🇭🇰' },
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

/**
 * Every engineering discipline the directory can hold, and the specialisations a
 * PhD student can choose inside it.
 *
 * The eight civil entries were the whole site; they keep their slugs so the
 * existing records and links still resolve. The other disciplines are declared
 * empty on purpose: they give the filter its full shape, and a subfield with no
 * people counts zero until someone with a published address is transcribed into
 * it. An empty section is honest; an invented professor is not.
 */
export const DISCIPLINES = [
  {
    slug: 'civil',
    name: 'Civil & structural',
    blurb: 'Structures, ground, water, transport and construction.',
    subfields: [
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
    ],
  },
  {
    slug: 'mechanical',
    name: 'Mechanical',
    blurb: 'Machines, heat and flow, vibration and manufacturing.',
    subfields: [
      { slug: 'mechanical-design', name: 'Design & machine elements', blurb: 'Machine design, mechanisms, fatigue and component sizing.' },
      { slug: 'thermofluids', name: 'Thermofluids', blurb: 'Thermodynamics, heat transfer, combustion and fluid mechanics.' },
      { slug: 'dynamics-vibration', name: 'Dynamics & vibration', blurb: 'Rotordynamics, modal analysis, acoustics and condition monitoring.' },
      { slug: 'manufacturing', name: 'Manufacturing', blurb: 'Machining, forming, additive manufacturing and production systems.' },
      { slug: 'tribology', name: 'Tribology', blurb: 'Friction, wear, lubrication and contact mechanics.' },
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical & electronic',
    blurb: 'Power, control, communications and signal processing.',
    subfields: [
      { slug: 'power-systems', name: 'Power systems', blurb: 'Grid operation, protection, stability and power electronics.' },
      { slug: 'control', name: 'Control', blurb: 'Control theory, estimation, model predictive control and autonomy.' },
      { slug: 'communications', name: 'Communications', blurb: 'Wireless, optical networks, coding and information theory.' },
      { slug: 'electronics', name: 'Electronics', blurb: 'Analog and digital circuits, IC design, embedded hardware.' },
      { slug: 'signal-processing', name: 'Signal processing', blurb: 'Detection, estimation, imaging and machine listening.' },
    ],
  },
  {
    slug: 'chemical',
    name: 'Chemical & process',
    blurb: 'Reaction engineering, separation and process design.',
    subfields: [
      { slug: 'process-design', name: 'Process design', blurb: 'Plant design, simulation, pinch analysis and scale-up.' },
      { slug: 'reaction-engineering', name: 'Reaction engineering', blurb: 'Kinetics, reactor design and catalytic reactors.' },
      { slug: 'separations', name: 'Separations', blurb: 'Distillation, membranes, adsorption and crystallisation.' },
      { slug: 'catalysis', name: 'Catalysis', blurb: 'Heterogeneous and homogeneous catalysts, electro-catalysis.' },
    ],
  },
  {
    slug: 'environmental',
    name: 'Environmental',
    blurb: 'Treatment, air, waste and environmental flows.',
    subfields: [
      { slug: 'water-treatment', name: 'Water & wastewater treatment', blurb: 'Drinking water, biological treatment and reuse.' },
      { slug: 'air-quality', name: 'Air quality', blurb: 'Emissions, dispersion modelling and indoor air.' },
      { slug: 'waste-management', name: 'Waste & resource recovery', blurb: 'Landfill, recycling, circular economy and contaminated land.' },
      { slug: 'environmental-hydrology', name: 'Environmental hydrology', blurb: 'Catchments, groundwater, contaminant transport and ecohydrology.' },
    ],
  },
  {
    slug: 'materials',
    name: 'Materials',
    blurb: 'Metals, composites, polymers and how to test them.',
    subfields: [
      { slug: 'metals', name: 'Metals & alloys', blurb: 'Steel, aluminium, superalloys, fatigue and fracture.' },
      { slug: 'composites', name: 'Composites', blurb: 'FRP, laminates, textile reinforcement and damage tolerance.' },
      { slug: 'polymers', name: 'Polymers', blurb: 'Thermoplastics, elastomers, ageing and additive polymers.' },
      { slug: 'characterisation', name: 'Characterisation', blurb: 'Microscopy, diffraction, mechanical testing and NDT.' },
    ],
  },
  {
    slug: 'aerospace',
    name: 'Aerospace',
    blurb: 'Flight, propulsion, space structures and aerodynamics.',
    subfields: [
      { slug: 'aerodynamics', name: 'Aerodynamics', blurb: 'External flow, CFD, aeroelasticity and wind tunnel work.' },
      { slug: 'propulsion', name: 'Propulsion', blurb: 'Jets, rockets, electric propulsion and combustion.' },
      { slug: 'spacecraft-structures', name: 'Spacecraft structures', blurb: 'Lightweight structures, composites, thermal and launch loads.' },
      { slug: 'flight-mechanics', name: 'Flight mechanics', blurb: 'Stability, control, guidance and trajectory design.' },
    ],
  },
  {
    slug: 'biomedical',
    name: 'Biomedical',
    blurb: 'Mechanics and materials inside the body, and devices that go in it.',
    subfields: [
      { slug: 'biomechanics', name: 'Biomechanics', blurb: 'Bone, tissue, gait, implants and musculoskeletal modelling.' },
      { slug: 'tissue-engineering', name: 'Tissue engineering', blurb: 'Scaffolds, bioreactors, cells and regenerative repair.' },
      { slug: 'medical-devices', name: 'Medical devices', blurb: 'Instrumentation, prosthetics, regulatory and clinical testing.' },
      { slug: 'biomaterials', name: 'Biomaterials', blurb: 'Implant alloys, hydrogels, biocompatibility and degradation.' },
    ],
  },
  {
    slug: 'mining',
    name: 'Mining & resources',
    blurb: 'Rock, ore and the planning of an operation.',
    subfields: [
      { slug: 'rock-mechanics', name: 'Rock mechanics', blurb: 'Ground control, slope stability, blasting and excavation.' },
      { slug: 'mineral-processing', name: 'Mineral processing', blurb: 'Comminution, flotation, leaching and tailings.' },
      { slug: 'mine-planning', name: 'Mine planning', blurb: 'Reserve estimation, scheduling, ventilation and automation.' },
    ],
  },
  {
    slug: 'industrial',
    name: 'Industrial & systems',
    blurb: 'Operations, supply chains and the way work is organised.',
    subfields: [
      { slug: 'operations-research', name: 'Operations research', blurb: 'Optimisation, scheduling, simulation and decision analysis.' },
      { slug: 'supply-chain', name: 'Supply chain', blurb: 'Logistics, inventory, resilience and procurement.' },
      { slug: 'human-factors', name: 'Human factors', blurb: 'Ergonomics, safety, workload and human-machine systems.' },
      { slug: 'quality-engineering', name: 'Quality engineering', blurb: 'Reliability, six sigma, metrology and process control.' },
    ],
  },
  {
    slug: 'computer',
    name: 'Software & computing',
    blurb: 'The computing half of an engineering school.',
    subfields: [
      { slug: 'artificial-intelligence', name: 'AI & machine learning', blurb: 'Learning, vision, language and scientific machine learning.' },
      { slug: 'distributed-systems', name: 'Distributed systems', blurb: 'Cloud, networks, fault tolerance and edge computing.' },
      { slug: 'cybersecurity', name: 'Cybersecurity', blurb: 'Systems security, cryptography and critical infrastructure.' },
      { slug: 'human-computer-interaction', name: 'Human-computer interaction', blurb: 'Usability, accessibility, interfaces and user research.' },
    ],
  },
  {
    slug: 'energy',
    name: 'Energy',
    blurb: 'Generation, storage and the grid between them.',
    subfields: [
      { slug: 'renewables', name: 'Renewables', blurb: 'Solar, wind, hydro and their integration.' },
      { slug: 'energy-storage', name: 'Energy storage', blurb: 'Batteries, thermal storage, pumped hydro and hydrogen carriers.' },
      { slug: 'power-grids', name: 'Power grids', blurb: 'Grid planning, markets, inertia and converter-dominated systems.' },
      { slug: 'hydrogen', name: 'Hydrogen', blurb: 'Electrolysis, storage, transport and industrial use.' },
    ],
  },
  {
    slug: 'mechatronics',
    name: 'Mechatronics & robotics',
    blurb: 'Machines that sense, decide and move.',
    subfields: [
      { slug: 'robotics', name: 'Robotics', blurb: 'Manipulation, mobile robots, perception and field robotics.' },
      { slug: 'automation', name: 'Automation', blurb: 'Industrial control, PLCs, digital twins and Industry 4.0.' },
      { slug: 'sensors-actuators', name: 'Sensors & actuators', blurb: 'Instrumentation, MEMS, drives and smart structures.' },
    ],
  },
  {
    slug: 'agricultural',
    name: 'Agricultural & biosystems',
    blurb: 'Water, machines and data applied to producing food.',
    subfields: [
      { slug: 'irrigation', name: 'Irrigation & water', blurb: 'On-farm water, drainage, dams and scheduling.' },
      { slug: 'precision-agriculture', name: 'Precision agriculture', blurb: 'Remote sensing, yield mapping and farm automation.' },
      { slug: 'food-engineering', name: 'Food engineering', blurb: 'Processing, preservation, packaging and cold chains.' },
    ],
  },
] as const

export type Discipline = (typeof DISCIPLINES)[number]['slug']
export type AcademicField = (typeof DISCIPLINES)[number]['subfields'][number]['slug']

export interface Field {
  slug: AcademicField
  name: string
  blurb: string
  discipline: Discipline
  disciplineName: string
}

/** Every specialisation, flattened in discipline order for the existing pages. */
export const FIELDS: Field[] = DISCIPLINES.flatMap((discipline) =>
  discipline.subfields.map((subfield) => ({
    slug: subfield.slug,
    name: subfield.name,
    blurb: subfield.blurb,
    discipline: discipline.slug,
    disciplineName: discipline.name,
  })),
)

export function disciplineName(slug: Discipline) {
  return DISCIPLINES.find((discipline) => discipline.slug === slug)?.name ?? slug
}

/** Which discipline a specialisation sits under. */
export function disciplineOf(field: AcademicField): Discipline {
  return (
    DISCIPLINES.find((discipline) =>
      discipline.subfields.some((subfield) => subfield.slug === field),
    )?.slug ?? 'civil'
  )
}

/** The specialisations shown in the second dropdown once a discipline is picked. */
export function subfieldsFor(discipline?: Discipline): Field[] {
  return discipline ? FIELDS.filter((field) => field.discipline === discipline) : FIELDS
}

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
