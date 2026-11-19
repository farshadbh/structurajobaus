'use client'

import { CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useLiveStore } from '@/lib/live-store'
import type { Job } from '@/lib/types'

/**
 * The date line on every job card, following the header Settings choice.
 * "Updated" falls back to the posted date: the feed does not report a
 * separate update date yet (see Job.updatedAt), so nothing is invented.
 */
export function JobDateLine({ job }: { job: Job }) {
  const { settings } = useLiveStore()
  const updated = settings.dateMode === 'updated'
  const date = updated ? (job.updatedAt ?? job.postedAt) : job.postedAt

  return (
    <p className="flex items-center gap-1.5 border-t pt-3 font-mono text-xs text-muted-foreground">
      <CalendarDays className="size-3.5" aria-hidden="true" />
      {updated ? 'Updated' : 'Posted'} <time dateTime={date}>{formatDate(date)}</time>
    </p>
  )
}
