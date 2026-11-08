import { BookOpen, Building2, GraduationCap, Mail, Search, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { ALL_ACADEMIC_STATS } from '@/lib/academics'
import { SITE_NAME, SITE_URL } from '@/lib/format'
import { FREE_VISIBLE } from '@/lib/plans'

const ROUTES = [
  {
    href: '/professors',
    icon: Search,
    title: 'Find a professor',
    body: 'Search every active researcher in Australia and New Zealand by topic, in any field — with their latest papers.',
  },
  {
    href: '/supervisors',
    icon: Users,
    title: 'Supervisor directory',
    body: `${ALL_ACADEMIC_STATS.total} hand-checked civil and structural engineering academics in nine countries.`,
  },
  {
    href: '/universities',
    icon: Building2,
    title: 'Universities',
    body: 'The QS 2027 top 500, grouped by country, with each official site one click away.',
  },
  {
    href: '/scholarships',
    icon: GraduationCap,
    title: 'PhD scholarships',
    body: 'Advertised PhD scholarships at Australian universities, refreshed every morning.',
  },
]

const STEPS = [
  {
    icon: Search,
    title: 'Search a topic',
    body: 'Type what you want to research. Only professors who are still publishing and still at a university are listed.',
  },
  {
    icon: BookOpen,
    title: 'Check the fit',
    body: 'Read their latest papers, and whether their page says they are taking students or have funding.',
  },
  {
    icon: Mail,
    title: 'Write and follow up',
    body: 'Open a ready-written email filled from your CV. We remind you to follow up after two weeks.',
  },
]

export default function HomePage() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/professors?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />

      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="hero-sky pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <span className="hero-stars" />
          <span className="hero-meteor" />
          <span className="hero-meteor hero-meteor-delayed" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-16 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs tracking-wider text-white/80 uppercase">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Australia &amp; New Zealand · every field
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find the professor who will <span className="text-accent">supervise your PhD</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-white/80">
            Search active researchers by topic, see what they published this year and whether they are
            taking students, and send an enquiry email that writes itself from your CV.
          </p>

          <form action="/professors" method="get" className="mt-10 max-w-3xl">
            <label htmlFor="home-q" className="sr-only">
              Research topic
            </label>
            <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="home-q"
                  name="q"
                  required
                  minLength={2}
                  placeholder='e.g. "seismic retrofit", hydrology, machine learning'
                  className="h-12 w-full rounded-lg bg-transparent pr-3 pl-9 text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Search className="size-4" /> Find professors
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span>Try:</span>
            {['seismic retrofit', 'hydrology', 'machine learning', 'cancer immunotherapy'].map((topic) => (
              <Link
                key={topic}
                href={`/professors?q=${encodeURIComponent(topic)}`}
                className="rounded-full border border-white/20 px-3 py-1 transition-colors hover:border-accent hover:text-white"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROUTES.map(({ href, icon: Icon, title, body }) => (
            <Link key={href} href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
              <Icon className="size-5 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-semibold group-hover:text-primary">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">From a topic to a sent email</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="rounded-xl border bg-card p-5">
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <Icon className="mt-2 size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-6 sm:p-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-accent" aria-hidden="true" /> Membership
            </p>
            <p className="mt-2 text-muted-foreground">
              Free accounts see the first {FREE_VISIBLE} professors of every search. Members see everyone,
              which professors are taking students or have funding, and get professors suggested from their
              CV with a percentage match.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-11 shrink-0 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            See membership
          </Link>
        </div>
      </section>
    </>
  )
}
