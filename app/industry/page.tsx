import type { Metadata } from 'next'
import { SectorPage } from '@/components/jobs/sector-page'
import { parseFilters } from '@/lib/jobs'
import { getRole } from '@/lib/taxonomy'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { role } = parseFilters(await searchParams)
  const roleName = role ? getRole(role)?.name : undefined
  const title = roleName ? `${roleName} Jobs in Australia` : 'Industry Structural Engineering Jobs Australia'
  return {
    title,
    description: `Browse ${roleName ?? 'structural, senior, principal, civil, bridge, design and project engineer'} jobs with leading Australian engineering firms.`,
    alternates: { canonical: roleName ? `/industry?role=${role}` : '/industry' },
  }
}

export default async function IndustryPage({ searchParams }: { searchParams: SearchParams }) {
  return <SectorPage sector="industry" filters={parseFilters(await searchParams)} />
}
