import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/account/logout-button'
import { BillingButton } from '@/components/finder/upgrade-button'
import { PageHeader } from '@/components/page-header'
import { getCurrentUser } from '@/lib/auth'
import { FREE_VISIBLE, PRO_PRICE_LABEL, planOf } from '@/lib/plans'
import { STORE_READY } from '@/lib/store'

// Always render per request: the page depends on the session cookie and on
// whether the store is configured at runtime.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  if (!STORE_READY) {
    return (
      <>
        <PageHeader eyebrow="Your account" title="My account" description="Membership and sign-in." breadcrumbs={[{ label: 'My account', href: '/account' }]} />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Accounts are not switched on for this deployment yet. Everything else on the site works as normal.
          </p>
        </div>
      </>
    )
  }

  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const pro = planOf(user) === 'pro'

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="My account"
        description={`Signed in as ${user.email}.`}
        breadcrumbs={[{ label: 'My account', href: '/account' }]}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Membership</h2>
          {pro ? (
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
              Free plan: the first {FREE_VISIBLE} professors of every search. Membership ({PRO_PRICE_LABEL}) opens
              every professor and matches your CV against them.{' '}
              <Link href="/pricing" className="font-medium text-primary hover:underline">
                See membership
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Your emails to professors</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The emails you send and the follow-ups due are listed at the bottom of the{' '}
            <Link href="/professors" className="font-medium text-primary hover:underline">
              professor finder
            </Link>
            . They are kept on this device, together with the details read from your CV.
          </p>
        </section>

        <LogoutButton />
      </div>
    </>
  )
}
