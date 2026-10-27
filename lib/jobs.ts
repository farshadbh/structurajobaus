import { SAMPLE_JOBS } from './data/sample-jobs'
import { STATES, type Sector, type StateCode } from './taxonomy'
import type { Job, JobFilters } from './types'

/*
 * Data access layer. Every page reads jobs through these async functions, so
 * moving to Supabase only means replacing the bodies below with queries such as
 * `supabase.from('jobs').select('*').eq('sector', sector)` — no UI changes needed.
 */

function byNewest(a: Job, b: Job) {
  return b.postedAt.localeCompare(a.postedAt)
}

function matchesFilters(job: Job, filters: JobFilters) {
  if (filters.sector && job.sector !== filters.sector) return false
  if (filters.role && job.roleSlug !== filters.role) return false
  if (filters.city && job.city !== filters.city) return false
  if (filters.state && job.state !== filters.state) return false
  if (filters.salaryMin && job.salaryMax < filters.salaryMin) return false
  if (filters.visa && !job.visaSponsorship) return false
  if (filters.fullTime && job.employmentType !== 'full-time') return false

  if (filters.remote || filters.hybrid) {
    const allowed = [filters.remote && 'remote', filters.hybrid && 'hybrid'].filter(Boolean)
    if (!allowed.includes(job.workArrangement)) return false
  }

  if (filters.q) {
    const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean)
    const haystack = [job.title, job.organisation, job.department, job.location, job.summary, ...job.tags]
      .join(' ')
      .toLowerCase()
    if (!terms.every((term) => haystack.includes(term))) return false
  }

  return true
}

export async function getJobs(filters: JobFilters = {}): Promise<Job[]> {
  return SAMPLE_JOBS.filter((job) => matchesFilters(job, filters)).sort(byNewest)
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  return SAMPLE_JOBS.find((job) => job.slug === slug)
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  return SAMPLE_JOBS.filter((job) => job.featured).sort(byNewest).slice(0, limit)
}

export async function getLatestJobs(sector: Sector, limit = 4): Promise<Job[]> {
  return SAMPLE_JOBS.filter((job) => job.sector === sector).sort(byNewest).slice(0, limit)
}

export async function getVisaSponsoredJobs(limit = 4): Promise<Job[]> {
  return SAMPLE_JOBS.filter((job) => job.visaSponsorship).sort(byNewest).slice(0, limit)
}

export async function getRelatedJobs(job: Job, limit = 3): Promise<Job[]> {
  return SAMPLE_JOBS.filter((other) => other.id !== job.id && other.sector === job.sector)
    .sort((a, b) => Number(b.roleSlug === job.roleSlug) - Number(a.roleSlug === job.roleSlug) || byNewest(a, b))
    .slice(0, limit)
}

export async function getJobCounts() {
  const counts = { total: SAMPLE_JOBS.length, academic: 0, industry: 0, visa: 0, byCity: {} as Record<string, number>, byRole: {} as Record<string, number> }
  for (const job of SAMPLE_JOBS) {
    counts[job.sector]++
    if (job.visaSponsorship) counts.visa++
    counts.byCity[job.city] = (counts.byCity[job.city] ?? 0) + 1
    counts.byRole[job.roleSlug] = (counts.byRole[job.roleSlug] ?? 0) + 1
  }
  return counts
}

export async function getAllJobSlugs(): Promise<{ slug: string; postedAt: string }[]> {
  return SAMPLE_JOBS.map(({ slug, postedAt }) => ({ slug, postedAt }))
}

type RawSearchParams = Record<string, string | string[] | undefined>

export function parseFilters(params: RawSearchParams): JobFilters {
  const get = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined
  }
  const sector = get('sector')
  const state = get('state')
  const salary = Number(get('salary'))

  return {
    q: get('q')?.slice(0, 100),
    sector: sector === 'academic' || sector === 'industry' ? sector : undefined,
    role: get('role'),
    city: get('city'),
    state: STATES.some((s) => s.code === state) ? (state as StateCode) : undefined,
    salaryMin: Number.isFinite(salary) && salary > 0 ? salary : undefined,
    visa: get('visa') === '1',
    remote: get('remote') === '1',
    hybrid: get('hybrid') === '1',
    fullTime: get('fulltime') === '1',
  }
}
