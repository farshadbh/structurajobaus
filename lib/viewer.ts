import { AUTH_READY, getCurrentUser, type StoredUser } from './auth'
import { planOf, type Plan } from './plans'
import { STORE_READY } from './store'

/** Who is asking, and on which plan. Signed-out visitors are on the free plan. */
export async function viewer(): Promise<{ user: StoredUser | null; plan: Plan }> {
  if (!AUTH_READY || !STORE_READY) return { user: null, plan: 'free' }
  try {
    const user = await getCurrentUser()
    return { user, plan: planOf(user) }
  } catch {
    return { user: null, plan: 'free' }
  }
}
