'use client'

import { useState } from 'react'
import { CITIES, STATES } from '@/lib/taxonomy'

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function JobSubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const [reference, setReference] = useState<string | undefined>()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))

    setStatus('sending')
    setErrors([])

    try {
      const response = await fetch('/api/job-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrors(
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors
            : [data.error ?? 'Something went wrong. Please try again.'],
        )
        setStatus('idle')
        return
      }

      setReference(data.reference)
      setStatus('sent')
      form.reset()
    } catch {
      setErrors(['Could not reach the server. Please check your connection and try again.'])
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Submission received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {reference ? `Your reference is ${reference}. ` : ''}
          We review every listing before it goes live, usually within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Post another role
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errors.length > 0 && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" htmlFor="title">
          <input id="title" name="title" required maxLength={140} className={fieldClass} />
        </Field>
        <Field label="Organisation" htmlFor="organisation">
          <input id="organisation" name="organisation" required maxLength={140} className={fieldClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" htmlFor="city">
          <select id="city" name="city" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select a city
            </option>
            {CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
            <option value="other">Other / regional</option>
          </select>
        </Field>
        <Field label="State" htmlFor="state">
          <select id="state" name="state" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select a state
            </option>
            {STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment type" htmlFor="employmentType">
          <select id="employmentType" name="employmentType" required defaultValue="full-time" className={fieldClass}>
            <option value="full-time">Full time</option>
            <option value="part-time">Part time</option>
            <option value="contract">Fixed term / Contract</option>
            <option value="scholarship">Scholarship</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Salary from (AUD)" htmlFor="salaryMin" hint="Optional">
          <input id="salaryMin" name="salaryMin" type="number" min={0} step={1000} className={fieldClass} />
        </Field>
        <Field label="Salary to (AUD)" htmlFor="salaryMax" hint="Optional">
          <input id="salaryMax" name="salaryMax" type="number" min={0} step={1000} className={fieldClass} />
        </Field>
        <Field label="Closing date" htmlFor="closingDate">
          <input id="closingDate" name="closingDate" type="date" required className={fieldClass} />
        </Field>
      </div>

      <Field label="Short summary" htmlFor="summary" hint="One or two sentences shown on the job card.">
        <input id="summary" name="summary" required minLength={20} maxLength={260} className={fieldClass} />
      </Field>

      <Field
        label="Role description"
        htmlFor="description"
        hint="Responsibilities, requirements and anything candidates should know. Plain text."
      >
        <textarea
          id="description"
          name="description"
          required
          minLength={80}
          maxLength={4000}
          rows={8}
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Application link" htmlFor="applyUrl" hint="Full https:// URL to your careers page or form.">
          <input id="applyUrl" name="applyUrl" type="url" required placeholder="https://" className={fieldClass} />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" hint="Used only to confirm the listing.">
          <input id="contactEmail" name="contactEmail" type="email" required className={fieldClass} />
        </Field>
      </div>

      {/* Honeypot — hidden from users and assistive technology. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="h-11 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70"
      >
        {status === 'sending' ? 'Submitting…' : 'Submit for review'}
      </button>

      <p className="text-xs text-muted-foreground">
        Listings are reviewed manually before publication. By submitting you confirm you are
        authorised to advertise this role.
      </p>
    </form>
  )
}
