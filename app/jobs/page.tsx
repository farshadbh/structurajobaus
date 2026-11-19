import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobsListing } from '@/components/jobs/jobs-listing'
import { PageHeader } from '@/components/page-header'
import { hasActiveFilters, isKnownCity, isKnownRole, isKnownSector, parseFilters } from '@/lib/jobs'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const filters = parseFilters(await searchParams)

  return {
    title: 'Search Structural Engineering Jobs in Australia',
    description:
      'Search every industry civil and structural engineering job in Australia. Filter by city, state, salary, visa sponsorship, remote, hybrid and full-time roles.',
    alternates: { canonical: '/jobs' },
    // Filtered permutations are duplicates of /jobs: crawlable, never indexed.
    robots: hasActiveFilters(filters)
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const rawParams = await searchParams
  const filters = parseFilters(rawParams)

  const sectorParam = Array.isArray(rawParams.sector) ? rawParams.sector[0] : rawParams.sector
  if (!isKnownSector(sectorParam) || !isKnownRole(filters.role) || !isKnownCity(filters.city))
    notFound()

  return (
    <>
      <PageHeader
        eyebrow="All jobs"
        title="Search structural engineering jobs"
        description="Industry civil and structural engineering roles across Australia. Refine by city, state, salary, visa sponsorship and work arrangement."
        breadcrumbs={[{ label: 'All jobs', href: '/jobs' }]}
      />
      <JobsListing action="/jobs" filters={filters} />
    </>
  )
}
