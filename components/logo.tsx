import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)} aria-label="PhD Compass home">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5 13.4 13.4 8.5 15.5l2.1-4.9z" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('text-base font-semibold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>
          PhD <span className="text-accent">Compass</span>
        </span>
        <span
          className={cn(
            'mt-1 font-mono text-[10px] tracking-wider uppercase',
            inverted ? 'text-white/60' : 'text-muted-foreground',
          )}
        >
          Supervisors · Scholarships
        </span>
      </span>
    </Link>
  )
}
