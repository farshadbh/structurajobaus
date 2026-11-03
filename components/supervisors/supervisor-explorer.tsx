'use client'

import { Check, ExternalLink, Mail, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CountryLandmark } from '@/components/academics/country-landmark'
import { COUNTRY_PHOTOS } from '@/data/country-photos'
import {
  ACADEMICS,
  COUNTRIES,
  FIELDS,
  countriesWithData,
  groupByCountryAndUniversity,
  universitiesFor,
  type Academic,
  type AcademicField,
  type CountryCode,
} from '@/lib/academics'
import { mailtoHref } from '@/lib/supervisor-email'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'sjs.supervisors.emailed.v1'

type EmailedMap = Record<string, string>
type CountryFilter = 'all' | CountryCode
type FieldFilter = 'all' | AcademicField

const COUNTRIES_WITH_DATA = countriesWithData()
const COUNTRY_BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]))

function SupervisorCard({
  person,
  emailed,
  onEmail,
}: {
  person: Academic
  emailed: boolean
  onEmail: () => void
}) {
  const href = mailtoHref(person)

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border bg-card p-5 transition-colors',
        emailed && 'border-emerald-300 bg-emerald-50/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold">{person.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
        </div>
        {emailed && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
            <Check className="size-3" aria-hidden="true" />
            Emailed
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.researchFocus}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
        {href ? (
          <a
            href={href}
            onClick={onEmail}
            className="inline-flex items-center gap-1.5 font-medium break-all text-primary hover:underline"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            {person.email}
          </a>
        ) : (
          // A guessed address sends a student's enquiry to a stranger with a
          // similar name, so an unpublished one stays empty.
          <span className="text-xs text-muted-foreground">Email not published</span>
        )}

        <a
          href={person.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Profile
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

export function SupervisorExplorer({
  pageSize = 24,
  id = 'supervisors',
}: {
  pageSize?: number
  id?: string
}) {
  const [country, setCountry] = useState<CountryFilter>('all')
  const [university, setUniversity] = useState('all')
  const [field, setField] = useState<FieldFilter>('all')
  const [shown, setShown] = useState(pageSize)
  const [emailed, setEmailed] = useState<EmailedMap>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setEmailed(JSON.parse(raw) as EmailedMap)
    } catch {
      // Private mode or a blocked store: the list simply stays empty.
    }
    setReady(true)
  }, [])

  function persist(next: EmailedMap) {
    setEmailed(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Nothing to do - the tick is still shown for this visit.
    }
  }

  const markEmailed = (person: Academic) =>
    persist({ ...emailed, [person.id]: new Date().toISOString() })

  const removeEmailed = (personId: string) => {
    const next = { ...emailed }
    delete next[personId]
    persist(next)
  }

  const universities = useMemo(
    () => universitiesFor(country === 'all' ? undefined : country),
    [country],
  )

  const people = useMemo(
    () =>
      ACADEMICS.filter(
        (person) =>
          (country === 'all' || person.country === country) &&
          (university === 'all' || person.university === university) &&
          (field === 'all' || person.field === field),
      ),
    [country, university, field],
  )

  const groups = useMemo(
    () => groupByCountryAndUniversity(people.slice(0, shown)),
    [people, shown],
  )
  const emailedPeople = useMemo(
    () =>
      Object.entries(emailed)
        .sort(([, a], [, b]) => b.localeCompare(a))
        .map(([personId]) => ACADEMICS.find((person) => person.id === personId))
        .filter((person): person is Academic => Boolean(person)),
    [emailed],
  )

  const active = country !== 'all' || university !== 'all' || field !== 'all'
  const selectedCountry = country === 'all' ? null : COUNTRY_BY_CODE.get(country)
  // The site is Australian, so "all countries" still carries a home-country backdrop.
  const backdrop = COUNTRY_PHOTOS[selectedCountry?.code ?? 'AU']

  function updateCountry(next: CountryFilter) {
    setCountry(next)
    setUniversity('all')
    setShown(pageSize)
  }

  return (
    <section id={id} className="relative scroll-mt-24 overflow-hidden border-y bg-muted/40 py-14 md:py-16">
      <CountryLandmark code={selectedCountry?.code ?? 'AU'} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">
              {selectedCountry ? selectedCountry.name : 'Supervisors'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Find your supervisor
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {ACADEMICS.length} lecturers, associate professors and professors at{' '}
              {new Set(ACADEMICS.map((person) => person.university)).size} universities in{' '}
              {COUNTRIES_WITH_DATA.length} countries — their research focus, and an enquiry email
              already written to each one. Filter by country, university or field, pick the people
              whose work fits, and the ones you have written to turn green.
            </p>
          </div>

          <Link
            href="/supervisors"
            className="inline-flex h-10 items-center gap-2 rounded-md border bg-card px-4 text-sm font-semibold transition-colors hover:border-primary/40"
          >
            Open the full directory
          </Link>
        </div>

        <div className="mt-8 rounded-xl border bg-card p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Country
              </span>
              <select
                value={country}
                onChange={(event) => updateCountry(event.target.value as CountryFilter)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">All countries ({ACADEMICS.length})</option>
                {COUNTRIES_WITH_DATA.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.name} (
                    {ACADEMICS.filter((person) => person.country === entry.code).length})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                University
              </span>
              <select
                value={university}
                onChange={(event) => {
                  setUniversity(event.target.value)
                  setShown(pageSize)
                }}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">All universities</option>
                {universities.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Field of study
              </span>
              <select
                value={field}
                onChange={(event) => {
                  setField(event.target.value as FieldFilter)
                  setShown(pageSize)
                }}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">All fields</option>
                {FIELDS.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              {active && (
                <button
                  type="button"
                  onClick={() => updateCountry('all')}
                  className="h-10 rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-sm text-muted-foreground">
              {people.length} {people.length === 1 ? 'supervisor' : 'supervisors'}
              {field !== 'all' && ` in ${FIELDS.find((entry) => entry.slug === field)?.name.toLowerCase()}`}
              {university !== 'all' && ` at ${university}`}
            </p>

            {groups.length === 0 ? (
              <p className="mt-8 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                Nobody matches those three filters yet. Try a wider country or field.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.country.code} className="mt-8 first:mt-6">
                  <h3 className="flex items-center gap-3 text-sm font-semibold">
                    {group.country.name}
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {group.universities.reduce((total, entry) => total + entry.people.length, 0)}
                    </span>
                  </h3>

                  {group.universities.map((entry) => (
                    <div key={entry.university} className="mt-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-base font-semibold tracking-tight">{entry.university}</h4>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {entry.state} · {entry.people.length}
                        </p>
                      </div>

                      {entry.byField.map((section) => (
                        <div key={section.field} className="mt-4">
                          <h5 className="flex items-center gap-3 font-mono text-[10px] font-medium tracking-wider uppercase">
                            <span className="text-accent">{section.name}</span>
                            <span className="h-px flex-1 bg-border" aria-hidden="true" />
                          </h5>
                          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                            {section.people.map((person) => (
                              <li key={person.id}>
                                <SupervisorCard
                                  person={person}
                                  emailed={ready && Boolean(emailed[person.id])}
                                  onEmail={() => markEmailed(person)}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}

            {shown < people.length && (
              <button
                type="button"
                onClick={() => setShown(shown + pageSize)}
                className="mt-8 h-10 rounded-md border bg-card px-4 text-sm font-semibold transition-colors hover:border-primary/40"
              >
                Show more ({people.length - shown} left)
              </button>
            )}

            <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">
              Background photograph:{' '}
              <a
                href={backdrop.source}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                {backdrop.credit}
              </a>{' '}
              / Wikimedia Commons, {backdrop.license}.
            </p>
          </div>

          <aside className="self-start lg:sticky lg:top-24">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Emailed ({emailedPeople.length})
                </h3>
                {emailedPeople.length > 0 && (
                  <button
                    type="button"
                    onClick={() => persist({})}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Saved in this browser. Clicking an address also writes the email for you.
              </p>

              {emailedPeople.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nobody yet. Once you email someone, their card turns green and they appear here,
                  so you never write to the same supervisor twice.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {emailedPeople.map((person) => (
                    <li key={person.id} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{person.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{person.university}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmailed(person.id)}
                        aria-label={`Remove ${person.name} from the emailed list`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 rounded-xl border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">Before you send</p>
              <p className="mt-1">
                Fill in the brackets, attach your CV and transcript, and mention one specific paper or
                project of theirs. A generic email to twenty professors gets answered by none of them.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
