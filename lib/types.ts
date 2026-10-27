import type { EmploymentType, Sector, StateCode, WorkArrangement } from './taxonomy'

/**
 * Mirrors the `jobs` table in scripts/001_create_jobs.sql (snake_case columns
 * map to the camelCase fields below).
 */
export interface Job {
  id: string
  slug: string
  title: string
  roleSlug: string
  sector: Sector
  organisation: string
  department?: string
  city: string
  state: StateCode
  location: string
  salaryMin: number
  salaryMax: number
  salaryPeriod: 'year' | 'scholarship'
  employmentType: EmploymentType
  workArrangement: WorkArrangement
  visaSponsorship: boolean
  featured: boolean
  postedAt: string
  closingDate: string
  summary: string
  description: string
  responsibilities: string[]
  requirements: string[]
  tags: string[]
  applyUrl: string
}

export interface JobFilters {
  q?: string
  sector?: Sector
  role?: string
  city?: string
  state?: StateCode
  salaryMin?: number
  visa?: boolean
  remote?: boolean
  hybrid?: boolean
  fullTime?: boolean
}
