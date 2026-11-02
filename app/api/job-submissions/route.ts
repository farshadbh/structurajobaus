import { submissionToMarkdown, validateSubmission } from '@/lib/submissions'

const REPO = process.env.GITHUB_REPO ?? 'orodzarrin/structurajobaus'

/**
 * Employer submissions land as GitHub issues labelled `job-submission`, which
 * gives a durable, reviewable queue without adding a database. Publishing is a
 * deliberate manual step: an approved issue is copied into data/jobs.json.
 */
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: 'Cross-origin submissions are not allowed.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const input = body as Record<string, unknown>

  // Honeypot: real users never fill this hidden field.
  if (typeof input.website === 'string' && input.website.trim() !== '') {
    return Response.json({ ok: true }, { status: 201 })
  }

  const result = validateSubmission(input)
  if (!result.ok) {
    return Response.json({ error: 'Please fix the highlighted fields.', errors: result.errors }, { status: 422 })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return Response.json(
      {
        error:
          'Submissions are not configured yet. Add a GITHUB_TOKEN with Issues write access to enable the review queue.',
      },
      { status: 503 },
    )
  }

  const submission = result.value

  const response = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'structural-job-board',
    },
    body: JSON.stringify({
      title: `[Job submission] ${submission.title} — ${submission.organisation}`,
      body: submissionToMarkdown(submission),
      labels: ['job-submission'],
    }),
  })

  if (!response.ok) {
    console.error('[job-submissions] GitHub rejected the submission', response.status)
    return Response.json({ error: 'Could not queue the submission. Please email it instead.' }, { status: 502 })
  }

  const issue = (await response.json()) as { number?: number }

  return Response.json({ ok: true, reference: issue.number ? `#${issue.number}` : undefined }, { status: 201 })
}
