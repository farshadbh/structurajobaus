import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SITE_NAME } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms on which PhD Compass, its professor search and its membership are provided.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of use"
        description="The basis on which this site and its membership are provided."
        breadcrumbs={[{ label: 'Terms', href: '/terms' }]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Last updated: 8 November 2026</p>

        <h2 className="mt-8 text-lg font-semibold">Information, not a promise</h2>
        <p className="mt-2 text-muted-foreground">
          {SITE_NAME} brings together public information about researchers, universities and
          scholarships. Whether a professor is taking students or has funding is read from their own
          pages and can be out of date; always confirm with the professor or the university. We are not
          an admissions agent and take no part in admission or scholarship decisions.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Membership</h2>
        <p className="mt-2 text-muted-foreground">
          Paid membership renews monthly until cancelled, and can be cancelled at any time from your
          account; access continues to the end of the paid period. Match percentages are an aid to
          choosing whom to contact, not an assessment of your chances.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Acceptable use</h2>
        <p className="mt-2 text-muted-foreground">
          Write to professors one at a time about genuine applications. Bulk or automated emailing,
          scraping, or reselling the data is not permitted.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Sources</h2>
        <p className="mt-2 text-muted-foreground">
          Research data comes from OpenAlex (CC0). Scholarship ads link to the original advertiser and
          remain subject to their terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Changes</h2>
        <p className="mt-2 text-muted-foreground">
          These terms may be updated as the service changes. Continued use after an update means you
          accept the revised terms.
        </p>
      </article>
    </>
  )
}
