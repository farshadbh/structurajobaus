import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademicDirectory } from '@/components/academics/academic-directory'
import { PageHeader } from '@/components/page-header'
import {
  ACADEMIC_STATS,
  ACADEMIC_VERIFIED_AT,
  FIELDS,
  fieldName,
  getAcademics,
  groupByUniversity,
  isAcademicField,
} from '@/lib/academics'
import { cn } from '@/lib/utils'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const raw = (await searchParams).field
  const fieldParam = Array.isArray(raw) ? raw[0] : raw
  const field = isAcademicField(fieldParam) ? fieldParam : undefined

  return {
    title: field
      ? `${fieldName(field)} Engineering Academics in Australia`
      : 'Civil Engineering Academics in Australia',
    description: field
      ? `Lecturers, associate professors and professors in ${fieldName(field).toLowerCase()} engineering at Australian universities, with research focus and contact details.`
      : 'A directory of civil engineering academics in Australia — structural, geotechnical, transport and water — grouped by university, with research focus and contact details.',
    alternates: { canonical: field ? `/academic/people?field=${field}` : '/academic/people' },
    robots: { index: true, follow: true },
  }
}

export default async function AcademicPeoplePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).field
  const fieldParam = Array.isArray(raw) ? raw[0] : raw
  const field = isAcademicField(fieldParam) ? fieldParam : undefined

  const people = getAcademics({ country: 'AU', field })
  const groups = groupByUniversity(people)

  return (
    <>
      <PageHeader
        eyebrow="Academic directory"
        title="Civil engineering academics in Australia"
        description="Lecturers, senior lecturers, associate professors and professors, with what each one researches and how to contact them."
        breadcrumbs={[
          { label: 'Academic jobs', href: '/academic' },
          { label: 'Academics', href: '/academic/people' },
        ]}
      >
        <nav aria-label="Filter academics by field" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/academic/people"
                className={cn(
                  'inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  !field ? 'border-accent bg-accent text-accent-foreground' : 'border-white/20 hover:border-white/50',
                )}
              >
                All fields ({ACADEMIC_STATS.total})
              </Link>
            </li>
            {FIELDS.filter((entry) => ACADEMIC_STATS.byField[entry.slug] > 0).map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/academic/people?field=${entry.slug}`}
                  aria-current={field === entry.slug ? 'page' : undefined}
                  className={cn(
                    'inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    field === entry.slug
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-white/20 hover:border-white/50',
                  )}
                >
                  {entry.name} ({ACADEMIC_STATS.byField[entry.slug]})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <div className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            {people.length} {people.length === 1 ? 'academic' : 'academics'} at {groups.length}{' '}
            {groups.length === 1 ? 'university' : 'universities'}
            {field ? ` · ${fieldName(field)} engineering` : ''}
          </p>
          <p className="font-mono text-xs">
            Compiled from public university pages · checked {ACADEMIC_VERIFIED_AT}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <aside className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>
            Names, titles and research interests are transcribed from each university&apos;s own staff
            pages; the <em>Profile</em> link on every entry goes to the source. Email addresses are
            shown only where the university publishes one — elsewhere we deliberately leave the field
            empty rather than guess an address. Staff move and titles change, so check the profile
            before writing.
          </p>
          <p className="mt-2">
            Someone missing or listed wrongly?{' '}
            <Link href="/post-a-job" className="underline hover:no-underline">
              Send us a correction
            </Link>{' '}
            and it goes into the next update.
          </p>
        </aside>
      </div>

      <AcademicDirectory groups={groups} field={field} />
    </>
  )
}
