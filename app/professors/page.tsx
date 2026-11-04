import type { Metadata } from 'next'
import Link from 'next/link'
import { ProfessorFinder } from '@/components/finder/professor-finder'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Find a PhD supervisor in any field — Australia & New Zealand',
  description:
    'Search active professors in Australia and New Zealand by research topic, see their latest papers and whether they are taking students, and send a ready-written enquiry email.',
  alternates: { canonical: '/professors' },
}

export default function ProfessorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Professor finder"
        title="Find an active professor in any field"
        description="Type a research topic and see who is working on it right now at universities in Australia and New Zealand — their latest papers, whether they are taking students, and an enquiry email ready to send."
        breadcrumbs={[
          { label: 'Supervisors', href: '/supervisors' },
          { label: 'Professor finder', href: '/professors' },
        ]}
      >
        <ul className="mt-8 grid max-w-3xl gap-2 text-sm text-white/80 sm:grid-cols-3">
          <li>✓ Retired, departed and inactive academics filtered out</li>
          <li>✓ 3–4 latest papers for each professor</li>
          <li>✓ Emails and follow-ups tracked for you</li>
        </ul>
      </PageHeader>

      <ProfessorFinder />

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Looking for civil and structural engineering specifically? The{' '}
          <Link href="/supervisors" className="text-primary hover:underline">
            hand-checked supervisor directory
          </Link>{' '}
          covers nine countries. More regions are coming to the finder after Oceania.
        </p>
      </section>
    </>
  )
}
