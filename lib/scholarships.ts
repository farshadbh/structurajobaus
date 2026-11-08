import dataset from '@/data/scholarships.json'
import type { Job } from './types'

/*
 * PhD scholarship ads. They are collected by the job board's daily ingest
 * (job-board/scripts/ingest-jobs.mjs), which writes data/scholarships.json for
 * this site and keeps them off the job board. Closed ones are dropped here, so
 * an expired scholarship is never shown.
 */

interface ScholarshipsFile {
  generatedAt: string | null
  source: string
  scholarships: Job[]
}

const FILE = dataset as unknown as ScholarshipsFile

const sydneyDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Australia/Sydney',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const SCHOLARSHIPS_UPDATED_AT = FILE.generatedAt

export function getScholarships(): Job[] {
  const today = sydneyDate.format(new Date())
  return FILE.scholarships
    .filter((item) => item.closingDate >= today)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
}
