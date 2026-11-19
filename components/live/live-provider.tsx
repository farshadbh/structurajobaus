'use client'

import { useEffect } from 'react'
import { hydrateLiveStore, type LiveJob } from '@/lib/live-store'

/**
 * Hydrates the client-side live store once (theme, settings, saved jobs and
 * the "new since your last visit" count) from the fresh-roles list the root
 * layout loads on the server. Renders nothing.
 */
export function LiveProvider({ jobs }: { jobs: LiveJob[] }) {
  useEffect(() => {
    hydrateLiveStore(jobs)
  }, [jobs])

  return null
}
