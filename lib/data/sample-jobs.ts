import type { Job } from '../types'
import { getCity, getRole } from '../taxonomy'

type Seed = Omit<
  Job,
  'id' | 'slug' | 'state' | 'location' | 'description' | 'responsibilities' | 'requirements' | 'applyUrl'
> &
  Partial<Pick<Job, 'responsibilities' | 'requirements'>> & { suburb?: string }

const ACADEMIC_RESPONSIBILITIES = [
  'Deliver high-quality undergraduate and postgraduate teaching in structural engineering',
  'Lead and grow an externally funded research program (ARC, industry partnerships)',
  'Supervise honours, masters and PhD research students',
  'Contribute to school service, accreditation and Engineers Australia requirements',
]

const ACADEMIC_REQUIREMENTS = [
  'PhD in structural or civil engineering, or a closely related discipline',
  'Track record of publications in leading structural engineering journals',
  'Demonstrated ability to teach core structural mechanics and design subjects',
  'Eligibility for chartered status with Engineers Australia is desirable',
]

const RESEARCH_RESPONSIBILITIES = [
  'Conduct experimental, numerical or analytical research within the project team',
  'Publish findings in high-impact journals and present at international conferences',
  'Collaborate with industry partners and assist with laboratory testing programs',
  'Support supervision of research students',
]

const SCHOLARSHIP_REQUIREMENTS = [
  'First-class honours or equivalent in civil or structural engineering',
  'Strong background in structural mechanics, materials or computational modelling',
  'Excellent written and verbal communication skills',
  'Domestic and international applicants are encouraged to apply',
]

