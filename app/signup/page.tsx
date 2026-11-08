import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { AuthForm } from '@/components/account/auth-form'
import { AUTH_READY, getSessionUserId } from '@/lib/auth'
import { STORE_READY } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Create a free PhD Compass account to search for active professors and upgrade to membership when you are ready.',
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
        description="Search active professors for free, and upgrade to see every result and match your CV."
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
              We store your email address, a hashed password and your membership status. Your CV stays
              on your device.
            </p>
          </>
        )}
      </div>
    </>
  )
}
