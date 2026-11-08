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

/*
 * Local development without Upstash: `pnpm dev` keeps accounts in memory, so
 * sign-up, membership (PRO_EMAILS) and saved lists can be tried on localhost
 * with no setup. Never used by `next build` / production: there the two
 * Upstash variables are required. Restarting `pnpm dev` clears the data.
 */
const USE_MEMORY = !(REST_URL && REST_TOKEN) && process.env.NODE_ENV === 'development'

export const STORE_READY = Boolean(REST_URL && REST_TOKEN) || USE_MEMORY

interface MemoryStore {
  values: Map<string, { value: string; expires?: number }>
  sets: Map<string, Set<string>>
}

// Kept on globalThis so hot reloads in development do not wipe it.
const memory: MemoryStore = ((globalThis as { __sjaMemoryStore?: MemoryStore }).__sjaMemoryStore ??= {
  values: new Map(),
  sets: new Map(),
})

function memoryCommand(args: (string | number)[]): unknown {
  const [name, key, ...rest] = args.map(String)
  const live = (k: string) => {
    const entry = memory.values.get(k)
    if (entry?.expires && entry.expires < Date.now()) {
      memory.values.delete(k)
      return undefined
    }
    return entry
  }

  switch (name.toUpperCase()) {
    case 'GET':
      return live(key)?.value ?? null
    case 'SET': {
      const ex = rest.indexOf('EX')
      memory.values.set(key, {
        value: rest[0],
        expires: ex >= 0 ? Date.now() + Number(rest[ex + 1]) * 1000 : undefined,
      })
      return 'OK'
    }
    case 'DEL':
      return memory.values.delete(key) ? 1 : 0
    case 'INCR': {
      const next = Number(live(key)?.value ?? 0) + 1
      memory.values.set(key, { value: String(next), expires: live(key)?.expires })
      return next
    }
    case 'EXPIRE': {
      const entry = live(key)
      if (entry) entry.expires = Date.now() + Number(rest[0]) * 1000
      return entry ? 1 : 0
    }
    case 'SADD': {
      const set = memory.sets.get(key) ?? new Set<string>()
      memory.sets.set(key, set)
      const added = set.has(rest[0]) ? 0 : 1
      set.add(rest[0])
      return added
    }
    case 'SREM':
      return memory.sets.get(key)?.delete(rest[0]) ? 1 : 0
    case 'SMEMBERS':
      return [...(memory.sets.get(key) ?? [])]
    default:
      return null
  }
}

async function command<T>(args: (string | number)[]): Promise<T | null> {
  if (USE_MEMORY) return memoryCommand(args) as T | null
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

/** SET with an expiry, for caches that should refresh on their own. */
export async function setJsonEx(key: string, value: unknown, seconds: number): Promise<boolean> {
  return (await command<string>(['SET', key, JSON.stringify(value), 'EX', seconds])) === 'OK'
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

/** A plain counter, e.g. apply clicks per listing. */
export async function increment(key: string): Promise<number> {
  return (await command<number>(['INCR', key])) ?? 0
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
