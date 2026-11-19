#!/usr/bin/env node
/**
 * Emails each subscriber the new roles that match their saved lists.
 *
 * Runs from .github/workflows/send-digests.yml, an hour after the listing refresh
 * commits a fresh data/jobs.json. Keeping it in Actions rather than a Vercel cron
 * means it costs nothing, is not limited to one run a day on the Hobby plan, and
 * shares the same secrets surface as the ingest job.
 *
 * Deliberately dependency-free: Upstash and Brevo are both plain HTTPS, so this
 * runs on a bare `node` with no install step.
 *
 *   node scripts/send-digests.mjs            send
 *   node scripts/send-digests.mjs --dry-run  print who would get what
 */

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE_URL = (process.env.SITE_URL || 'https://academic-position.vercel.app').replace(/\/+$/, '')
const SITE_NAME = 'SE Jobs Australia'
const REST_URL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '')
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''
const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const DRY_RUN = process.argv.includes('--dry-run')

// Brevo's free plan allows 300 emails a day; stay well inside it.
const MAX_SENDS = Number(process.env.MAX_SENDS || 90)
const DAY_MS = 86_400_000
const WINDOW_DAYS = { daily: 1, weekly: 7, monthly: 30 }
const CLOSED_FREQUENCIES = new Set(Object.keys(WINDOW_DAYS))

const log = (...args) => console.log('[digest]', ...args)

/* ------------------------------------------------------------------ storage */

async function redis(args) {
  try {
    const response = await fetch(REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args.map(String)),
    })
    if (!response.ok) {
      log('redis command failed', args[0], response.status)
      return null
    }
    const payload = await response.json()
    if (payload.error) {
      log('redis command error', args[0], payload.error)
      return null
    }
    return payload.result ?? null
  } catch (error) {
    log('redis command threw', args[0], error.message)
    return null
  }
}

async function getJson(key) {
  const raw = await redis(['GET', key])
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function setJson(key, value) {
  return (await redis(['SET', key, JSON.stringify(value)])) === 'OK'
}

/* ------------------------------------------------------------------ matching */

const sydneyToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

/**
 * Mirrors the board's own filters for the fields a saved list can carry. If this
 * drifts from lib/jobs.ts, a subscriber would be emailed jobs they cannot
 * reproduce in the UI, so both sides only ever support the same six filters.
 */
export function matchesList(criteria, job) {
  if (criteria.sector && job.sector !== criteria.sector) return false
  if (criteria.state && job.state !== criteria.state) return false
  if (criteria.city && job.city !== criteria.city) return false
  if (criteria.visaOnly && !job.visaSponsorship) return false

  if (criteria.minSalary) {
    if (!job.salaryMax || job.salaryMax < criteria.minSalary) return false
  }

  if (criteria.keywords) {
    const terms = String(criteria.keywords).toLowerCase().split(/\s+/).filter(Boolean)
    const haystack = [
      job.title,
      job.organisation,
      job.department,
      job.location,
      job.summary,
      ...(Array.isArray(job.tags) ? job.tags : []),
    ]
      .join(' ')
      .toLowerCase()
    if (!terms.every((term) => haystack.includes(term))) return false
  }

  return true
}

/* --------------------------------------------------------------------- email */

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

function salary(job) {
  if (!job.salaryMin && !job.salaryMax) return null
  const min = job.salaryMin ?? job.salaryMax
  const max = job.salaryMax ?? job.salaryMin
  return min === max ? `${AUD.format(min)} p.a.` : `${AUD.format(min)} – ${AUD.format(max)} p.a.`
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Australia/Sydney',
  }).format(new Date(`${iso}T00:00:00Z`))
}

