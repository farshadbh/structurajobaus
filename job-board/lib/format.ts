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

/**
 * Returns null when the ad states no salary, so callers can leave the line out
 * completely. A placeholder such as "Not advertised" reads like a gap on the
 * board rather than a fact about the ad, and most live listings omit pay.
 */
export function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'salaryPeriod'>) {
  const { salaryMin, salaryMax } = job

  if (!salaryMin && !salaryMax) return null

  const min = salaryMin ?? salaryMax!
  const max = salaryMax ?? salaryMin!
  const range =
    min === max ? compactAud.format(min) : `${compactAud.format(min)} – ${compactAud.format(max)}`

  return job.salaryPeriod === 'scholarship' ? `${range} stipend p.a.` : `${range} p.a.`
}

/**
 * Parses a plain `YYYY-MM-DD` date as midnight UTC, then renders it in Sydney
 * time so the calendar date never shifts by a day or an hour across DST.
 */
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
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

export const SITE_NAME = 'Structural Engineering Jobs Worldwide'
export const SITE_SHORT_NAME = 'SE Jobs Worldwide'
export const SITE_TAGLINE = 'Academic & industry structural engineering jobs'

/**
 * Canonical host: set NEXT_PUBLIC_SITE_URL to the live domain (e.g.
 * https://example.com). Until then the host's own address is used - Render
 * sets RENDER_EXTERNAL_URL - so canonical tags and the sitemap never point at
 * a host that does not resolve.
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.RENDER_EXTERNAL_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  return 'http://localhost:3000'
})()

/**
 * Aggregators require a visible attribution link wherever their listings appear.
 * Listings with no entry here (employer submissions) render no attribution.
 */
export const SOURCE_ATTRIBUTION: Record<string, { label: string; url: string }> = {
  adzuna: { label: 'Adzuna', url: 'https://www.adzuna.com.au' },
  careerjet: { label: 'Careerjet', url: 'https://www.careerjet.com.au' },
  jooble: { label: 'Jooble', url: 'https://au.jooble.org' },
}

/** Adzuna's terms require an attribution link wherever their listings appear. */
export const ADZUNA_ATTRIBUTION_URL = 'https://www.adzuna.com.au'
