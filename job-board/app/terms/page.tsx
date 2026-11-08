import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SITE_NAME } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms covering use of this structural engineering job board and its listings.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of use"
        description="The basis on which this job board and its listings are provided."
        breadcrumbs={[{ label: 'Terms', href: '/terms' }]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Last updated: 2 November 2026</p>

        <h2 className="mt-8 text-lg font-semibold">Listings are third-party content</h2>
        <p className="mt-2 text-muted-foreground">
          {SITE_NAME} aggregates vacancies published elsewhere. Listings are reproduced for
          convenience; the employer or original advertiser is responsible for their accuracy, and
          details such as salary, closing dates and eligibility can change or be withdrawn without
          notice. Always confirm the details on the original advertisement before applying.
        </p>

        <h2 className="mt-8 text-lg font-semibold">No employment relationship</h2>
        <p className="mt-2 text-muted-foreground">
          We are not a recruiter, agent or employer for any listed role, and we take no part in
          hiring decisions or employment contracts.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Attribution</h2>
        <p className="mt-2 text-muted-foreground">
          Some listings are supplied by third-party job aggregators and remain subject to their
          terms. Every listing is labelled with its source, and role details may be summarised from
          the original advertisement.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Acceptable use</h2>
        <p className="mt-2 text-muted-foreground">
          You may browse and link to this site freely. Automated scraping or bulk reproduction of the
          listing data is not permitted without written consent.
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
