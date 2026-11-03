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
        <p className="text-muted-foreground">Last updated: 3 November 2026</p>

        <h2 className="mt-8 text-lg font-semibold">What we collect</h2>
        <p className="mt-2 text-muted-foreground">
          You can read every page of {SITE_NAME} without an account, and nothing is collected if you
          do. Accounts are optional and exist only to save job lists and email new matches.
        </p>
        <p className="mt-2 text-muted-foreground">
          Aggregate, privacy-friendly analytics are used to understand which pages are used. These
          measurements do not use advertising cookies and are not used to build a profile of you.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Accounts and email alerts</h2>
        <p className="mt-2 text-muted-foreground">
          If you create an account we store your email address, a password hash (never the password
          itself), the lists you save, and whether you have switched alerts on. We do not store your
          name, your CV or anything about which ads you apply to.
        </p>
        <p className="mt-2 text-muted-foreground">
          Email alerts are off until you switch them on. Every alert email carries a one-click
          unsubscribe link that works without signing in; unsubscribing stops all alert email and
          keeps your lists. Ask for your account to be deleted through the issue tracker below and it
          is removed with everything in it. Email delivery is handled by Brevo, which processes the
          address only to send the message.
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
