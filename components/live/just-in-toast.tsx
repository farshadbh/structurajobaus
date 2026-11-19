'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { dismissToast, playAlertSound, useLiveStore } from '@/lib/live-store'

/**
 * "Just in" toast for roles posted since the visitor's last visit, like the
 * reference design. It also fires the alert the visitor asked for in
 * Settings: a browser notification and/or a short beep — once per batch of
 * new roles, and only when the visitor turned that alert on.
 */
export function JustInToast() {
  const { newJobs, toastDismissed, hydrated, settings } = useLiveStore()
  const alertedFor = useRef<string | null>(null)

  const show = hydrated && !toastDismissed && newJobs.length > 0
  const signature = newJobs.map((job) => job.id).join(',')

  useEffect(() => {
    if (!show || alertedFor.current === signature) return
    alertedFor.current = signature
    if (
      settings.browserAlerts &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(
          `${newJobs.length} new industry ${newJobs.length === 1 ? 'role' : 'roles'}`,
          {
            body: newJobs[0]
              ? `${newJobs[0].title} — ${newJobs[0].organisation}`
              : undefined,
          },
        )
      } catch {
        // Notifications are best-effort; the toast itself is the fallback.
      }
    }
    if (settings.sound) playAlertSound()
  }, [show, signature, settings.browserAlerts, settings.sound, newJobs])

  if (!show) return null
  const first = newJobs[0]

  return (
    <div
      role="status"
      className="fixed top-4 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-3 text-white shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-wider text-red-400 uppercase">
            Just in
          </p>
          <p className="mt-1 text-sm leading-snug">
            {newJobs.length} new {newJobs.length === 1 ? 'position' : 'positions'}
            {first ? `, including ${first.title} — ${first.organisation}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
