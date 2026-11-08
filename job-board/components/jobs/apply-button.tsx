'use client'

import { ExternalLink } from 'lucide-react'

export function ApplyButton({ slug, href }: { slug: string; href: string }) {
  function recordClick() {
    const payload = JSON.stringify({ slug })

    // sendBeacon survives the navigation and never delays the outbound link.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track/apply', new Blob([payload], { type: 'application/json' }))
      return
    }

    void fetch('/api/track/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={recordClick}
      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
    >
      Apply now
      <ExternalLink className="size-4" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
