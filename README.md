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
2. `scripts/ingest-jobs.mjs` queries the Adzuna AU API for structural/civil engineering roles,
   normalises each ad (title, employer, city, state, salary, employment type, visa sponsorship),
   filters out irrelevant and expired ads, and rewrites `data/jobs.json`.
3. The workflow commits the snapshot. Vercel rebuilds on push, so the site reflects the new ads
   without any manual step.
4. Expired listings are dropped at build time (`closingDate` in the past), so dead ads never
   accumulate.

Run it manually any time:

```bash
pnpm ingest
```

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
| `ADZUNA_APP_ID` | GitHub Actions secret + local `.env` | Adzuna API app id. |
| `ADZUNA_APP_KEY` | GitHub Actions secret + local `.env` | Adzuna API key. |
| `NEXT_PUBLIC_DEMO_JOBS` | local only | `1` renders the bundled sample listings before the first sync. Never enable in production. |

Get free keys at <https://developer.adzuna.com>, then add them under
**GitHub → Settings → Secrets and variables → Actions**.

## Adzuna terms — read before monetising

Adzuna's terms permit publishing their listings, but require:

- the word **Adzuna** (at least 116×23 px) hyperlinked beside every published ad — implemented on
  each job card and detail page;
- all listing traffic to be directed through Adzuna's redirect URLs — `applyUrl` uses them;
- **written agreement for commercial use.** The free tier is for evaluation; a product that
  generates revenue or leads needs a licence after a 14-day trial.

Once you have a custom domain, set `NEXT_PUBLIC_SITE_URL` in Vercel and redeploy.

## Project layout

```
app/                 routes: /, /jobs, /jobs/[slug], /academic, /industry, /cities/[city], /privacy, /terms
components/          header, footer, hero, job cards, filters, listing
lib/jobs.ts          data access: live snapshot, expiry filtering, search/filtering
lib/taxonomy.ts      roles, cities, states, salary bands
data/jobs.json       the current listing snapshot (generated)
scripts/ingest-jobs.mjs   Adzuna ingestion
scripts/001_create_jobs.sql   future Postgres/Supabase schema for direct employer posts
```

## Checks

```bash
pnpm typecheck
pnpm build
```

CI (`.github/workflows/ci.yml`) runs both on every push and pull request.
