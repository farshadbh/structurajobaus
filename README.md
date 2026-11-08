# PhD Compass

Find an active professor to supervise your PhD, check whether they are taking students, and write
to them with an email that fills itself from your CV.

This repository holds **two separate sites**:

| Site | Folder | What it is |
| --- | --- | --- |
| **PhD Compass** | repository root | Professor finder, supervisor directory, universities, PhD scholarships, membership |
| **SE Jobs Worldwide** | [`job-board/`](job-board/README.md) | Structural engineering job board: academic and industry jobs, visa sponsorship, job alerts, post a job |

Each has its own `package.json`, lockfile, Dockerfile and Render service, and is built and deployed
on its own. They share one thing: the job board's daily ingest also collects PhD scholarship ads and
writes them to `data/scholarships.json` here; they appear on PhD Compass only.

## Features

- **Professor finder** (`/professors`) — keyword search over every *active* researcher at universities
  in Australia and New Zealand, any field, from OpenAlex: most-cited first, with their 3–4 latest
  papers. Only people currently at a university in the region who published this year or last, with
  an established research record, are listed; topics are searched as a phrase, consortium papers are
  ignored, and people whose recent papers mostly list an overseas affiliation are dropped.
- **University-page check** — opening a professor reads their staff page for the published email,
  "accepting students", funding and emeritus status, with the sentence each verdict came from.
  Cached for 30 days.
- **Email and follow-up** — a ready-written enquiry email filled from the student's CV (read in the
  browser), with sent emails tracked and a follow-up suggested after 14 days.
- **Supervisor directory** (`/supervisors`, `/academic/people`) — hand-checked civil and structural
  engineering academics in nine countries.
- **Universities** (`/universities`) — the QS 2027 top 500 grouped by country with official sites.
- **PhD scholarships** (`/scholarships`) — open scholarship ads, refreshed daily by the job board's
  ingest.
- **Membership** (`/pricing`) — free accounts see the first 2 professors per search (the rest
  blurred, enforced on the server) and use their CV only to fill the email. Members see everything
  and get CV matching with a % score — private in-browser matching, plus Claude when
  `ANTHROPIC_API_KEY` is set. Payments by Stripe.

## Stack

- Next.js 16 (App Router, React 19), Tailwind CSS 4, TypeScript, pnpm
- Runs as a standalone Node server (`output: 'standalone'`), packaged by the `Dockerfile`
- Accounts in Upstash Redis over REST; keys are prefixed `compass:` so the job board can share the
  database

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # at least OPENALEX_API_KEY; PRO_EMAILS=you@example.com to see the member view
pnpm dev
```

With `pnpm dev` and no Upstash keys, accounts are kept in memory, so sign-up and the member view
work on localhost with no setup (they reset when the server restarts). Production requires Upstash
and `AUTH_SECRET`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical host, e.g. `https://phdcompass.com`. Falls back to Render's own address. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Where corrections and privacy requests go. Falls back to the GitHub issue tracker. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Accounts and caches. |
| `AUTH_SECRET` | Signs the session cookie. `openssl rand -hex 32`. |
| `OPENALEX_API_KEY` | **Required** for the professor finder. Free key from OpenAlex. |
| `BRAVE_SEARCH_API_KEY` | Finds staff pages on university sites (free tier). Without it only ORCID-listed pages are read. |
| `ANTHROPIC_API_KEY` | Claude matching and staff-page reading for members. Optional. |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` | Paid membership. Webhook URL: `https://<domain>/api/billing/webhook`, events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. |
| `PRO_EMAILS` | Comma-separated emails treated as members without paying (owner, testers). |
| `STORE_KEY_PREFIX` | Upstash key prefix, default `compass:`. |

## Hosting

`render.yaml` defines both sites. On render.com: New → Blueprint → pick this repository. Render
creates `phd-compass` (root) and `se-jobs-worldwide` (`job-board/`), each with a free
`onrender.com` address for testing. Add each custom domain under the service's Custom Domains and
set its `NEXT_PUBLIC_SITE_URL`.

Anywhere else with Docker:

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://phdcompass.com -t phd-compass .
docker run -p 3000:3000 --env-file .env.local phd-compass
```

## Scheduled jobs (GitHub Actions)

- `refresh-jobs.yml` — daily at 19:00 UTC: runs `job-board/scripts/ingest-jobs.mjs`, which writes
  `job-board/data/jobs.json` and this site's `data/scholarships.json`, and commits both.
- `send-digests.yml` — the job board's alert emails.
- `ci.yml` — type-checks and builds both sites on every push.

## Project layout

```
app/                     routes: /, /professors, /supervisors, /academic/people, /universities,
                         /scholarships, /pricing, /account, /login, /signup, /privacy, /terms
app/api/professors/      search, profile check, CV matching
app/api/billing/         Stripe checkout, portal, webhook
components/finder/       professor finder, membership buttons
components/supervisors/  supervisor directory, CV panel
lib/openalex.ts          professor search over OpenAlex
lib/enrich.ts            university staff-page check
lib/match.ts             CV keywords and match scoring (runs in the browser)
lib/claude.ts            Claude CV reading, scoring and page reading (members)
lib/plans.ts             free and paid plans
lib/academics.ts         supervisor directory data
lib/universities.ts      QS 2027 coverage list
lib/scholarships.ts      scholarship ads from data/scholarships.json
job-board/               the SE Jobs Worldwide job board (separate site)
```

## Checks

```bash
pnpm typecheck
pnpm build
```
