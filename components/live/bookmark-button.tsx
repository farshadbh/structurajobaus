'use client'

import { Bookmark } from 'lucide-react'
import { toggleSaved, useLiveStore } from '@/lib/live-store'
import { cn } from '@/lib/utils'

/**
 * Bookmark toggle on every job card — industry roles. Bookmarks live in
 * localStorage on this device only; the card-wide link overlay sits
 * underneath, so the button is raised above it (relative z-10) to stay
 * clickable.
 */
export function BookmarkButton({ jobId, title }: { jobId: string; title: string }) {
  const { savedIds } = useLiveStore()
  const saved = savedIds.includes(jobId)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleSaved(jobId)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
      title={saved ? 'Saved — click to remove' : 'Save this role'}
      className={cn(
        'relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-card transition-colors hover:border-primary/40 hover:text-primary',
        saved && 'border-primary/50 text-primary',
      )}
    >
      <Bookmark className={cn('size-4', saved && 'fill-current')} aria-hidden="true" />
    </button>
  )
}
