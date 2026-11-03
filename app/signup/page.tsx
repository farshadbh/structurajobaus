import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { AuthForm } from '@/components/account/auth-form'
import { AUTH_READY, getSessionUserId } from '@/lib/auth'
import { STORE_READY } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Create a free account to save custom lists of structural engineering jobs and get new matches by email daily, weekly or monthly.',
  alternates: { canonical: '/signup' },
  robots: { index: false, follow: true },
}

export default async function SignupPage() {
  if (await getSessionUserId()) redirect('/account')

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Create a free account"
        description="Save your own lists of roles and we will email new matches as they appear."
        breadcrumbs={[{ label: 'Create account', href: '/signup' }]}
      />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        {!STORE_READY || !AUTH_READY ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Accounts are not switched on for this deployment yet. Everything else on the board works
            as normal.
          </p>
        ) : (
          <>
            <AuthForm mode="signup" />
            <p className="mt-6 text-xs text-muted-foreground">
              We store your email address, a hashed password and the lists you create. Nothing else.
              Alerts are off until you switch them on, and every email carries a one-click
              unsubscribe link.
            </p>
          </>
        )}
      </div>
    </>
  )
}
