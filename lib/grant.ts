import { createHmac, timingSafeEqual } from 'node:crypto'

/*
 * A signed list of the professors a free member was allowed to see in full.
 * The profile check accepts a free member's request only for ids in a valid
 * grant, so the two visible professors can be opened (email, accepting
 * students) without the blurred ones becoming reachable by guessing ids.
 */

const GRANT_HOURS = 12

function secret() {
  const value = process.env.AUTH_SECRET
  if (value) return value
  // Local runs without accounts still need a key; production never uses this.
  return process.env.NODE_ENV === 'production' ? '' : 'local-development-only'
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(`grant:${payload}`).digest('base64url')
}

export function createGrant(ids: string[]) {
  if (!secret() || ids.length === 0) return null
  const payload = `${ids.join('.')}~${Date.now() + GRANT_HOURS * 3600_000}`
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`
}

export function grantAllows(token: string | null, id: string) {
  if (!token || !secret()) return false
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return false

  const payload = Buffer.from(encoded, 'base64url').toString()
  const expected = sign(payload)
  if (expected.length !== signature.length) return false
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false

  const [ids, expires] = payload.split('~')
  if (!Number.isFinite(Number(expires)) || Number(expires) < Date.now()) return false
  return ids.split('.').includes(id)
}
