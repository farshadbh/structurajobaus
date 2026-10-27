import type { Metadata } from 'next'
import { JobsListing } from '@/components/jobs/jobs-listing'
import { PageHeader } from '@/components/page-header'
import { parseFilters } from '@/lib/jobs'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export const metadata: Metadata = {
  title: 'Search Structural Engineering Jobs in Australia',
  description:
    'Search every academic and industry structural engineering job in Australia. Filter by city, state, salary, visa sponsorship, remote, hybrid and full-time roles.',
  alternates: { canonical: '/jobs' },
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams)

  return (
    <>
      <PageHeader
        eyebrow="All jobs"
        title="Search structural engineering jobs"
        description="Academic and industry roles across Australia. Refine by city, state, salary, visa sponsorship and work arrangement."
        breadcrumbs={[{ label: 'All jobs', href: '/jobs' }]}
      />
      <JobsListing action="/jobs" filters={filters} />
    </>
  )
}
