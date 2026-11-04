import type { Metadata } from 'next'
import Link from 'next/link'
import { SupervisorExplorer } from '@/components/supervisors/supervisor-explorer'
import { PageHeader } from '@/components/page-header'
import { ACADEMIC_VERIFIED_AT, ALL_ACADEMIC_STATS, COUNTRIES, PLANNED_COUNTRIES, countriesWithData } from '@/lib/academics'

export const metadata: Metadata = {
  title: 'Find a PhD supervisor — civil engineering academics worldwide',
  description:
    'A directory of civil and structural engineering professors, associate professors and lecturers in Australia, the USA, the UK, Canada, Germany, Ireland, Japan, Singapore and Hong Kong — research focus, contact details and a ready-written enquiry email.',
  alternates: { canonical: '/supervisors' },
}

export default function SupervisorsPage() {
  const covered = countriesWithData()
  const planned = COUNTRIES.filter((country) => !covered.some((entry) => entry.code === country.code))

  return (
    <>
      <PageHeader
        eyebrow="Supervisors"
        title="Find your supervisor"
        description="Who researches what, where, and how to write to them — across Australia, North America, the UK, Europe and Asia."
        breadcrumbs={[
          { label: 'Academic jobs', href: '/academic' },
          { label: 'Supervisors', href: '/supervisors' },
        ]}
      >
        <p className="mt-8 max-w-2xl text-sm text-white/70">
          {ALL_ACADEMIC_STATS.total} academics at {ALL_ACADEMIC_STATS.universities} universities in{' '}
          {covered.length} countries. Compiled from public university pages and checked{' '}
          {ACADEMIC_VERIFIED_AT}; emails appear only where the university publishes one.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Each one comes with an enquiry email already written. Add your CV and the email fills with
          your own details; filter by country, university or field, and the people you have written
          to turn green.
        </p>
      </PageHeader>

      <SupervisorExplorer pageSize={36} showDirectoryLink={false} showIntro={false} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold">Still to come</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The directory grows a university at a time, and only from pages we can actually read. These
          countries are next; the universities named below are the ones we have queued:
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {[...PLANNED_COUNTRIES, ...planned.map((country) => country.name)].join(' · ')}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Looking for a university that is not listed yet?{' '}
          <Link href="/universities" className="text-primary hover:underline">
            Browse the 500-university coverage list
          </Link>{' '}
          and go straight to its engineering staff page.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Know a supervisor who is missing?{' '}
          <Link href="/post-a-job" className="text-primary hover:underline">
            Send us the name and profile link
          </Link>{' '}
          and it goes into the next update.
        </p>
      </section>
    </>
  )
}
