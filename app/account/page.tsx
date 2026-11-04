import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ListsManager } from '@/components/account/lists-manager'
import { criteriaToFilters, listsKey, type SavedList } from '@/lib/accounts'
import { getCurrentUser } from '@/lib/auth'
import { getJobs } from '@/lib/jobs'
import Link from 'next/link'
import { BillingButton } from '@/components/finder/upgrade-button'
import { PRO_PRICE_LABEL, planOf } from '@/lib/plans'
import { STORE_READY, getJson } from '@/lib/store'

// Always render per request: the page depends on the session cookie and on
// whether the store is configured at runtime. Without this, a build made before
// the Upstash keys existed is prerendered as "accounts are not switched on" and
// keeps saying so after the keys are added.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My job alerts',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  if (!STORE_READY) {
    return (
      <>
        <PageHeader
          eyebrow="Your account"
          title="My job alerts"
          description="Saved lists and email alerts."
          breadcrumbs={[{ label: 'My alerts', href: '/account' }]}
        />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Accounts are not switched on for this deployment yet. Everything else on the board works
            as normal.
          </p>
        </div>
      </>
    )
  }

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const lists = (await getJson<SavedList[]>(listsKey(user.id))) ?? []

  // Match counts come from the same snapshot the board renders, so the number a
  // person sees on their dashboard is the number they would see in the results.
  const counts: Record<string, number> = {}
  for (const list of lists) {
    counts[list.id] = (await getJobs(criteriaToFilters(list.criteria))).length
  }

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="My job alerts"
        description="Custom lists of structural engineering roles, emailed to you when something new appears."
        breadcrumbs={[{ label: 'My alerts', href: '/account' }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Membership</h2>
          {planOf(user) === 'pro' ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p>
                <span className="font-medium text-emerald-700">Member</span>
                {user.proUntil ? ` until ${new Date(user.proUntil).toLocaleDateString('en-AU')}` : ''} — every
                professor, supervision status and CV matching are unlocked.
              </p>
              {user.stripeCustomerId && (
                <div className="w-44">
                  <BillingButton action="portal" label="Manage billing" />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Free plan. Membership ({PRO_PRICE_LABEL}) opens every professor in the finder and matches your CV
              against them.{' '}
              <Link href="/pricing" className="font-medium text-primary hover:underline">
                See membership
              </Link>
            </p>
          )}
        </section>
        <ListsManager
          email={user.email}
          lists={lists}
          counts={counts}
          digest={{ enabled: user.digestEnabled, frequency: user.digestFrequency }}
        />
      </div>
    </>
  )
}
