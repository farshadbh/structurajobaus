import { getJobs } from '@/lib/jobs'
import { SITE_NAME, SITE_URL } from '@/lib/format'

export const dynamic = 'force-static'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RSS 2.0 feed of live listings, used for job alerts and feed readers. */
export async function GET() {
  const jobs = (await getJobs()).slice(0, 50)

  const items = jobs
    .map(
      (job) => `    <item>
      <title>${escapeXml([job.title, job.organisation].filter(Boolean).join(' — '))}</title>
      <link>${SITE_URL}/jobs/${job.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/jobs/${job.slug}</guid>
      <pubDate>${new Date(`${job.postedAt}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(job.sector)}</category>
      <description>${escapeXml(`${job.summary} (${job.location})`)}</description>
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/jobs</link>
    <description>Structural engineering jobs across Australian universities and engineering firms, refreshed every morning.</description>
    <language>en-au</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
