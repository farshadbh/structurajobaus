'use client'

import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useLiveStore } from '@/lib/live-store'

/** Header pill linking to /saved, with the live count of bookmarked roles. */
export function SavedRolesPill() {
  const { savedIds } = useLiveStore()

  return (
    <Link
      href="/saved"
      title="Jobs you saved on this device"
      className="hidden h-9 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
    >
      <Bookmark className="size-4" aria-hidden="true" />
      Saved roles
      <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-xs tabular-nums">
        {savedIds.length}
      </span>
    </Link>
  )
}
