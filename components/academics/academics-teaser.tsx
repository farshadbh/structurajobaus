import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AcademicDirectory } from '@/components/academics/academic-directory'
import { ACADEMIC_STATS, FIELDS, groupByUniversity } from '@/lib/academics'

function FieldChips() {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {FIELDS.filter((field) => ACADEMIC_STATS.byField[field.slug] > 0).map((field) => (
        <li key={field.slug}>
          <Link
            href={`/academic/people?field=${field.slug}`}
            className="flex h-full flex-col justify-between gap-2 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <span className="text-sm font-semibold">{field.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {ACADEMIC_STATS.byField[field.slug]} people
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * The signpost that sits under every academic job listing. The directory itself
 * lives at /academic/people; this is only the doorway, so the page keeps its own
 * job-listing shape.
 */
export function AcademicsTeaser() {
  return (
    <section aria-labelledby="academics-heading" className="border-t bg-muted/40 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
              Who researches what
            </p>
            <h2 id="academics-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Civil engineering academics across Australia
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {ACADEMIC_STATS.total} lecturers, senior lecturers, associate professors and professors
              at {ACADEMIC_STATS.universities} universities, with their research focus and contact
              details — grouped by university and field. Useful before you email a potential
              supervisor or apply for a research post.
            </p>
          </div>

          <Link
            href="/supervisors"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Find your supervisor
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <FieldChips />
      </div>
    </section>
  )
}

/**
 * The whole directory, shown inline under the PhD scholarship listings: a
 * scholarship hunt starts by finding someone whose research fits, so the names
 * belong on that page rather than one click away.
 */
export function AcademicsSection() {
  return (
    <>
      <section aria-labelledby="academics-heading" className="border-t bg-muted/40 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
                Supervisors
              </p>
              <h2 id="academics-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Find a supervisor for your PhD
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {ACADEMIC_STATS.total} lecturers, senior lecturers, associate professors and professors
                at {ACADEMIC_STATS.universities} universities, with what each one researches and how to
                reach them. Filter by field, then read the profile link before you write — a scholarship
                application is much stronger when the topic already matches the supervisor.
              </p>
            </div>

            <Link
              href="/supervisors"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open the full directory
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <FieldChips />
        </div>
      </section>

      <div className="border-b">
        <AcademicDirectory groups={groupByUniversity()} />
      </div>
    </>
  )
}
