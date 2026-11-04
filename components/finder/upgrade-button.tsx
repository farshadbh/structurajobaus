'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** Sends the member to Stripe Checkout, or to the billing portal when already paid. */
export function BillingButton({ action, label }: { action: 'checkout' | 'portal'; label: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/billing/${action}`, { method: 'POST' })
      const data = (await response.json()) as { url?: string; error?: string; signIn?: boolean }
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (data.signIn) {
        router.push('/signup')
        return
      }
      setError(data.error ?? 'Something went wrong.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {label}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
