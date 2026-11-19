import { Building2, CalendarDays, MapPin, Plane, Wallet } from 'lucide-react'
import Link from 'next/link'
import {
  EMPLOYMENT_TYPE_LABEL,
  SOURCE_ATTRIBUTION,
  formatDate,
  formatSalary,
  WORK_ARRANGEMENT_LABEL,
} from '@/lib/format'
import type { Job } from '@/lib/types'
import { cn } from '@/lib/utils'

export function SectorBadge({ sector }: { sector: Job['sector'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide uppercase',
        'bg-primary/10 text-primary',
      )}
    >
      {sector}
    </span>
  )
}

export function JobCard({ job }: { job: Job }) {
  const attribution = job.source ? SOURCE_ATTRIBUTION[job.source] : undefined
  // Facts the ad simply does not state are left out rather than filled with a
  // placeholder, so every line on the card is real information.
  const salary = formatSalary(job)

  return (
    <article className="group relative flex h-full flex-col rounded-lg border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <SectorBadge sector={job.sector} />
        {job.featured && (
          <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            Featured
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base leading-snug font-semibold text-pretty">
        <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">
          {job.title}
        </Link>
      </h3>

      {job.organisation && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{job.organisation}</span>
        </p>
      )}

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.summary}</p>

      <dl className="mt-4 grid grid-cols-1 gap-1.5 text-sm">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Location</dt>
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <dd>{job.location}</dd>
        </div>
        {salary && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Salary</dt>
            <Wallet className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="font-medium">{salary}</dd>
          </div>
        )}
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Job attributes">
        <li className="rounded-full border px-2.5 py-0.5 text-xs">
          {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
        </li>
        <li className="rounded-full border px-2.5 py-0.5 text-xs">
          {WORK_ARRANGEMENT_LABEL[job.workArrangement]}
        </li>
        {job.visaSponsorship && (
          <li className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            <Plane className="size-3" aria-hidden="true" />
            Visa sponsorship
          </li>
        )}
      </ul>

      <div className="mt-auto pt-4">
        <p className="flex items-center gap-1.5 border-t pt-3 font-mono text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Posted <time dateTime={job.postedAt}>{formatDate(job.postedAt)}</time>
        </p>
        {attribution && (
          <a
            href={attribution.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            // Sits above the card-wide link overlay so attribution stays clickable.
            className="relative z-10 mt-2 inline-block text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            via {attribution.label}
          </a>
        )}
      </div>
    </article>
  )
}
