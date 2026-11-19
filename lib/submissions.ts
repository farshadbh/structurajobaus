import { CITIES, STATES, type EmploymentType, type StateCode } from './taxonomy'

export interface JobSubmission {
  title: string
  organisation: string
  city: string
  state: StateCode
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  closingDate: string
  summary: string
  description: string
  applyUrl: string
  contactEmail: string
}

export type ValidationResult =
  | { ok: true; value: JobSubmission }
  | { ok: false; errors: string[] }

const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contract']

/** Rejects javascript:, data: and relative URLs — only real https links are accepted. */
function isHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.includes('.')
  } catch {
    return false
  }
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function validateSubmission(input: unknown): ValidationResult {
  const data = (input ?? {}) as Record<string, unknown>
  const errors: string[] = []

  const title = text(data.title, 140)
  const organisation = text(data.organisation, 140)
  const city = text(data.city, 60).toLowerCase().replace(/\s+/g, '-')
  const state = text(data.state, 3).toUpperCase()
  const employmentType = text(data.employmentType, 20)
  const closingDate = text(data.closingDate, 10)
  const summary = text(data.summary, 260)
  const description = text(data.description, 4000)
  const applyUrl = text(data.applyUrl, 500)
  const contactEmail = text(data.contactEmail, 200)

  if (title.length < 3) errors.push('Job title is required.')
  if (organisation.length < 2) errors.push('Organisation is required.')

  if (!CITIES.some((entry) => entry.slug === city) && city.length < 2) {
    errors.push('City is required.')
  }

  if (!STATES.some((entry) => entry.code === state)) errors.push('Select a valid state.')

  if (!EMPLOYMENT_TYPES.includes(employmentType as EmploymentType)) {
    errors.push('Select a valid employment type.')
  }

  if (!isIsoDate(closingDate)) errors.push('Closing date must be a real date.')
  else if (closingDate < new Date().toISOString().slice(0, 10)) {
    errors.push('Closing date cannot be in the past.')
  }

  if (summary.length < 20) errors.push('Add a summary of at least 20 characters.')
  if (description.length < 80) errors.push('Add a role description of at least 80 characters.')

  if (!isHttpsUrl(applyUrl)) errors.push('Application link must be a full https:// URL.')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactEmail)) {
    errors.push('A valid contact email is required.')
  }

  const salaryMin = Number(data.salaryMin)
  const salaryMax = Number(data.salaryMax)
  const hasSalary = Number.isFinite(salaryMin) && salaryMin > 0

  if (hasSalary && Number.isFinite(salaryMax) && salaryMax < salaryMin) {
    errors.push('Maximum salary cannot be below the minimum.')
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      title,
      organisation,
      city,
      state: state as StateCode,
      employmentType: employmentType as EmploymentType,
      ...(hasSalary ? { salaryMin } : {}),
      ...(hasSalary && Number.isFinite(salaryMax) && salaryMax > 0 ? { salaryMax } : {}),
      closingDate,
      summary,
      description,
      applyUrl,
      contactEmail,
    },
  }
}

export function submissionToMarkdown(submission: JobSubmission) {
  const city = CITIES.find((entry) => entry.slug === submission.city)
  const stateName = STATES.find((entry) => entry.code === submission.state)?.name ?? submission.state
  const salary =
    submission.salaryMin && submission.salaryMax
      ? `$${submission.salaryMin.toLocaleString('en-AU')} – $${submission.salaryMax.toLocaleString('en-AU')}`
      : submission.salaryMin
        ? `From $${submission.salaryMin.toLocaleString('en-AU')}`
        : 'Not advertised'

  return [
    'New job submitted through /post-a-job and awaiting review.',
    '',
    `**Title:** ${submission.title}`,
    `**Organisation:** ${submission.organisation}`,
    `**Location:** ${city?.name ?? submission.city}, ${stateName}`,
    `**Employment type:** ${submission.employmentType}`,
    `**Salary:** ${salary}`,
    `**Closing date:** ${submission.closingDate}`,
    `**Apply URL:** ${submission.applyUrl}`,
    `**Contact:** ${submission.contactEmail}`,
    '',
    '### Summary',
    submission.summary,
    '',
    '### Description',
    submission.description,
    '',
    '---',
    'To publish: add the listing to `data/jobs.json` (or replace the demo seed), then close this issue.',
  ].join('\n')
}