export function buildEmail(deliveries, unsubscribeUrl) {
  const total = deliveries.reduce((sum, entry) => sum + entry.jobs.length, 0)
  const subject =
    total === 1
      ? '1 new structural engineering job for you'
      : `${total} new structural engineering jobs for you`

  const sections = deliveries
    .map(({ list, jobs }) => {
      const rows = jobs
        .map((job) => {
          const pay = salary(job)
          const meta = [job.organisation, job.location].filter(Boolean).join(' · ')
          return `
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #e6e8eb">
                <a href="${SITE_URL}/jobs/${job.slug}" style="color:#1e3a5f;font-weight:600;font-size:15px;text-decoration:none">${escapeHtml(job.title)}</a>
                <div style="color:#5b6675;font-size:13px;margin-top:3px">${escapeHtml(meta)}</div>
                <div style="color:#5b6675;font-size:13px;margin-top:3px">
                  ${pay ? `<span style="color:#1f6f4a;font-weight:600">${escapeHtml(pay)}</span> · ` : ''}
                  Closes ${escapeHtml(formatDate(job.closingDate))}
                </div>
              </td>
            </tr>`
        })
        .join('')

      return `
        <tr>
          <td style="padding:22px 0 6px">
            <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a3f;font-weight:700">${escapeHtml(list.name)}</div>
          </td>
        </tr>
        ${rows}`
    })
    .join('')

  const html = `<!doctype html>
<html lang="en-AU">
<body style="margin:0;padding:0;background:#f7f7f5">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e6e8eb;border-radius:10px;padding:28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
        <tr><td>
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a3f;font-weight:700">${SITE_NAME}</div>
          <h1 style="margin:8px 0 4px;font-size:20px;color:#1e293b">${total} new ${total === 1 ? 'role' : 'roles'} matching your lists</h1>
          <p style="margin:0;color:#5b6675;font-size:14px">Posted since your last alert. Every link goes to the full ad on the board, where the apply button goes straight to the employer.</p>
        </td></tr>
        ${sections}
        <tr><td style="padding-top:26px">
          <a href="${SITE_URL}/jobs" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 18px;border-radius:6px">Browse all jobs</a>
        </td></tr>
        <tr><td style="padding-top:22px;border-top:1px solid #e6e8eb;color:#8b95a1;font-size:12px;line-height:1.6">
          You are receiving this because you switched on job alerts at ${SITE_NAME}.<br>
          <a href="${SITE_URL}/account" style="color:#1e3a5f">Manage your lists</a> ·
          <a href="${unsubscribeUrl}" style="color:#1e3a5f">Unsubscribe from all alerts</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = [
    `${total} new ${total === 1 ? 'role' : 'roles'} matching your lists`,
    '',
    ...deliveries.flatMap(({ list, jobs }) => [
      `== ${list.name} ==`,
      ...jobs.map((job) => {
        const pay = salary(job)
        return `- ${job.title} — ${[job.organisation, job.location].filter(Boolean).join(', ')}${pay ? ` (${pay})` : ''}\n  ${SITE_URL}/jobs/${job.slug}`
      }),
      '',
    ]),
    `Manage your lists: ${SITE_URL}/account`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n')

  return { subject, html, text }
}

function parseSender(value) {
  const raw = value.trim()
  const match = raw.match(/^(.*)<([^>]+)>$/)
  if (match) return { name: match[1].trim().replace(/^"|"$/g, '') || SITE_NAME, email: match[2].trim() }
  return { name: SITE_NAME, email: raw }
}

async function sendEmail({ to, subject, html, text, unsubscribeUrl }) {
  const sender = parseSender(process.env.EMAIL_FROM || '')

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    log(`Brevo rejected the email to ${to}: HTTP ${response.status} ${detail.slice(0, 200)}`)
    return false
  }

  return true
}

/* ---------------------------------------------------------------------- main */

async function main() {
  if (!REST_URL || !REST_TOKEN) {
    log('Skipped: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set.')
    return
  }

  if (!BREVO_API_KEY && !DRY_RUN) {
    log('Skipped: BREVO_API_KEY is not set (use --dry-run to preview without sending).')
    return
  }

  if (!process.env.EMAIL_FROM && !DRY_RUN) {
    log('Skipped: EMAIL_FROM is not set. It must be a sender verified in Brevo.')
    return
  }

  const snapshot = JSON.parse(await readFile(join(HERE, '..', 'data', 'jobs.json'), 'utf8'))
  const today = sydneyToday()
  const jobs = (snapshot.jobs || []).filter((job) => job.closingDate >= today)
  log(`${jobs.length} open listings in the ${snapshot.generatedAt || 'current'} snapshot`)

  const subscribers = (await redis(['SMEMBERS', 'digest:users'])) || []
  log(`${subscribers.length} account(s) with email alerts switched on`)

  let sent = 0
  let quiet = 0
  let failed = 0
  let notDue = 0

  for (const userId of subscribers) {
    const email = await getJson(`uid:${userId}`)
    if (!email) {
      // Account deleted but still queued: clean the set up as we go.
      await redis(['SREM', 'digest:users', userId])
      continue
    }

    const user = await getJson(`user:${email}`)
    if (!user || !user.digestEnabled) {
      await redis(['SREM', 'digest:users', userId])
      continue
    }

    const frequency = CLOSED_FREQUENCIES.has(user.digestFrequency) ? user.digestFrequency : 'weekly'
    const windowMs = WINDOW_DAYS[frequency] * DAY_MS
    const last = user.lastDigestAt ? Date.parse(user.lastDigestAt) : NaN

    if (Number.isFinite(last) && Date.now() - last < windowMs) {
      notDue++
      continue
    }

    // First email looks back one full period, so a new subscriber gets a useful
    // digest instead of an empty one.
    const since = Number.isFinite(last) ? last : Date.now() - windowMs

    const lists = (await getJson(`lists:${userId}`)) || []
    if (lists.length === 0) continue

    const deliveries = lists
      .map((list) => ({
        list,
        jobs: jobs
          .filter((job) => Date.parse(job.postedAt) >= since && matchesList(list.criteria || {}, job))
          .slice(0, 8),
      }))
      .filter((entry) => entry.jobs.length > 0)

    if (deliveries.length === 0) {
      quiet++
      continue
    }

    if (sent >= MAX_SENDS) {
      log(`Reached the ${MAX_SENDS}-email cap for this run; the rest go tomorrow.`)
      break
    }

    const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(user.unsubscribeToken || '')}`
    const { subject, html, text } = buildEmail(deliveries, unsubscribeUrl)

    if (DRY_RUN) {
      log(`[dry-run] ${email} (${frequency}) -> ${subject}`)
      sent++
      continue
    }

    if (await sendEmail({ to: email, subject, html, text, unsubscribeUrl })) {
      sent++
      await setJson(`user:${email}`, { ...user, lastDigestAt: new Date().toISOString() })
      log(`sent to ${email}: ${subject}`)
      // Brevo's free plan is rate limited; a small gap keeps bursts clean.
      await new Promise((resolve) => setTimeout(resolve, 400))
    } else {
      failed++
    }
  }

  log(`Done. sent=${sent} nothing-new=${quiet} not-due=${notDue} failed=${failed}`)
  if (failed > 0) process.exitCode = 1
}

// Importable for tests: only run when executed directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
