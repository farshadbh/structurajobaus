import type { Metadata } from 'next'
import { JobSubmissionForm } from '@/components/forms/job-submission-form'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Post a Structural Engineering Job',
  description:
    'Advertise a university position in structural engineering to Australian candidates. Submit the role for review and it goes live with the next daily update.',
  alternates: { canonical: '/post-a-job' },
}

export default function PostAJobPage() {
  return (
    <>
      <PageHeader
        eyebrow="For employers"
        title="Post a structural engineering job"
        description="Reach academics and researchers across Australia. Submissions are reviewed before publication."
        breadcrumbs={[{ label: 'Post a job', href: '/post-a-job' }]}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
        <section aria-labelledby="submission-form">
          <h2 id="submission-form" className="text-lg font-semibold">
            Role details
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            All fields except the salary range are required.
          </p>
          <JobSubmissionForm />
        </section>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">How review works</h2>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-4 text-sm text-muted-foreground">
              <li>You submit the role and get a reference number.</li>
              <li>We check the listing is a genuine structural engineering vacancy.</li>
              <li>Approved roles appear with the next daily update, by 6am Sydney time.</li>
            </ol>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Listing rules</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
              <li>University positions in structural or civil engineering based in Australia.</li>
              <li>A working application link or email address.</li>
              <li>No recruiter spam or roles without a named employer.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
