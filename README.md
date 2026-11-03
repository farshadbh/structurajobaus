# SE Jobs Australia

A specialist job board for **structural engineering vacancies in Australia** — academic posts
(lecturer, professor, research fellow, PhD scholarship) alongside industry roles (structural,
bridge, civil, design, project).

Live site: https://structuraljobaus.vercel.app

## Stack

- Next.js 16 (App Router, React 19) with Tailwind CSS 4
- TypeScript, pnpm
- Listings stored as a committed JSON snapshot (`data/jobs.json`) and refreshed daily
- Deployed on Vercel

## How the daily update works

1. `.github/workflows/refresh-jobs.yml` runs at **19:00 UTC every day** = 06:00 in Sydney during
   daylight saving (AEDT, UTC+11). During standard time (AEST, UTC+10) it fires at 05:00 local, so
   the board is always fresh before 6am.
2. `scripts/ingest-jobs.mjs` queries the configured job APIs for structural/civil engineering
   roles, normalises each ad (title, employer, city, state, salary, employment type, visa
   sponsorship), filters out irrelevant and expired ads, and rewrites `data/jobs.json`. Every
   source is optional and skipped when its key is absent, so the job succeeds before the first
   key exists.
3. The workflow commits the snapshot. Vercel rebuilds on push, so the site reflects the new ads
   without any manual step.
4. Expired listings are dropped at build time (`closingDate` in the past), so dead ads never
   accumulate.

Run it manually any time:

```bash
pnpm ingest
```

## Accounts, saved lists and email alerts

Visitors can create a free account (`/signup`) and build **lists** — saved searches with keywords,
academic/industry, city, state, minimum salary and visa sponsorship. Each account chooses a daily,
weekly or monthly email; `scripts/send-digests.mjs` sends one email per period, and only when
something new matches.

| Piece | Service | Free tier |
| --- | --- | --- |
| Accounts, lists, preferences | Upstash Redis (REST API) | 256 MB, 10k commands/day |
| Email delivery | Brevo | 300 emails/day |
| Scheduling | GitHub Actions `send-digests.yml` | free on public repos |

Design notes worth knowing before changing any of it:

- **No new npm dependencies.** Upstash and Brevo are plain HTTPS, so sign-in and the digest run on
  `fetch` alone. That is also why the account layer does not use Auth.js: one email/password form
  does not justify a framework, and a dependency means regenerating the lockfile.
- **Passwords** are scrypt-hashed with a per-user salt. The session cookie is HttpOnly,
  SameSite=Lax, Secure in production, and carries an HMAC-SHA256 signature over the user id and
  expiry (`AUTH_SECRET`). Without `AUTH_SECRET`, sign-in is refused rather than falling back to a
  guessable key.
- **Failed sign-ins** are limited to 10 per network per 15 minutes, counted in the same Redis.
- **The digest queue** is the Redis set `digest:users`, so the scheduled run never scans every
  account ever created. It reads only the committed `data/jobs.json`, so an email can never
  advertise a role the board does not show.
- **Unsubscribe** uses a random per-account token (not a hash of the email), works without signing
  in, and Brevo also receives a `List-Unsubscribe` header.

## Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

### Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Vercel + GitHub Actions | Canonical host for canonical tags, sitemap, robots, OG. Falls back to the Vercel deployment URL when unset. |
| `CAREERJET_API_KEY` | GitHub Actions secret + local `.env` | Careerjet publisher key. Free, no card. 12 calls per run. |
| `JOOBLE_API_KEY` | GitHub Actions secret + local `.env` | Jooble AU key. Free, but 500 requests for the lifetime of the key, so only 4 calls per run. |
| `ADZUNA_APP_ID` | optional | Adzuna app id (trial is 25 lifetime calls; paid is £8/month). |
| `ADZUNA_APP_KEY` | optional | Adzuna app key. |
| `UPSTASH_REDIS_REST_URL` | Vercel + Actions secret | Upstash Redis REST endpoint. Accounts are off until this and the token are set. |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel + Actions secret | Upstash REST token. |
| `AUTH_SECRET` | Vercel | Signs the session cookie. `openssl rand -hex 32`. Changing it signs everyone out. |
| `BREVO_API_KEY` | Actions secret | Brevo transactional email key. Absent means the digest run logs a skip and exits 0. |
| `EMAIL_FROM` | Actions variable | Verified Brevo sender, e.g. `SE Jobs Australia <you@example.com>`. |
| `SITE_URL` | Actions variable | Public URL used in email links. Defaults to the Vercel deployment. |
| `NEXT_PUBLIC_DEMO_JOBS` | local only | `1` renders the bundled sample listings before the first sync. Never enable in production. |

Free keys: Careerjet at <https://www.careerjet.com/partners/api> (publisher account) and Jooble at
<https://au.jooble.org/api/about> — Australian keys must be created on the AU domain. Add them under
**GitHub → Settings → Secrets and variables → Actions**, then run *Actions → Refresh job listings →
Run workflow* once.

Careerjet and Jooble both require their own attribution link and redirect through their own URLs;
`SOURCE_ATTRIBUTION` in `lib/format.ts` renders it per listing.

## Source terms — read before monetising

Each aggregator has its own terms. Careerjet and Jooble both require a visible attribution link and
that listing traffic goes through their URLs, which the job card and detail page already do. Adzuna
also requires:

- the word **Adzuna** (at least 116×23 px) hyperlinked beside every published ad — implemented on
  each job card and detail page;
- all listing traffic to be directed through Adzuna's redirect URLs — `applyUrl` uses them;
- **written agreement for commercial use.** The free tier is for evaluation; a product that
  generates revenue or leads needs a licence after a 14-day trial.

Once you have a custom domain, set `NEXT_PUBLIC_SITE_URL` in Vercel and redeploy.

## Project layout

```
app/                 routes: /, /jobs, /jobs/[slug], /academic, /industry, /cities/[city], /account, /login, /signup, /privacy, /terms
components/          header, footer, hero, job cards, filters, listing
lib/jobs.ts          data access: live snapshot, expiry filtering, search/filtering
lib/taxonomy.ts      roles, cities, states, salary bands
lib/auth.ts          accounts: scrypt passwords, signed session cookie
lib/accounts.ts      saved-list validation, criteria → board filters, digest labels
lib/store.ts         Upstash Redis over REST (no driver)
components/account/  sign-in form, lists manager
data/jobs.json       the current listing snapshot (generated)
scripts/ingest-jobs.mjs   multi-source ingestion (Careerjet, Jooble, optional Adzuna)
scripts/send-digests.mjs  daily/weekly/monthly job alert email
scripts/001_create_jobs.sql   future Postgres/Supabase schema for direct employer posts
```

## Checks

```bash
pnpm typecheck
pnpm build
```

CI (`.github/workflows/ci.yml`) runs both on every push and pull request.
