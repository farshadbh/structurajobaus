import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import {
  QS_2027,
  UNIVERSITIES,
  UNIVERSITIES_BY_COUNTRY,
  UNIVERSITIES_WITH_SITE,
  UNIVERSITIES_WITH_STAFF,
  universityLink,
  universitySlug,
} from '@/lib/universities'

export const metadata: Metadata = {
  title: 'Universities worldwide, QS 2027 ranked',
  description:
    'The QS World University Rankings 2027 top 200 alongside the wider directory, grouped by country, each with its official site. Supervisor records, research areas and published emails are added a university at a time.',
  alternates: { canonical: '/universities' },
}

export default function UniversitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Universities"
        title="Universities worldwide"
        description="The QS 2027 top 200 and the wider directory, grouped by country, each with the official site that leads to the staff pages that matter."
        breadcrumbs={[
          { label: 'Academic jobs', href: '/academic' },
          { label: 'Supervisors', href: '/supervisors' },
          { label: 'Universities', href: '/universities' },
        ]}
      >
        <p className="mt-8 max-w-2xl text-sm text-white/70">
          QS 2027 rank for the first {QS_2027.length} · {UNIVERSITIES.length} institutions in{' '}
          {UNIVERSITIES_BY_COUNTRY.length} countries · {UNIVERSITIES_WITH_SITE} with an official
          website · {UNIVERSITIES_WITH_STAFF} with transcribed supervisors.
        </p>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-4">
          <p className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Jump to a country
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {UNIVERSITIES_BY_COUNTRY.map((entry) => (
              <li key={entry.country}>
                <a
                  href={`#${universitySlug(entry.country)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {entry.country}
                  <span className="font-mono text-[10px]">{entry.universities.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Every <span className="font-mono text-xs text-foreground">#</span> is the institution&rsquo;s
          rank in the QS World University Rankings 2027, taken from the table QS publishes; ties share
          a rank. Institutions below the top {QS_2027.length} carry no number and come from Wikidata,
          ordered by how many Wikipedia language editions cover them. What a ranking can never supply
          is a person: names, research areas and emails are only ever added from a university&rsquo;s
          own staff pages, so most rows show no supervisors yet — the honest state of the directory
          rather than a missing feature. Ready to write to someone?{' '}
          <Link href="/supervisors" className="text-primary hover:underline">
            Find a supervisor
          </Link>
          .
        </p>

        {UNIVERSITIES_BY_COUNTRY.map((entry) => (
          <section
            key={entry.country}
            id={universitySlug(entry.country)}
            className="mt-10 scroll-mt-24"
            aria-labelledby={`uni-country-${universitySlug(entry.country)}`}
          >
            <h2
              id={`uni-country-${universitySlug(entry.country)}`}
              className="flex items-center gap-3 text-base font-semibold"
            >
              {entry.country}
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground">
                {entry.universities.length}
              </span>
            </h2>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {entry.universities.map((university) => (
                <li
                  key={`${university.rank}-${university.name}`}
                  className="flex items-baseline gap-2 rounded-md border bg-card px-3 py-2 text-sm"
                >
                  <span
                    className="min-w-[2.5rem] shrink-0 font-mono text-[11px] text-muted-foreground"
                    title={university.qsRank ? `QS World University Rankings 2027: ${university.qsRank}` : 'Not ranked in the QS 2027 top 200'}
                  >
                    {university.qsRank ? `#${university.qsRank}` : '·'}
                  </span>
                  <a
                    href={universityLink(university)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate hover:text-primary hover:underline"
                    title={`${university.name}${university.domain ? ` — ${university.domain}` : ' — no site recorded'}`}
                  >
                    {university.name}
                  </a>
                  {university.supervisors > 0 ? (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                      {university.supervisors}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] text-muted-foreground" aria-hidden="true">
                      —
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-12 border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          Ranks follow the QS World University Rankings 2027, published by QS on TopUniversities.com.
          Institution names, countries and websites come from Wikidata and are reused under CC0. The
          green number beside a university is the count of people transcribed from that
          institution&rsquo;s own pages; a dash means none yet. If you spot a wrong country or a dead
          link,{' '}
          <Link href="/post-a-job" className="text-primary hover:underline">
            send it in
          </Link>{' '}
          and it goes into the next update.
        </p>
      </section>
    </>
  )
}
