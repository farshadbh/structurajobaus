import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { JobCard } from '@/components/jobs/job-card'
import type { Job } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JobSectionProps {
  id: string
  eyebrow: string
  title: string
  description?: string
  jobs: Job[]
  href: string
  linkLabel: string
  columns?: 3 | 4
  className?: string
}

export function JobSection({ id, eyebrow, title, description, jobs, href, linkLabel, columns = 4, className }: JobSectionProps) {
  return (
    <section aria-labelledby={id} className={cn('py-16 md:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">{eyebrow}</p>
            <h2 id={id} className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {title}
            </h2>
            {description && <p className="mt-2 text-muted-foreground text-pretty">{description}</p>}
          </div>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {linkLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul
          className={cn(
            'mt-8 grid gap-4 sm:grid-cols-2',
            columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
