/*
 * Account storage on Upstash Redis over its REST API.
 *
 * Deliberately dependency-free: the whole point of this layer is that it speaks
 * plain HTTPS, so it works in a Vercel route handler, in a GitHub Actions job
 * (scripts/send-digests.mjs) and from a laptop without a native driver, a
 * connection pool or a lockfile change.
 *
 * Upstash's free tier is 256 MB and 10k commands/day, which is far more than a
 * niche job board needs: one sign-in costs two reads, and the daily digest costs
 * one read per subscriber.
 *
 * Every helper returns `null` when the two env vars are missing, so pages can
 * render an honest "accounts are not configured yet" state instead of throwing.
 */

const REST_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, '')
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export const STORE_READY = Boolean(REST_URL && REST_TOKEN)

async function command<T>(args: (string | number)[]): Promise<T | null> {
  if (!REST_URL || !REST_TOKEN) return null

  try {
    const response = await fetch(REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args.map(String)),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[store] command failed', args[0], response.status)
      return null
    }

    // Upstash replies with { result } or { error }.
    const payload = (await response.json()) as { result?: T; error?: string }
    if (payload.error) {
      console.error('[store] command error', args[0], payload.error)
      return null
    }
    return payload.result ?? null
  } catch (error) {
    console.error('[store] command threw', args[0], error)
    return null
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await command<string>(['GET', key])
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    console.error('[store] corrupt JSON at', key)
    return null
  }
}

export async function setJson(key: string, value: unknown): Promise<boolean> {
  return (await command<string>(['SET', key, JSON.stringify(value)])) === 'OK'
}

export async function remove(key: string): Promise<void> {
  await command<number>(['DEL', key])
}

export async function addToSet(key: string, member: string): Promise<void> {
  await command<number>(['SADD', key, member])
}

export async function removeFromSet(key: string, member: string): Promise<void> {
  await command<number>(['SREM', key, member])
}

export async function setMembers(key: string): Promise<string[]> {
  return (await command<string[]>(['SMEMBERS', key])) ?? []
}

/**
 * Fixed-window counter used to slow down password guessing. Returns the number
 * of hits in the current window, or 0 when storage is unavailable (fail open:
 * a broken cache must not lock people out of their own accounts).
 */
export async function hitCounter(key: string, windowSeconds: number): Promise<number> {
  const hits = await command<number>(['INCR', key])
  if (!hits) return 0

  if (hits === 1) await command<number>(['EXPIRE', key, windowSeconds])
  return hits
}
