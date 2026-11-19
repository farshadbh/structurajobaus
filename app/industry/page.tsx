import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SectorPage } from '@/components/jobs/sector-page'
import { isKnownRole, isKnownSector, parseFilters } from '@/lib/jobs'
import { getRole } from '@/lib/taxonomy'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const filters = parseFilters(await searchParams)
  const roleName = filters.role ? getRole(filters.role)?.name : undefined

  const title = roleName
    ? `${roleName} Jobs in Australia`
    : 'Industry Structural Engineering Jobs Australia'

  const otherFilters =
    filters.q || filters.city || filters.state || filters.salaryMin || filters.visa || filters.remote || filters.hybrid || filters.fullTime

  return {
    title,
    description: `Browse ${roleName ?? 'structural, civil, geotechnical, bridge, design and project engineer'} roles with Australian consultancies, contractors and asset owners.`,
    alternates: { canonical: roleName ? `/industry?role=${filters.role}` : '/industry' },
    robots: otherFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export default async function IndustryPage({ searchParams }: { searchParams: SearchParams }) {
  const rawParams = await searchParams
  const filters = parseFilters(rawParams)
  const sectorParam = Array.isArray(rawParams.sector) ? rawParams.sector[0] : rawParams.sector
  if (!isKnownSector(sectorParam) || !isKnownRole(filters.role)) notFound()

  return <SectorPage sector="industry" filters={filters} />
}
