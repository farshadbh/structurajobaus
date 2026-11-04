'use client'

import {
  BadgeCheck,
  BookOpen,
  Check,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  Search,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CvPanel } from '@/components/supervisors/cv-panel'
import type { CandidateProfile } from '@/lib/cv'
import type { ProfileCheck, Signal } from '@/lib/enrich'
import { extractKeywords, type MatchScore } from '@/lib/match'
import type { ProfessorSummary, RegionCode } from '@/lib/openalex'
import {
  buildFollowUpEmail,
  buildSupervisorEmail,
  mailto,
  type EmailRecipient,
} from '@/lib/supervisor-email'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------- storage */

const SENT_KEY = 'sjs.finder.emailed.v1'
const CV_KEY = 'sjs.supervisors.cv.v1'
const ATTACH_KEY = 'sjs.supervisors.attach.v1'
/** Days of silence after which the follow-up is suggested. */
const FOLLOW_UP_AFTER_DAYS = 14

interface SentEntry {
  name: string
  institution: string
  email: string
  area: string
  title: string
  focus: string
  sentAt: string
  followUpAt?: string
}
type SentMap = Record<string, SentEntry>

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function store(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode: the state still applies for this visit.
  }
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
const daysSince = (iso: string) => Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
const flag = (code: RegionCode) => (code === 'NZ' ? '🇳🇿' : '🇦🇺')
const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact' }).format(n)

/* ------------------------------------------------------------------ types */

type Plan = 'free' | 'pro'

interface SearchResponse {
  query: string
  total: number
  page: number
  pageSize: number
  plan: Plan
  professors: ProfessorSummary[]
  locked: number
  grant: string | null
  error?: string
}

interface MatchRow {
  professor: ProfessorSummary
  match: MatchScore
}

interface Detail {
  professor: ProfessorSummary
  active: boolean
  check: ProfileCheck
}

/* ------------------------------------------------------------ small parts */

function SignalBadge({ kind, value }: { kind: 'students' | 'funding'; value: Signal }) {
  if (value === 'unknown') return null
  const yes = value === 'yes'
  const label =
    kind === 'students'
      ? yes
        ? 'Accepting students'
        : 'Not taking students'
      : yes
        ? 'Funding mentioned'
        : 'No funding now'
  const Icon = kind === 'students' ? BadgeCheck : CircleDollarSign
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        yes ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900',
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}

function MatchBadge({ match }: { match: MatchScore }) {
  const tone =
    match.percent >= 80
      ? 'bg-emerald-600 text-white'
      : match.percent >= 60
        ? 'bg-emerald-100 text-emerald-900'
        : match.percent >= 40
          ? 'bg-amber-100 text-amber-900'
          : 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-1 font-mono text-sm font-semibold', tone)}>
      {match.percent}% match
    </span>
  )
}

