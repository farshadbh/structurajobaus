import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ListsManager } from '@/components/account/lists-manager'
import { criteriaToFilters, listsKey, type SavedList } from '@/lib/accounts'
import { getCurrentUser } from '@/lib/auth'
import { getJobs } from '@/lib/jobs'
import { STORE_READY, getJson } from '@/lib/store'

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
