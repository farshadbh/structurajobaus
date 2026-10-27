import Link from 'next/link'
import { JobsListing } from '@/components/jobs/jobs-listing'
import { PageHeader } from '@/components/page-header'
import { ACADEMIC_ROLES, INDUSTRY_ROLES, type Sector } from '@/lib/taxonomy'
import type { JobFilters } from '@/lib/types'
import { cn } from '@/lib/utils'

const SECTOR_COPY = {
  academic: {
    eyebrow: 'Academic jobs',
    title: 'Academic structural engineering jobs',
    description:
      'Lecturer, professor, research fellow, postdoctoral and PhD scholarship opportunities at Australian universities.',
    roles: ACADEMIC_ROLES,
  },
  industry: {
    eyebrow: 'Industry jobs',
    title: 'Industry structural engineering jobs',
    description:
      'Structural, civil, bridge, design and project engineering roles with Australian consultancies, contractors and asset owners.',
    roles: INDUSTRY_ROLES,
  },
}

export function SectorPage({ sector, filters }: { sector: Sector; filters: JobFilters }) {
  const copy = SECTOR_COPY[sector]
  const basePath = `/${sector}`

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumbs={[{ label: copy.eyebrow, href: basePath }]}
      >
        <nav aria-label={`${copy.eyebrow} by role`} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={basePath}
                className={cn(
                  'inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  !filters.role ? 'border-accent bg-accent text-accent-foreground' : 'border-white/20 hover:border-white/50',
                )}
              >
                All roles
              </Link>
            </li>
            {copy.roles.map((role) => (
              <li key={role.slug}>
                <Link
                  href={`${basePath}?role=${role.slug}`}
                  aria-current={filters.role === role.slug ? 'page' : undefined}
                  className={cn(
                    'inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    filters.role === role.slug
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-white/20 hover:border-white/50',
                  )}
                >
                  {role.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <JobsListing action={basePath} filters={{ ...filters, sector }} lockSector />
    </>
  )
}
