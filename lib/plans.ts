/*
 * Membership tiers for the professor finder.
 *
 *  - free (and signed-out visitors): a search shows the first FREE_VISIBLE
 *    professors in full and the rest blurred; the CV is used only to fill in the
 *    email - no matching, no AI.
 *  - pro (paid): every result, the university-page check (accepting students /
 *    funding / email), and CV matching with a percentage - in the browser, plus
 *    Claude when ANTHROPIC_API_KEY is set.
 *
 * The gate is enforced on the server: the search route never sends a free user
 * the names, emails or papers behind the blur, so it cannot be lifted with the
 * browser's developer tools.
 */

import type { StoredUser } from './auth'

export type Plan = 'free' | 'pro'

/** Professors a free member sees in full per search. */
export const FREE_VISIBLE = 2

export const PRO_PRICE_LABEL = process.env.NEXT_PUBLIC_PRO_PRICE_LABEL || 'A$19 / month'

/**
 * Comma-separated emails that are treated as pro without paying: the owner's
 * own account and testers during the trial run, before Stripe is connected.
 */
function complimentaryEmails() {
  return new Set(
    (process.env.PRO_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function planOf(user: StoredUser | null | undefined): Plan {
  if (!user) return 'free'
  if (complimentaryEmails().has(user.email.toLowerCase())) return 'pro'
  if (user.plan === 'pro') {
    // A cancelled subscription keeps working until the end of the paid period.
    if (!user.proUntil || Date.parse(user.proUntil) > Date.now()) return 'pro'
  }
  return 'free'
}

export const isPro = (user: StoredUser | null | undefined) => planOf(user) === 'pro'
