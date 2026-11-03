import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { AuthForm } from '@/components/account/auth-form'
import { AUTH_READY, getSessionUserId } from '@/lib/auth'
import { STORE_READY } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to save job lists and get new structural engineering roles emailed to you.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
}

export default async function LoginPage() {
  if (await getSessionUserId()) redirect('/account')

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Sign in"
        description="Saved lists and email alerts for new structural engineering roles."
        breadcrumbs={[{ label: 'Sign in', href: '/login' }]}
      />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        {!STORE_READY || !AUTH_READY ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Accounts are not switched on for this deployment yet. Everything else on the board works
            as normal.
          </p>
        ) : (
          <AuthForm mode="login" />
        )}
      </div>
    </>
  )
}
