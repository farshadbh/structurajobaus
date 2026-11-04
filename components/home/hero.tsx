import Link from 'next/link'
import { SearchBar } from '@/components/home/search-bar'

interface HeroProps {
  stats: { total: number; academic: number; industry: number; visa: number }
}

export function Hero({ stats }: HeroProps) {
  const statItems = [
    { label: 'Live roles', value: stats.total },
    { label: 'Academic', value: stats.academic },
    { label: 'Industry', value: stats.industry },
    { label: 'Visa sponsored', value: stats.visa },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="hero-sky absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <span className="hero-stars" />
        <span className="hero-meteor" />
        <span className="hero-meteor hero-meteor-delayed" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 md:pt-24 md:pb-20 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs tracking-wider text-white/80 uppercase">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Global structural engineering careers
        </p>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Structural Engineering Academic &amp; Industry Jobs{' '}
          <span className="text-accent">Worldwide</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-white/80">
          Explore industry and academic jobs, and find universities and PhD supervisors around the world.
        </p>

        <div className="mt-10 max-w-5xl">
          <SearchBar />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
          <span>Popular:</span>
          <Link
            href="/academic?role=phd-scholarship"
            className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-accent hover:text-white"
          >
            PhD Scholarships
          </Link>
          <Link
            href="/universities"
            className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-accent hover:text-white"
          >
            Universities worldwide
          </Link>
          <Link
            href="/supervisors"
            className="rounded-full border border-accent/60 bg-accent/10 px-3 py-1 font-medium text-white transition-colors hover:border-accent"
          >
            Find a supervisor
          </Link>
        </div>

        <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 sm:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.label} className="bg-primary/80 px-5 py-4 backdrop-blur">
              <dt className="font-mono text-[11px] tracking-wider text-white/75 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