function ProfessorCard({
  person,
  match,
  sent,
  onOpen,
}: {
  person: ProfessorSummary
  match?: MatchScore
  sent?: SentEntry
  onOpen: () => void
}) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border bg-card p-5 transition-colors',
        sent && 'border-emerald-300 bg-emerald-50/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onOpen}
            className="text-left text-base font-semibold hover:text-primary hover:underline"
          >
            {person.name}
          </button>
          <p className="mt-1 text-sm text-muted-foreground">
            {flag(person.institution.country)} {person.institution.name}
          </p>
        </div>
        {match ? (
          <MatchBadge match={match} />
        ) : sent ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
            <Check className="size-3" aria-hidden="true" />
            {sent.followUpAt ? 'Followed up' : 'Emailed'}
          </span>
        ) : null}
      </div>

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {compact(person.citations)} citations · h-index {person.hIndex} · active {person.lastActiveYear}
      </p>

      {person.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {person.topics.slice(0, 4).map((topic) => (
            <span key={topic} className="rounded-full border bg-background px-2 py-0.5 text-[11px]">
              {topic}
            </span>
          ))}
        </div>
      )}

      {match?.reason && <p className="mt-3 text-sm text-emerald-900">{match.reason}</p>}
      {match && !match.reason && match.shared.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">In common: {match.shared.join(', ')}</p>
      )}

      {person.recentWorks.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Recent papers
          </p>
          <ol className="mt-2 space-y-1.5 text-sm">
            {person.recentWorks.slice(0, 4).map((work) => (
              <li key={work.title} className="leading-snug">
                <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{work.year}</span>
                {work.url ? (
                  <a href={work.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                    {work.title}
                  </a>
                ) : (
                  work.title
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {sent ? 'Open email' : 'Email & details'}
        </button>
        {person.orcid && (
          <a
            href={`https://orcid.org/${person.orcid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            ORCID
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  )
}

function LockedCards({ count, signedIn }: { count: number; signedIn: boolean }) {
  if (count <= 0) return null
  const shown = Math.min(count, 4)
  return (
    <div className="relative mt-4">
      <div aria-hidden="true" className="pointer-events-none grid gap-4 select-none sm:grid-cols-2">
        {Array.from({ length: shown }, (_, index) => (
          <div key={index} className="rounded-lg border bg-card p-5 blur-[6px]">
            <div className="h-4 w-2/3 rounded bg-foreground/30" />
            <div className="mt-2 h-3 w-1/2 rounded bg-foreground/15" />
            <div className="mt-4 flex gap-2">
              <div className="h-5 w-24 rounded-full bg-foreground/10" />
              <div className="h-5 w-20 rounded-full bg-foreground/10" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-foreground/10" />
              <div className="h-3 w-5/6 rounded bg-foreground/10" />
              <div className="h-3 w-4/6 rounded bg-foreground/10" />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl border bg-card/95 p-6 text-center shadow-lg">
          <Lock className="mx-auto size-6 text-accent" aria-hidden="true" />
          <p className="mt-3 text-lg font-semibold">{count} more active professors found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Members see every result, which professors are taking students or have funding, and their
            CV matched against each one with a percentage.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
            >
              See membership
            </Link>
            {!signedIn && (
              <Link href="/login" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ panel */

function recipientFor(person: ProfessorSummary, check: ProfileCheck | null, area: string): EmailRecipient {
  return {
    name: person.name,
    title: check?.title ?? 'Dr',
    researchFocus: person.topics.slice(0, 2).join(' and ') || area,
    email: check?.email ?? null,
    area,
  }
}

function ProfessorPanel({
  person,
  grant,
  area,
  profile,
  attachCv,
  sent,
  onSent,
  onFollowedUp,
  onClose,
}: {
  person: ProfessorSummary
  grant: string | null
  area: string
  profile: CandidateProfile | null
  attachCv: boolean
  sent?: SentEntry
  onSent: (entry: SentEntry) => void
  onFollowedUp: () => void
  onClose: () => void
}) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [subject, setSubject] = useState('')
  const [copied, setCopied] = useState(false)

  const followUpDue = sent && !sent.followUpAt && daysSince(sent.sentAt) >= FOLLOW_UP_AFTER_DAYS
  const mode: 'first' | 'follow-up' = sent && !sent.followUpAt ? 'follow-up' : 'first'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/professors/${person.id}${grant ? `?grant=${encodeURIComponent(grant)}` : ''}`)
      .then(async (response) => {
        const data = await response.json()
        if (cancelled) return
        if (!response.ok) setError(data.error ?? 'Could not load this professor.')
        else setDetail(data as Detail)
      })
      .catch(() => !cancelled && setError('Could not load this professor.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [person.id, grant])

  const recipient = useMemo(
    () => recipientFor(detail?.professor ?? person, detail?.check ?? null, area),
    [detail, person, area],
  )

  useEffect(() => {
    const email =
      mode === 'follow-up'
        ? buildFollowUpEmail(recipient, profile ?? undefined, { attachCv, sentAt: sent?.sentAt })
        : buildSupervisorEmail(recipient, profile ?? undefined, { attachCv })
    setSubject(email.subject)
    setDraft(email.body)
  }, [recipient, profile, attachCv, mode, sent?.sentAt])

  function recordSend() {
    if (mode === 'follow-up') onFollowedUp()
    else if (recipient.email) {
      onSent({
        name: person.name,
        institution: person.institution.name,
        email: recipient.email,
        area,
        title: recipient.title,
        focus: recipient.researchFocus,
        sentAt: new Date().toISOString(),
      })
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${draft}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const check = detail?.check
  const works = detail?.professor.recentWorks ?? person.recentWorks
  const searchUrl = check?.universitySite
    ? `https://www.google.com/search?q=${encodeURIComponent(`"${person.name}" site:${new URL(check.universitySite).hostname}`)}`
    : `https://www.google.com/search?q=${encodeURIComponent(`"${person.name}" ${person.institution.name}`)}`

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label={person.name}>
      <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-background p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-wider text-accent uppercase">
              {flag(person.institution.country)} {person.institution.name}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{person.name}</h2>
            {check?.title && <p className="text-sm text-muted-foreground">{check.title}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {compact(person.citations)} citations · h-index {person.hIndex} · {person.worksCount} works · last
          published {person.lastActiveYear}
        </p>

        {/* University-page check */}
        <section className="mt-5 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">From the university page</h3>
          {loading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Reading their staff page…
            </p>
          ) : error ? (
            <p className="mt-2 text-sm text-red-700">{error}</p>
          ) : check ? (
            <>
              {(check.inactive || detail?.active === false) && (
                <p className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  Their page suggests they may be emeritus or no longer at the university. Check before writing.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <SignalBadge kind="students" value={check.acceptingStudents} />
                <SignalBadge kind="funding" value={check.funding} />
                {check.acceptingStudents === 'unknown' && check.funding === 'unknown' && (
                  <span className="text-sm text-muted-foreground">
                    {check.homepage
                      ? 'Their page does not say whether they are taking students or have funding - asking is normal.'
                      : 'We could not find their staff page automatically.'}
                  </span>
                )}
              </div>
              {check.evidence.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-l-2 pl-3 text-xs text-muted-foreground">
                  {check.evidence.map((line) => (
                    <li key={line}>“{line}”</li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {check.homepage ? (
                  <a href={check.homepage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    Staff page <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    Search the university site <ExternalLink className="size-3" />
                  </a>
                )}
                {check.method === 'claude' && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="size-3" /> read by AI
                  </span>
                )}
              </div>
            </>
          ) : null}
        </section>

        {works.length > 0 && (
          <section className="mt-5">
            <h3 className="text-sm font-semibold">Recent papers</h3>
            <ol className="mt-2 space-y-1.5 text-sm">
              {works.slice(0, 6).map((work) => (
                <li key={work.title}>
                  <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{work.year}</span>
                  {work.url ? (
                    <a href={work.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                      {work.title}
                    </a>
                  ) : (
                    work.title
                  )}
                  {work.venue && <span className="text-xs text-muted-foreground"> — {work.venue}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Email */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {mode === 'follow-up' ? 'Follow-up email' : 'Your email'}
            </h3>
            {sent && (
              <span className="text-xs text-emerald-800">
                Sent {shortDate(sent.sentAt)}
                {sent.followUpAt ? ` · followed up ${shortDate(sent.followUpAt)}` : followUpDue ? ' · follow-up due' : ''}
              </span>
            )}
          </div>
          {!profile && (
            <p className="mt-1 text-xs text-muted-foreground">
              Add your CV on the finder page and your name, degree and contact details fill in by themselves.
            </p>
          )}
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-3 h-10 w-full rounded-md border bg-card px-3 text-sm"
            aria-label="Subject"
          />
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={16}
            className="mt-2 w-full rounded-md border bg-card p-3 font-mono text-[13px] leading-relaxed"
            aria-label="Email text"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Replace every [bracketed] part before sending - a specific sentence about their recent paper
            is what gets a reply.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {recipient.email ? (
              <a
                href={mailto(recipient.email, subject, draft)}
                onClick={recordSend}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Mail className="size-4" />
                {mode === 'follow-up' ? 'Send follow-up' : `Email ${recipient.email}`}
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                {loading ? 'Looking for their published email…' : 'No published email found - use the staff page link above.'}
              </span>
            )}
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy text'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- main */

export function ProfessorFinder() {
  const [plan, setPlan] = useState<Plan>('free')
  const [signedIn, setSignedIn] = useState(false)
  const [claudeAvailable, setClaudeAvailable] = useState(false)

  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<'all' | RegionCode>('all')
  const [sort, setSort] = useState<'citations' | 'relevance'>('citations')
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const [cv, setCv] = useState<CandidateProfile | null>(null)
  const [cvText, setCvText] = useState('')
  const [attachCv, setAttachCv] = useState(true)
  const [useClaude, setUseClaude] = useState(true)
  const [matching, setMatching] = useState(false)
  const [matches, setMatches] = useState<MatchRow[] | null>(null)
  const [matchInfo, setMatchInfo] = useState<{ mode: string; keywords: string[]; summary: string | null } | null>(null)

  const [sent, setSent] = useState<SentMap>({})
  const [open, setOpen] = useState<ProfessorSummary | null>(null)

  useEffect(() => {
    setSent(load<SentMap>(SENT_KEY, {}))
    setCv(load<CandidateProfile | null>(CV_KEY, null))
    setAttachCv(load<boolean>(ATTACH_KEY, true) !== false)
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data: { email: string | null; plan?: Plan }) => {
        setSignedIn(Boolean(data.email))
        setPlan(data.plan === 'pro' ? 'pro' : 'free')
      })
      .catch(() => null)
    fetch('/api/professors/match')
      .then((response) => response.json())
      .then((data: { claude?: boolean }) => setClaudeAvailable(Boolean(data.claude)))
      .catch(() => null)
  }, [])

  const isPro = plan === 'pro'
  const area = (query.trim() || open?.fields[0] || 'research').toLowerCase()

  async function runSearch(nextPage = 1) {
    if (query.trim().length < 2) {
      setError('Type a research topic, e.g. "seismic retrofit", "hydrology" or "machine learning".')
      return
    }
    setSearching(true)
    setError('')
    setMatches(null)
    try {
      const params = new URLSearchParams({ q: query.trim(), sort, page: String(nextPage) })
      if (region !== 'all') params.set('region', region)
      const response = await fetch(`/api/professors/search?${params}`)
      const data = (await response.json()) as SearchResponse
      if (!response.ok) {
        setError(data.error ?? 'The search failed.')
        return
      }
      setResult(data)
      setPage(nextPage)
      if (data.plan) setPlan(data.plan)
    } catch {
      setError('The search failed. Check your connection and try again.')
    } finally {
      setSearching(false)
    }
  }

  async function runMatch() {
    if (!cvText.trim()) {
      setError('Add your CV first - matching reads the research in it.')
      return
    }
    setMatching(true)
    setError('')
    try {
      const claude = claudeAvailable && useClaude
      const keywords = extractKeywords(cvText)
      const response = await fetch('/api/professors/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          // The CV text leaves the browser only when the member chose AI matching.
          cvText: claude ? cvText : undefined,
          useClaude: claude,
          region: region === 'all' ? undefined : region,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Matching failed.')
        return
      }
      setMatches(data.matches as MatchRow[])
      setMatchInfo({
        mode: data.mode,
        keywords: (data.keywords as { term: string }[]).map((kw) => kw.term),
        summary: data.summary,
      })
      setResult(null)
    } catch {
      setError('Matching failed. Check your connection and try again.')
    } finally {
      setMatching(false)
    }
  }

  function saveCv(next: CandidateProfile | null) {
    setCv(next)
    if (!next) {
      setCvText('')
      try {
        window.localStorage.removeItem(CV_KEY)
      } catch {}
    } else store(CV_KEY, next)
  }

  function markSent(id: string, entry: SentEntry) {
    const next = { ...sent, [id]: sent[id] ?? entry }
    setSent(next)
    store(SENT_KEY, next)
  }

  function markFollowedUp(id: string) {
    if (!sent[id]) return
    const next = { ...sent, [id]: { ...sent[id], followUpAt: new Date().toISOString() } }
    setSent(next)
    store(SENT_KEY, next)
  }

  function forget(id: string) {
    const next = { ...sent }
    delete next[id]
    setSent(next)
    store(SENT_KEY, next)
  }

  const sentList = Object.entries(sent).sort(([, a], [, b]) => b.sentAt.localeCompare(a.sentAt))
  const shownPeople: { person: ProfessorSummary; match?: MatchScore }[] = matches
    ? matches.map((row) => ({ person: row.professor, match: row.match }))
    : (result?.professors ?? []).map((person) => ({ person }))

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search bar */}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void runSearch(1)
        }}
        className="rounded-xl border bg-card p-3 sm:p-4"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_200px_auto]">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Research topic or keyword
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='e.g. "seismic retrofit", hydrology, machine learning, cancer immunotherapy'
                className="h-11 w-full rounded-md border bg-background pr-3 pl-9 text-sm"
                name="q"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Country</span>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value as 'all' | RegionCode)}
              className="h-11 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">🇦🇺 🇳🇿 Australia & New Zealand</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="NZ">🇳🇿 New Zealand</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Order</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'citations' | 'relevance')}
              className="h-11 rounded-md border bg-background px-3 text-sm"
            >
              <option value="citations">Most cited first</option>
              <option value="relevance">Most papers on this topic</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
          >
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Find professors
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Only active researchers are listed: currently at a university in the chosen country and published in{' '}
          {new Date().getFullYear() - 1} or {new Date().getFullYear()}. Data from{' '}
          <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="underline">
            OpenAlex
          </a>
          ; staff-page details are read from each university&apos;s own site.
        </p>
      </form>

      {/* CV + matching */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <CvPanel
          profile={cv}
          onChange={saveCv}
          onText={setCvText}
          onClear={() => saveCv(null)}
          attachCv={attachCv}
          onAttachChange={(next) => {
            setAttachCv(next)
            store(ATTACH_KEY, next)
          }}
        />
        <div className="rounded-lg border bg-card p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-accent" /> Match my CV
          </p>
          {isPro ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Reads the research in your CV and ranks active professors by how closely their work fits, as
                a percentage.
              </p>
              {claudeAvailable && (
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={useClaude} onChange={(event) => setUseClaude(event.target.checked)} className="mt-1" />
                  <span>
                    Use AI (Claude) for a deeper reading
                    <span className="block text-xs text-muted-foreground">
                      Sends your CV text to our server once; it is not stored. Untick to match privately in your
                      browser.
                    </span>
                  </span>
                </label>
              )}
              <button
                type="button"
                onClick={runMatch}
                disabled={matching || !cvText}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {matching ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {matching ? 'Matching…' : cvText ? 'Find my matches' : 'Add your CV to match'}
              </button>
              {cv && !cvText && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Your CV details are remembered, but its text is not - add the file again to match.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Members get professors suggested from their CV - &quot;94% match&quot; - with the overlap
                spelled out. On the free plan your CV fills in the email only.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent/10"
              >
                <Lock className="size-4" /> Unlock CV matching
              </Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {/* Results */}
      {(result || matches) && (
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">
                {matches
                  ? `Professors matched to your CV`
                  : `${result!.total} active professors for “${result!.query}”`}
              </h2>
              {matchInfo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {matchInfo.mode === 'claude' ? 'Read by AI. ' : 'Matched privately in your browser. '}
                  Keywords: {matchInfo.keywords.slice(0, 8).join(', ')}
                </p>
              )}
              {matchInfo?.summary && <p className="mt-1 max-w-3xl text-sm">{matchInfo.summary}</p>}
            </div>
            {result && isPro && result.total > result.pageSize && (
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(result.total / result.pageSize)}
              </p>
            )}
          </div>

          {shownPeople.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No active professors found. Try a broader or differently worded topic.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shownPeople.map(({ person, match }) => (
                <ProfessorCard
                  key={person.id}
                  person={person}
                  match={match}
                  sent={sent[person.id]}
                  onOpen={() => setOpen(person)}
                />
              ))}
            </div>
          )}

          {result && !isPro && <LockedCards count={result.locked} signedIn={signedIn} />}

          {result && isPro && result.total > page * result.pageSize && (
            <div className="mt-6 flex justify-center gap-2">
              {page > 1 && (
                <button type="button" onClick={() => runSearch(page - 1)} className="h-10 rounded-md border px-4 text-sm">
                  Previous
                </button>
              )}
              <button type="button" onClick={() => runSearch(page + 1)} className="h-10 rounded-md border px-4 text-sm font-semibold">
                Next 20
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sent emails and follow-ups */}
      {sentList.length > 0 && (
        <div className="mt-12 rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">Your emails</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kept on this device. A follow-up is suggested after {FOLLOW_UP_AFTER_DAYS} days without a reply.
          </p>
          <ul className="mt-4 divide-y">
            {sentList.map(([id, entry]) => {
              const due = !entry.followUpAt && daysSince(entry.sentAt) >= FOLLOW_UP_AFTER_DAYS
              const followUp = buildFollowUpEmail(
                { name: entry.name, title: entry.title, researchFocus: entry.focus, email: entry.email, area: entry.area },
                cv ?? undefined,
                { attachCv, sentAt: entry.sentAt },
              )
              return (
                <li key={id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-muted-foreground">{entry.institution}</span>
                  <span className="text-xs text-emerald-800">
                    Sent {shortDate(entry.sentAt)}
                    {entry.followUpAt ? ` · followed up ${shortDate(entry.followUpAt)}` : ''}
                  </span>
                  {!entry.followUpAt && (
                    <a
                      href={mailto(entry.email, followUp.subject, followUp.body)}
                      onClick={() => markFollowedUp(id)}
                      className={cn('text-xs font-medium underline', due ? 'text-accent' : 'text-muted-foreground')}
                    >
                      {due ? 'Follow-up due - send it' : 'Send a follow-up'}
                    </a>
                  )}
                  <button type="button" onClick={() => forget(id)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {open && (
        <ProfessorPanel
          person={open}
          grant={result?.grant ?? null}
          area={area}
          profile={cv}
          attachCv={attachCv}
          sent={sent[open.id]}
          onSent={(entry) => markSent(open.id, entry)}
          onFollowedUp={() => markFollowedUp(open.id)}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}