const seeds: Seed[] = [
  {
    title: 'Lecturer in Structural Engineering',
    roleSlug: 'lecturer',
    sector: 'academic',
    organisation: 'University of Sydney',
    department: 'School of Civil Engineering',
    city: 'sydney',
    salaryMin: 125000,
    salaryMax: 148000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    visaSponsorship: true,
    featured: true,
    postedAt: '2026-10-24',
    closingDate: '2026-11-30',
    summary:
      'Join a leading civil engineering school to teach structural design and build a research program in resilient structures.',
    tags: ['Teaching & Research', 'Continuing', 'Steel Structures'],
  },
  {
    title: 'Senior Lecturer – Concrete Structures',
    roleSlug: 'senior-lecturer',
    sector: 'academic',
    organisation: 'University of Melbourne',
    department: 'Department of Infrastructure Engineering',
    city: 'melbourne',
    salaryMin: 150000,
    salaryMax: 172000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    visaSponsorship: true,
    featured: false,
    postedAt: '2026-10-22',
    closingDate: '2026-11-21',
    summary:
      'Lead teaching and research in reinforced and prestressed concrete, with a focus on low-carbon concrete technologies.',
    tags: ['Concrete', 'Sustainability', 'Continuing'],
  },
  {
    title: 'Associate Professor in Bridge Engineering',
    roleSlug: 'associate-professor',
    sector: 'academic',
    organisation: 'University of Queensland',
    department: 'School of Civil Engineering',
    city: 'brisbane',
    salaryMin: 175000,
    salaryMax: 195000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'onsite',
    visaSponsorship: true,
    featured: true,
    postedAt: '2026-10-20',
    closingDate: '2026-12-05',
    summary:
      'Shape a growing bridge and infrastructure research group partnering with state transport agencies.',
    tags: ['Bridges', 'Leadership', 'Industry Partnerships'],
  },
  {
    title: 'Professor of Structural Engineering',
    roleSlug: 'professor',
    sector: 'academic',
    organisation: 'UNSW Sydney',
    department: 'School of Civil & Environmental Engineering',
    city: 'sydney',
    salaryMin: 215000,
    salaryMax: 250000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    visaSponsorship: true,
    featured: true,
    postedAt: '2026-10-18',
    closingDate: '2026-12-12',
    summary:
      'Provide academic leadership for one of Australia’s largest structural engineering research centres.',
    tags: ['Leadership', 'Research Centre', 'Continuing'],
  },
  {
    title: 'Research Fellow – Timber & Hybrid Structures',
    roleSlug: 'research-fellow',
    sector: 'academic',
    organisation: 'University of Newcastle',
    department: 'School of Engineering',
    city: 'newcastle',
    salaryMin: 105000,
    salaryMax: 122000,
    salaryPeriod: 'year',
    employmentType: 'contract',
    workArrangement: 'onsite',
    visaSponsorship: true,
    featured: false,
    postedAt: '2026-10-25',
    closingDate: '2026-11-25',
    summary:
      'Undertake full-scale testing and modelling of mass timber connections as part of an ARC Linkage project.',
    responsibilities: RESEARCH_RESPONSIBILITIES,
    tags: ['Mass Timber', '3-year Fixed Term', 'ARC Linkage'],
  },
  {
    title: 'Postdoctoral Fellow – Structural Health Monitoring',
    roleSlug: 'postdoctoral-fellow',
    sector: 'academic',
    organisation: 'Monash University',
    department: 'Department of Civil Engineering',
    city: 'melbourne',
    salaryMin: 98000,
    salaryMax: 112000,
    salaryPeriod: 'year',
    employmentType: 'contract',
    workArrangement: 'hybrid',
    visaSponsorship: true,
    featured: false,
    postedAt: '2026-10-26',
    closingDate: '2026-11-28',
    summary:
      'Develop sensor-driven digital twin methods for monitoring ageing bridge and rail infrastructure.',
    responsibilities: RESEARCH_RESPONSIBILITIES,
    tags: ['Digital Twins', 'Machine Learning', '2-year Fixed Term'],
  },
  {
    title: 'Lecturer in Civil & Structural Engineering',
    roleSlug: 'lecturer',
    sector: 'academic',
    organisation: 'Curtin University',
    department: 'School of Civil & Mechanical Engineering',
    city: 'perth',
    salaryMin: 118000,
    salaryMax: 140000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'onsite',
    visaSponsorship: true,
    featured: false,
    postedAt: '2026-10-15',
    closingDate: '2026-11-20',
    summary:
      'Teach structural analysis and design while contributing to research in protective and blast-resistant structures.',
    tags: ['Protective Structures', 'Continuing'],
  },
  {
    title: 'Senior Lecturer in Structural Engineering',
    roleSlug: 'senior-lecturer',
    sector: 'academic',
    organisation: 'Queensland University of Technology',
    department: 'School of Civil & Environmental Engineering',
    city: 'brisbane',
    salaryMin: 145000,
    salaryMax: 165000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    visaSponsorship: false,
    featured: false,
    postedAt: '2026-10-12',
    closingDate: '2026-11-15',
    summary:
      'Lead courses in steel and composite design and contribute to a research group in resilient infrastructure.',
    tags: ['Steel & Composite', 'Continuing'],
  },
  {
    title: 'Postdoctoral Research Fellow – Earthquake Engineering',
    roleSlug: 'postdoctoral-fellow',
    sector: 'academic',
    organisation: 'RMIT University',
    department: 'School of Engineering',
    city: 'melbourne',
    salaryMin: 100000,
    salaryMax: 115000,
    salaryPeriod: 'year',
    employmentType: 'contract',
    workArrangement: 'remote',
    visaSponsorship: false,
    featured: false,
    postedAt: '2026-10-10',
    closingDate: '2026-11-10',
    summary:
      'Numerical modelling of seismic performance for Australian low-to-moderate seismicity regions. Remote-friendly.',
    responsibilities: RESEARCH_RESPONSIBILITIES,
    tags: ['Seismic', 'Numerical Modelling', 'Remote Eligible'],
  },
  {
    title: 'Research Fellow – Advanced Composites',
    roleSlug: 'research-fellow',
    sector: 'academic',
    organisation: 'University of South Australia',
    department: 'UniSA STEM',
    city: 'adelaide',
    salaryMin: 102000,
    salaryMax: 118000,
    salaryPeriod: 'year',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    visaSponsorship: true,
    featured: false,
    postedAt: '2026-10-21',
    closingDate: '2026-11-22',
    summary:
      'Investigate FRP strengthening systems for defence and transport structures with a national research partner.',
    responsibilities: RESEARCH_RESPONSIBILITIES,
    tags: ['FRP', 'Defence', 'Strengthening'],
  },

]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const SAMPLE_JOBS: Job[] = seeds.map((seed, index) => {
  const city = getCity(seed.city)!
  const role = getRole(seed.roleSlug)!
  const { suburb, ...rest } = seed

  return {
    ...rest,
    id: String(index + 1),
    slug: `${slugify(seed.title)}-${slugify(seed.organisation)}-${index + 1}`,
    state: city.state,
    location: `${suburb ?? city.name}, ${city.state}`,
    description: `${seed.organisation} is seeking an outstanding ${role.name.replace(/s$/, '')} to join ${
      seed.department ?? 'its structural engineering team'
    } in ${city.name}. ${seed.summary} This is an excellent opportunity to advance your career within Australia’s structural engineering ${
      'research and teaching community'
    }.`,
    responsibilities:
      seed.responsibilities ?? ACADEMIC_RESPONSIBILITIES,
    requirements: seed.requirements ?? ACADEMIC_REQUIREMENTS,
    applyUrl: '#apply',
  }
})
