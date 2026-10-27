import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import { getJobs } from '@/lib/jobs'
import type { JobFilters as Filters } from '@/lib/types'

interface JobsListingProps {
  action: string
  filters: Filters
  lockSector?: boolean
  lockCity?: boolean
}

function countActive(filters: Filters, lockSector?: boolean, lockCity?: boolean) {
  return Object.entries(filters).filter(([key, value]) => {
    if (lockSector && key === 'sector') return false
    if (lockCity && key === 'city') return false
    return Boolean(value)
  }).length
}

export async function JobsListing({ action, filters, lockSector, lockCity }: JobsListingProps) {
  const jobs = await getJobs(filters)
  const activeCount = countActive(filters, lockSector, lockCity)

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <JobFilters
          action={action}
          filters={filters}
          lockSector={lockSector}
          lockCity={lockCity}
          activeCount={activeCount}
        />
      </aside>

      <section aria-labelledby="results-heading">
        <div className="flex items-baseline justify-between gap-4 border-b pb-4">
          <h2 id="results-heading" className="text-lg font-semibold" aria-live="polite">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </h2>
          <p className="font-mono text-xs text-muted-foreground">Sorted by newest</p>
        </div>

        {jobs.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-4 font-semibold">No jobs match these filters</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try removing a filter or broadening your keywords to see more structural engineering roles.
            </p>
            <Link
              href={action}
              className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
