import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SITE_NAME, SITE_URL } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How this structural engineering job board handles visitor data and job listings.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What this site collects, why, and how to have a listing removed."
        breadcrumbs={[{ label: 'Privacy', href: '/privacy' }]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Last updated: 2 November 2026</p>

        <h2 className="mt-8 text-lg font-semibold">What we collect</h2>
        <p className="mt-2 text-muted-foreground">
          {SITE_NAME} is a read-only job board. There are no accounts, no logins and no forms that
          accept personal information. We do not ask for your name, email address or CV.
        </p>
        <p className="mt-2 text-muted-foreground">
          Aggregate, privacy-friendly analytics are used to understand which pages are used. These
          measurements do not use advertising cookies and are not used to build a profile of you.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Job listings</h2>
        <p className="mt-2 text-muted-foreground">
          Vacancies are aggregated from third-party job feeds and link out to the original advertiser.
          When you follow an apply link you leave this site and the destination&apos;s own privacy
          policy applies.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Removing a listing</h2>
        <p className="mt-2 text-muted-foreground">
          Employers and feed providers can request removal of any listing. Open an issue at{' '}
          <a
            className="underline hover:text-foreground"
            href="https://github.com/orodzarrin/structurajobaus/issues"
          >
            github.com/orodzarrin/structurajobaus
          </a>{' '}
          with the job title and organisation, and it will be removed from the next daily sync.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Contact</h2>
        <p className="mt-2 text-muted-foreground">
          Privacy questions can be raised through the same issue tracker. This policy will be updated
          with a direct contact address once one is published.
        </p>

        <p className="mt-8 text-xs text-muted-foreground">Site: {SITE_URL}</p>
      </article>
    </>
  )
}
