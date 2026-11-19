'use client'

import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { JobCard } from '@/components/jobs/job-card'
import { useLiveStore } from '@/lib/live-store'
import type { Job } from '@/lib/types'

export interface SavedJobItem {
  job: Job
}

/**
 * The /saved page body: shows only the bookmarked roles. The list is read
 * from localStorage after mount, so the first render waits instead of
 * flashing an empty state to a visitor who does have saved roles.
 */
export function SavedJobsView({ items }: { items: SavedJobItem[] }) {
  const { savedIds, hydrated } = useLiveStore()
  const saved = items.filter((item) => savedIds.includes(item.job.id))

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading your saved roles…</p>
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
        <Bookmark className="size-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-semibold">No saved roles yet</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Tap the bookmark on any industry role to keep it here. Saved roles live in this
          browser only.
        </p>
        <Link
          href="/industry"
          className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse industry jobs
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {saved.length} {saved.length === 1 ? 'role' : 'roles'} saved on this device.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {saved.map(({ job }) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>
    </>
  )
}
