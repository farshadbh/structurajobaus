import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { CONTACT_HREF, SITE_NAME, SITE_URL } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What PhD Compass collects, what stays on your device, and how to have data removed.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What this site collects, what stays on your device, and how to have data removed."
        breadcrumbs={[{ label: 'Privacy', href: '/privacy' }]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Last updated: 8 November 2026</p>

        <h2 className="mt-8 text-lg font-semibold">Accounts</h2>
        <p className="mt-2 text-muted-foreground">
          You can search {SITE_NAME} without an account. If you create one we store your email address,
          a password hash (never the password itself) and your membership status. Payments are handled
          by Stripe; we never see or store card details.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Your CV</h2>
        <p className="mt-2 text-muted-foreground">
          Your CV is read in your browser. The details used to fill in emails (name, degree, contact
          lines) are kept on your device only, as is the list of professors you have emailed. With the
          private matching option, only research keywords leave your device. If you choose AI matching,
          the CV text is sent once to our server and to Anthropic&apos;s Claude API to be read, and is not
          stored by us.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Professor information</h2>
        <p className="mt-2 text-muted-foreground">
          Researcher profiles come from OpenAlex, ORCID and the researchers&apos; own university pages.
          Emails are shown only where the university or the researcher publishes them. Researchers can
          ask for a correction or removal through the contact link below.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Contact and removal</h2>
        <p className="mt-2 text-muted-foreground">
          To delete your account, correct a profile or ask a privacy question,{' '}
          <a className="underline hover:text-foreground" href={CONTACT_HREF}>
            contact us
          </a>
          .
        </p>

        <p className="mt-8 text-xs text-muted-foreground">Site: {SITE_URL}</p>
      </article>
    </>
  )
}
