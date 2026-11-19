# Academic Position

A specialist job board for **university positions in structural engineering in Australia** — postdoctoral fellow, research fellow, lecturer, senior lecturer, associate professor and professor. No industry roles, no PhD scholarships.

Live site: https://academic-position.vercel.app (Vercel project to be created — see below)

Split from `farshadbh/structurajobaus` (SE Jobs Australia) on 2026-11-19: the original site carried academic and industry roles together, including PhD scholarships. This repo is the academic-positions half, completely separate from the `phd-scholarship` repo. Industry roles were removed completely in the split; this repo publishes university positions only.

## Stack

- Next.js 16 (App Router, React 19) with Tailwind CSS 4
- TypeScript, pnpm
- Listings stored as a committed JSON snapshot (`data/jobs.json`) and refreshed daily
- Deployed on Vercel

## How the daily update works

1. `.github/workflows/refresh-jobs.yml` runs at **19:00 UTC every day** = 06:00 in Sydney during daylight saving (AEDT, UTC+11).
2. `scripts/ingest-jobs.mjs` queries the configured job APIs for university positions only, normalises each ad, filters out anything whose role is not one of the six academic roles, and rewrites `data/jobs.json`. Every source is optional and skipped when its key is absent.
3. The workflow commits the snapshot. Vercel rebuilds on push, so the site reflects the new ads without any manual step.
4. Expired listings are dropped at build time (`closingDate` in the past).

Run it manually any time:

```bash
pnpm ingest
```

## Accounts, saved lists and email alerts

Visitors can create a free account (`/signup`) and build **lists** — saved searches with keywords, city, state, minimum salary and visa sponsorship. Each account chooses a daily, weekly or monthly email; `scripts/send-digests.mjs` sends one email per period, and only when something new matches.

| Piece | Service | Free tier |
| --- | --- | --- |
| Accounts, lists, preferences | Upstash Redis (REST API) | 256 MB, 10k commands/day |
| Email delivery | Brevo | 300 emails/day |
| Scheduling | GitHub Actions `send-digests.yml` | free on public repos |

## Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

See `.env.example` for the variables (Careerjet, Jooble, optional Adzuna, Upstash Redis, `AUTH_SECRET`, Brevo). Add the API keys under **GitHub → Settings → Secrets and variables → Actions**, then run *Actions → Refresh job listings → Run workflow* once.

## Still to do before go-live

- Create a Vercel project from this repo (or import it) and set `NEXT_PUBLIC_SITE_URL` to the production host.
- Set the GitHub Actions secrets and the Vercel env vars from `.env.example`.

## Checks

```bash
pnpm typecheck
pnpm build
```

CI (`.github/workflows/ci.yml`) runs both on every push and pull request.
