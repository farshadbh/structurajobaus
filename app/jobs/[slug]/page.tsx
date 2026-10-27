import {
  Building2,
  CalendarClock,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Plane,
  Wallet,
  Laptop,
} from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobCard, SectorBadge } from '@/components/jobs/job-card'
import { PageHeader } from '@/components/page-header'
import { EMPLOYMENT_TYPE_LABEL, formatDate, formatSalary, SITE_URL, WORK_ARRANGEMENT_LABEL } from '@/lib/format'
import { getAllJobSlugs, getJobBySlug, getRelatedJobs } from '@/lib/jobs'
import { getRole } from '@/lib/taxonomy'
import type { Job } from '@/lib/types'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return (await getAllJobSlugs()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const job = await getJobBySlug((await params).slug)
  if (!job) return {}
  const title = `${job.title} — ${job.organisation}, ${job.location}`
  return {
    title,
    description: job.summary,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: { title, description: job.summary, type: 'article' },
  }
}

function jobPostingJsonLd(job: Job) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `<p>${job.description}</p>`,
    datePosted: job.postedAt,
    validThrough: job.closingDate,
    employmentType:
      job.employmentType === 'full-time'
        ? 'FULL_TIME'
        : job.employmentType === 'part-time'
          ? 'PART_TIME'
          : job.employmentType === 'contract'
            ? 'CONTRACTOR'
            : 'OTHER',
    hiringOrganization: { '@type': 'Organization', name: job.organisation },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressRegion: job.state,
        addressCountry: 'AU',
      },
    },
    ...(job.workArrangement === 'remote' && {
      jobLocationType: 'TELECOMMUTE',
      applicantLocationRequirements: { '@type': 'Country', name: 'Australia' },
    }),
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'AUD',
      value: { '@type': 'QuantitativeValue', minValue: job.salaryMin, maxValue: job.salaryMax, unitText: 'YEAR' },
    },
    directApply: false,
    url: `${SITE_URL}/jobs/${job.slug}`,
  }
}

export default async function JobPage({ params }: { params: Params }) {
  const job = await getJobBySlug((await params).slug)
  if (!job) notFound()
  const related = await getRelatedJobs(job)
  const role = getRole(job.roleSlug)
  const sectorLabel = job.sector === 'academic' ? 'Academic jobs' : 'Industry jobs'

  const facts = [
    { icon: Wallet, label: 'Salary', value: formatSalary(job) },
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Clock, label: 'Employment', value: EMPLOYMENT_TYPE_LABEL[job.employmentType] },
    { icon: Laptop, label: 'Work arrangement', value: WORK_ARRANGEMENT_LABEL[job.workArrangement] },
    { icon: Plane, label: 'Visa sponsorship', value: job.visaSponsorship ? 'Available' : 'Not available' },
    { icon: CalendarDays, label: 'Posted', value: formatDate(job.postedAt) },
    { icon: CalendarClock, label: 'Closing date', value: formatDate(job.closingDate) },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job)) }} />
      <PageHeader
        eyebrow={role?.name ?? sectorLabel}
        title={job.title}
        description={job.summary}
        breadcrumbs={[
          { label: sectorLabel, href: `/${job.sector}` },
          { label: job.title, href: `/jobs/${job.slug}` },
        ]}
      >
        <p className="mt-5 flex items-center gap-2 text-white/85">
          <Building2 className="size-4" aria-hidden="true" />
          {job.organisation}
          {job.department && <span className="text-white/60">· {job.department}</span>}
        </p>
      </PageHeader>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <article className="min-w-0">
          <section aria-labelledby="about-role">
            <h2 id="about-role" className="text-xl font-semibold">
              About the role
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{job.description}</p>
          </section>

          <section aria-labelledby="responsibilities" className="mt-10">
            <h2 id="responsibilities" className="text-xl font-semibold">
              Key responsibilities
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {job.responsibilities.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="requirements" className="mt-10">
            <h2 id="requirements" className="text-xl font-semibold">
              Selection criteria
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {job.requirements.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {job.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Skills and keywords">
              {job.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-card p-6">
            <SectorBadge sector={job.sector} />
            <dl className="mt-5 flex flex-col divide-y">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-start gap-3 py-3 first:pt-0">
                  <fact.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Apply now
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-jobs" className="border-t bg-muted/50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="related-jobs" className="text-xl font-semibold">
              Similar {job.sector} jobs
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <JobCard job={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
