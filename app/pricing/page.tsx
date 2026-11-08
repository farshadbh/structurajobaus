import { Check, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BillingButton } from '@/components/finder/upgrade-button'
import { PageHeader } from '@/components/page-header'
import { FREE_VISIBLE, PRO_PRICE_LABEL } from '@/lib/plans'
import { STRIPE_READY } from '@/lib/stripe'
import { viewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Membership',
  description: 'Free and paid membership for the professor finder: every result, supervision status and CV matching.',
  alternates: { canonical: '/pricing' },
}

const ROWS: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Supervisor directory, universities and scholarships', free: true, pro: true },
  { label: 'Professor search by keyword, all fields', free: `First ${FREE_VISIBLE} results`, pro: 'Every result' },
  { label: 'Latest papers of each professor', free: true, pro: true },
  { label: 'Ready-written email and follow-up tracking', free: true, pro: true },
  { label: 'CV fills in your email', free: true, pro: true },
  { label: 'Accepting students / funding read from their page', free: `For the ${FREE_VISIBLE} shown`, pro: true },
  { label: 'Professors suggested from your CV, with % match', free: false, pro: true },
  { label: 'AI reading of your CV and of staff pages (Claude)', free: false, pro: true },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-4 text-emerald-600" aria-label="Included" />
  if (value === false) return <X className="mx-auto size-4 text-muted-foreground" aria-label="Not included" />
  return <span className="text-xs">{value}</span>
}

export default async function PricingPage() {
  const { user, plan } = await viewer()

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Find the right supervisor faster"
        description="The free plan gives a taste of the professor finder. Membership opens every professor, their supervision status, and matching against your CV."
        breadcrumbs={[{ label: 'Membership', href: '/pricing' }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-medium text-muted-foreground">Feature</th>
                <th className="w-36 p-4 text-center">
                  Free
                  <span className="block text-xs font-normal text-muted-foreground">A$0</span>
                </th>
                <th className="w-36 bg-accent/10 p-4 text-center">
                  Member
                  <span className="block text-xs font-normal text-muted-foreground">{PRO_PRICE_LABEL}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="p-4">{row.label}</td>
                  <td className="p-4 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="bg-accent/5 p-4 text-center">
                    <Cell value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mx-auto mt-8 max-w-sm text-center">
          {plan === 'pro' ? (
            <>
              <p className="font-semibold text-emerald-700">Your membership is active.</p>
              {user?.stripeCustomerId && (
                <div className="mt-4">
                  <BillingButton action="portal" label="Manage billing" />
                </div>
              )}
              <Link href="/professors" className="mt-4 inline-block text-sm text-primary hover:underline">
                Go to the professor finder →
              </Link>
            </>
          ) : !user ? (
            <>
              <Link
                href="/signup"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Create a free account to start
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Already have one?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : STRIPE_READY ? (
            <>
              <BillingButton action="checkout" label={`Become a member — ${PRO_PRICE_LABEL}`} />
              <p className="mt-3 text-xs text-muted-foreground">Secure payment by Stripe. Cancel any time.</p>
            </>
          ) : (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Paid membership opens soon.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
