import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/format'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    '/professors',
    '/supervisors',
    '/academic/people',
    '/universities',
    '/scholarships',
    '/pricing',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
}
