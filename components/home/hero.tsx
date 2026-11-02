import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '@/components/home/search-bar'
import { CITIES } from '@/lib/taxonomy'

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
      <Image
        src="/images/hero-bridge.png"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, 1440px"
        className="-z-20 object-cover opacity-35"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/50"
        aria-hidden="true"
      />
      <div className="blueprint-grid absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 md:pt-24 md:pb-20 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs tracking-wider text-white/80 uppercase">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Australia&apos;s structural engineering job board
        </p>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Structural Engineering Academic &amp; Industry Jobs{' '}
          <span className="text-accent">Australia</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-white/80">
          Find the latest structural engineering and academic opportunities across Australia —
          refreshed every morning.
        </p>

        <div className="mt-10 max-w-5xl">
          <SearchBar />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
          <span>Popular:</span>
          {CITIES.slice(0, 4).map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-accent hover:text-white"
            >
              {city.name}
            </Link>
          ))}
          <Link
            href="/academic?role=phd-scholarship"
            className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-accent hover:text-white"
          >
            PhD Scholarships
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
