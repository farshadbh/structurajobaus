import type { Metadata } from 'next'
import { SectorPage } from '@/components/jobs/sector-page'
import { parseFilters } from '@/lib/jobs'
import { getRole } from '@/lib/taxonomy'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { role } = parseFilters(await searchParams)
  const roleName = role ? getRole(role)?.name : undefined
  const title = roleName
    ? `${roleName} Jobs in Structural Engineering Australia`
    : 'Academic Structural Engineering Jobs Australia'
  return {
    title,
    description: `Browse ${roleName ?? 'lecturer, senior lecturer, professor, research fellow, postdoc and PhD scholarship'} positions in structural engineering at Australian universities.`,
    alternates: { canonical: roleName ? `/academic?role=${role}` : '/academic' },
  }
}

export default async function AcademicPage({ searchParams }: { searchParams: SearchParams }) {
  return <SectorPage sector="academic" filters={parseFilters(await searchParams)} />
}
