'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatRelativeTime } from '@/lib/format'
import { markChecked, useLiveStore } from '@/lib/live-store'

/**
 * Freshness line under the hero stats: when the board data was last
 * refreshed (the real data snapshot time), when the next client revalidation
 * runs, and how many roles arrived since the visitor's last visit.
 *
 * The countdown follows the "Check boards every" setting: when it elapses the
 * page revalidates (router.refresh) and the timer restarts. The data itself
 * only changes when a new snapshot is deployed, so a revalidation with no new
 * snapshot simply confirms the board is up to date.
 */
export function LiveStatus({ updatedAt }: { updatedAt: string | null }) {
  const router = useRouter()
  const { settings, lastCheckAt, newJobs, hydrated } = useLiveStore()
  const [, setTick] = useState(0)

  // Re-render every 20 seconds so the countdown and the relative time move.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 20_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!hydrated || !lastCheckAt) return
    const delay = lastCheckAt + settings.checkIntervalHours * 3_600_000 - Date.now()
    if (delay <= 0) {
      markChecked()
      router.refresh()
      return
    }
    const id = window.setTimeout(() => {
      markChecked()
      router.refresh()
    }, delay)
    return () => window.clearTimeout(id)
  }, [hydrated, lastCheckAt, settings.checkIntervalHours, router])

  const checkedLabel = updatedAt ? (formatRelativeTime(updatedAt) ?? 'recently') : 'today'
  const remainingMs = lastCheckAt
    ? lastCheckAt + settings.checkIntervalHours * 3_600_000 - Date.now()
    : settings.checkIntervalHours * 3_600_000
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60_000))
  const nextPass =
    remainingMinutes >= 60
      ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`
      : `${remainingMinutes}m`

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex size-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-red-400" />
        </span>
        checked {checkedLabel} · next pass in {nextPass}
      </span>
      {newJobs.length > 0 && (
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {newJobs.length} new
        </span>
      )}
    </p>
  )
}
