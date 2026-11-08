/*
 * Account input validation, shared by the sign-up and sign-in routes.
 */

export const unsubKey = (token: string) => `unsub:${token}`

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : ''
}

export type Validation<T> = { ok: true; value: T } | { ok: false; errors: string[] }

export function validateCredentials(input: unknown): Validation<{ email: string; password: string }> {
  const data = (input ?? {}) as Record<string, unknown>
  const email = text(data.email, 200).toLowerCase()
  const password = typeof data.password === 'string' ? data.password : ''
  const errors: string[] = []

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('Enter a valid email address.')
  if (password.length < 8) errors.push('Use a password of at least 8 characters.')
  if (password.length > 200) errors.push('That password is too long.')

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: { email, password } }
}
