import type { Job } from './types'

const compactAud = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
  notation: 'compact',
})

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Australia/Sydney',
})

export function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'salaryPeriod'>) {
  const range = `${compactAud.format(job.salaryMin)} – ${compactAud.format(job.salaryMax)}`
  return job.salaryPeriod === 'scholarship' ? `${range} stipend p.a.` : `${range} p.a.`
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00+10:00`))
}

export const WORK_ARRANGEMENT_LABEL = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
} as const

export const EMPLOYMENT_TYPE_LABEL = {
  'full-time': 'Full time',
  'part-time': 'Part time',
  contract: 'Fixed term / Contract',
  scholarship: 'Scholarship',
} as const

export const SITE_NAME = 'Structural Engineering Academic & Industry Jobs Australia'
export const SITE_SHORT_NAME = 'SE Jobs Australia'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://structjobs.com.au'
