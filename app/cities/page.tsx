import type { Metadata } from 'next'
import { CityGrid } from '@/components/home/city-grid'
import { PageHeader } from '@/components/page-header'
import { getJobCounts } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Structural Engineering Jobs by City',
  description:
    'Browse structural engineering academic and industry jobs in Sydney, Newcastle, Melbourne, Brisbane, Perth and Adelaide.',
  alternates: { canonical: '/cities' },
}

export default async function CitiesPage() {
  const counts = await getJobCounts()
  return (
    <>
      <PageHeader
        eyebrow="Browse by city"
        title="Structural engineering jobs by city"
        description="Explore academic and industry opportunities in Australia's major engineering hubs."
        breadcrumbs={[{ label: 'Cities', href: '/cities' }]}
      />
      <CityGrid counts={counts.byCity} />
    </>
  )
}
