/*
 * Email-and-password accounts with a signed session cookie.
 *
 * Why not Auth.js/Clerk: neither is needed for one email/password form, and both
 * add a dependency plus a redirect dance. This is ~150 lines over node:crypto,
 * which is auditable and works unchanged in the GitHub Actions digest job.
 *
 * Security properties that matter here:
 *  - passwords are scrypt-hashed with a per-user random salt, compared in
 *    constant time;
 *  - the cookie is HttpOnly, SameSite=Lax, Secure in production, and carries an
 *    HMAC-SHA256 signature over the user id and expiry, so it cannot be forged;
 *  - the cookie holds an opaque user id, never the email address;
 *  - AUTH_SECRET has no default: without it, sign-in is refused rather than
 *    falling back to a guessable key.
 */

import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { getJson } from './store'

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

export const SESSION_COOKIE = 'sja_session'
const SESSION_DAYS = 30
const KEY_LENGTH = 64

function secret() {
  return process.env.AUTH_SECRET ?? ''
}

export const AUTH_READY = Boolean(secret())

export function newId(bytes = 16) {
  return randomBytes(bytes).toString('hex')
}

/* ---------------------------------------------------------------- passwords */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const derived = await scryptAsync(password, salt, expected.length)
  // Lengths match by construction; guard anyway so timingSafeEqual cannot throw.
  if (derived.length !== expected.length) return false
  return timingSafeEqual(derived, expected)
}

/* ----------------------------------------------------------------- sessions */

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

export function createSessionToken(userId: string) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${userId}.${expires}`
  return `${payload}.${sign(payload)}`
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token || !secret()) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [userId, expires, signature] = parts
  const expected = sign(`${userId}.${expires}`)
  if (signature.length !== expected.length) return null
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  if (!Number.isFinite(Number(expires)) || Number(expires) < Date.now()) return null

  return userId
}

export const sessionCookie = {
  name: SESSION_COOKIE,
  options: {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  },
}

/** The signed-in user id for this request, or null. */
export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies()
  return readSessionToken(jar.get(SESSION_COOKIE)?.value)
}

/* -------------------------------------------------------------------- users */

export type DigestFrequency = 'daily' | 'weekly' | 'monthly'

export interface StoredUser {
  id: string
  email: string
  passwordHash: string
  createdAt: string
  digestEnabled: boolean
  digestFrequency: DigestFrequency
  lastDigestAt?: string
  unsubscribedAt?: string
  unsubscribeToken: string
}

export const DIGEST_USERS_KEY = 'digest:users'
export const userKey = (email: string) => `user:${email.trim().toLowerCase()}`
export const userIdKey = (id: string) => `uid:${id}`

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  return getJson<StoredUser>(userKey(email))
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const email = await getJson<string>(userIdKey(id))
  return email ? findUserByEmail(email) : null
}

/** The current user, minus the password hash. */
export type PublicUser = Omit<StoredUser, 'passwordHash' | 'unsubscribeToken'>

export function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _hash, unsubscribeToken: _token, ...rest } = user
  return rest
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const id = await getSessionUserId()
  return id ? findUserById(id) : null
}
