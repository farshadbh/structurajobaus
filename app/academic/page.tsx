import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AcademicsSection, AcademicsTeaser } from '@/components/academics/academics-teaser'
import { SectorPage } from '@/components/jobs/sector-page'
import { isKnownRole, parseFilters } from '@/lib/jobs'
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
    ? `${roleName} Jobs in Structural Engineering Australia`
    : 'Academic Structural Engineering Jobs Australia'

  const otherFilters =
    filters.q || filters.city || filters.state || filters.salaryMin || filters.visa || filters.remote || filters.hybrid || filters.fullTime

  return {
    title,
    description: `Browse ${roleName ?? 'lecturer, senior lecturer, professor, research fellow, postdoc and PhD scholarship'} positions in structural engineering at Australian universities.`,
    alternates: { canonical: roleName ? `/academic?role=${filters.role}` : '/academic' },
    robots: otherFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export default async function AcademicPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams)
  if (!isKnownRole(filters.role)) notFound()

  // A PhD scholarship hunt starts with "who works on this?", so that category
  // gets the whole directory under its listings. The other academic roles get
  // the signpost, which keeps those pages about the jobs.
  const showDirectory = filters.role === 'phd-scholarship'

  return (
    <>
      <SectorPage sector="academic" filters={filters} />
      {showDirectory ? <AcademicsSection /> : <AcademicsTeaser />}
    </>
  )
}
