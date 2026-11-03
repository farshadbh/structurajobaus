'use client'

import { Bell, LogOut, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DIGEST_FREQUENCIES,
  DIGEST_LABEL,
  criteriaToHref,
  describeCriteria,
  type SavedList,
} from '@/lib/accounts'
import type { DigestFrequency } from '@/lib/auth'
import { CITIES, STATES } from '@/lib/taxonomy'

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface ListsManagerProps {
  email: string
  lists: SavedList[]
  /** Live match count per list, computed on the server from data/jobs.json. */
  counts: Record<string, number>
  digest: { enabled: boolean; frequency: DigestFrequency }
}

export function ListsManager({ email, lists, counts, digest }: ListsManagerProps) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [prefs, setPrefs] = useState(digest)

  async function createList(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    setBusy('create')
    setErrors([])
    setNotice('')

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          keywords: data.keywords,
          sector: data.sector,
          state: data.state,
          city: data.city,
          minSalary: data.minSalary,
          visaOnly: data.visaOnly === '1',
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrors(
          Array.isArray(payload.errors) && payload.errors.length > 0
            ? payload.errors
            : [payload.error ?? 'Could not save the list.'],
        )
        return
      }

      form.reset()
      setNotice('List saved.')
      router.refresh()
    } catch {
      setErrors(['Could not reach the server. Please try again.'])
    } finally {
      setBusy(null)
    }
  }

  async function deleteList(id: string) {
    setBusy(id)
    setErrors([])
    setNotice('')

    try {
      const response = await fetch(`/api/lists/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setErrors([payload.error ?? 'Could not delete the list.'])
        return
      }
      setNotice('List deleted.')
      router.refresh()
    } catch {
      setErrors(['Could not reach the server. Please try again.'])
    } finally {
      setBusy(null)
    }
  }

  async function saveDigest(next: { enabled: boolean; frequency: DigestFrequency }) {
    setBusy('digest')
    setErrors([])
    setNotice('')
    setPrefs(next)

    try {
      const response = await fetch('/api/digest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setPrefs(digest)
        setErrors([payload.error ?? 'Could not save your alert settings.'])
        return
      }
      setNotice(next.enabled ? 'Email alerts are on.' : 'Email alerts are off.')
      router.refresh()
    } catch {
      setPrefs(digest)
      setErrors(['Could not reach the server. Please try again.'])
    } finally {
      setBusy(null)
    }
  }

  async function signOut() {
    setBusy('signout')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    window.location.assign('/')
  }

  return (
    <div className="flex flex-col gap-8">
      {errors.length > 0 && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {notice && (
        <p role="status" className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </p>
      )}

      <section aria-labelledby="digest-heading" className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="digest-heading" className="flex items-center gap-2 font-semibold">
              <Bell className="size-4" aria-hidden="true" />
              Email alerts
            </h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              New roles that match your lists, sent to <strong>{email}</strong>. One email per
              period, and only when something new has been posted.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={busy === 'signout'}
            className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="frequency" className="mb-1.5 block text-sm font-medium">
              How often
            </label>
            <select
              id="frequency"
              value={prefs.frequency}
              onChange={(event) =>
                saveDigest({ ...prefs, frequency: event.target.value as DigestFrequency })
              }
              className="h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DIGEST_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {DIGEST_LABEL[frequency]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex h-10 cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(event) => saveDigest({ ...prefs, enabled: event.target.checked })}
              className="size-4 rounded border-input accent-[var(--primary)]"
            />
            Send me new jobs
          </label>

          {busy === 'digest' && <span className="text-sm text-muted-foreground">Saving…</span>}
        </div>
      </section>

      <section aria-labelledby="lists-heading">
        <h2 id="lists-heading" className="text-lg font-semibold">
          Your lists
        </h2>

        {lists.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No lists yet. Create one below — for example “Senior structural, Melbourne” or
            “Academic roles, any city”.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {lists.map((list) => (
              <li key={list.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
                <div>
                  <p className="font-medium">{list.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{describeCriteria(list.criteria)}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {`${counts[list.id] ?? 0} matching ${counts[list.id] === 1 ? 'job' : 'jobs'} on the board now`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={criteriaToHref(list.criteria)}
                    className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                  >
                    <Search className="size-4" aria-hidden="true" />
                    View matches
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteList(list.id)}
                    disabled={busy === list.id}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="new-list-heading" className="rounded-lg border bg-card p-6">
        <h2 id="new-list-heading" className="font-semibold">
          Create a list
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A list is a saved search. Anything new that fits it is emailed to you.
        </p>

        <form onSubmit={createList} className="mt-5 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                List name
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={60}
                placeholder="Senior structural, Melbourne"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="keywords" className="mb-1.5 block text-sm font-medium">
                Keywords <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="keywords"
                name="keywords"
                maxLength={120}
                placeholder="bridge, timber, CPEng"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="sector" className="mb-1.5 block text-sm font-medium">
                Sector
              </label>
              <select id="sector" name="sector" defaultValue="" className={fieldClass}>
                <option value="">Academic + industry</option>
                <option value="academic">Academic only</option>
                <option value="industry">Industry only</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                City
              </label>
              <select id="city" name="city" defaultValue="" className={fieldClass}>
                <option value="">Any city</option>
                {CITIES.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
                State
              </label>
              <select id="state" name="state" defaultValue="" className={fieldClass}>
                <option value="">Any state</option>
                {STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="minSalary" className="mb-1.5 block text-sm font-medium">
                Minimum salary
              </label>
              <input
                id="minSalary"
                name="minSalary"
                type="number"
                min={20000}
                max={500000}
                step={5000}
                placeholder="Any"
                className={fieldClass}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="visaOnly"
              value="1"
              className="size-4 rounded border-input accent-[var(--primary)]"
            />
            Visa sponsorship only
          </label>

          <button
            type="submit"
            disabled={busy === 'create'}
            className="h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 sm:self-start sm:px-6"
          >
            {busy === 'create' ? 'Saving…' : 'Save list'}
          </button>
        </form>
      </section>
    </div>
  )
}
