'use client'

import Link from 'next/link'
import { useState } from 'react'

const fieldClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))

    if (isSignup && payload.password !== payload.confirm) {
      setErrors(['Those passwords do not match.'])
      return
    }

    setBusy(true)
    setErrors([])

    // The routes are /api/auth/register and /api/auth/login — not the mode name.
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrors(
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors
            : [data.error ?? `Something went wrong (error ${response.status}). Please try again.`],
        )
        setBusy(false)
        return
      }

      // Full navigation so the server sees the new session cookie immediately.
      window.location.assign('/account')
    } catch {
      setErrors(['Could not reach the server. Please check your connection and try again.'])
      setBusy(false)
    }
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

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          minLength={8}
          className={fieldClass}
        />
        {isSignup && (
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        )}
      </div>

      {isSignup && (
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-11 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70"
      >
        {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create one free
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
