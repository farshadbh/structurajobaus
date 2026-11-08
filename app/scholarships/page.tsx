import { CalendarDays, ExternalLink, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { SOURCE_ATTRIBUTION, formatDate, formatSalary } from '@/lib/format'
import { SCHOLARSHIPS_UPDATED_AT, getScholarships } from '@/lib/scholarships'

export const metadata: Metadata = {
  title: 'PhD scholarships',
  description: 'Open PhD scholarships at Australian universities, refreshed every morning.',
  alternates: { canonical: '/scholarships' },
}

export default function ScholarshipsPage() {
  const scholarships = getScholarships()

  return (
    <>
      <PageHeader
        eyebrow="Scholarships"
        title="PhD scholarships"
        description="Advertised PhD scholarships and funded projects at Australian universities, refreshed every morning. Closed ones are removed automatically."
        breadcrumbs={[{ label: 'Scholarships', href: '/scholarships' }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {scholarships.length === 0 ? (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">No scholarship ads are open right now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Most PhD funding in Australia and New Zealand is not advertised as a separate ad: it comes
              through a supervisor who has a funded project, or through the university&apos;s scholarship
              rounds. The fastest route is to find a professor whose work fits yours and ask.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link
                href="/professors"
                className="inline-flex h-10 items-center rounded-md bg-accent px-4 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Find a professor with funding
              </Link>
              <Link href="/universities" className="inline-flex h-10 items-center rounded-md border px-4 font-semibold">
                University scholarship pages
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4">
            {scholarships.map((item) => {
              const stipend = formatSalary(item)
              const attribution = item.source ? SOURCE_ATTRIBUTION[item.source] : undefined
              return (
                <li key={item.id} className="rounded-lg border bg-card p-5">
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  {item.organisation && <p className="mt-1 text-sm text-muted-foreground">{item.organisation}</p>}
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {item.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Closes {formatDate(item.closingDate)}
                    </span>
                    {stipend && <span>{stipend}</span>}
                  </p>
                  {item.summary && <p className="mt-3 text-sm leading-relaxed">{item.summary}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <a
                      href={item.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      View and apply <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                    {attribution && (
                      <a
                        href={attribution.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        via {attribution.label}
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {SCHOLARSHIPS_UPDATED_AT && (
          <p className="mt-6 text-xs text-muted-foreground">
            Last refreshed {new Date(SCHOLARSHIPS_UPDATED_AT).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}{' '}
            (Sydney).
          </p>
        )}
      </div>
    </>
  )
}
