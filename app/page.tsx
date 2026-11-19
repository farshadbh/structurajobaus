import { CityGrid } from '@/components/home/city-grid'
import { Hero } from '@/components/home/hero'
import { JobSection } from '@/components/home/job-section'
import { RoleCategories } from '@/components/home/role-categories'
import { JsonLd } from '@/components/json-ld'
import { SITE_NAME, SITE_URL } from '@/lib/format'
import { getFeaturedJobs, getJobCounts, getLatestJobs, getVisaSponsoredJobs } from '@/lib/jobs'

export default async function HomePage() {
  const [featured, academic, visa, counts] = await Promise.all([
    getFeaturedJobs(6),
    getLatestJobs('academic', 4),
    getVisaSponsoredJobs(4),
    getJobCounts(),
  ])

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/jobs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Hero stats={counts} />
      <JobSection
        id="featured-jobs"
        eyebrow="Featured"
        title="Featured academic positions"
        description="The newest university roles from Australian universities."
        jobs={featured}
        href="/jobs"
        linkLabel="View all jobs"
        columns={3}
      />
      <RoleCategories counts={counts.byRole} />
      <JobSection
        id="latest-academic"
        eyebrow="Academic Position"
        title="Latest academic positions"
        description="Lecturer, professor, research fellow and postdoctoral opportunities."
        jobs={academic}
        href="/academic"
        linkLabel="All academic positions"
      />
      <JobSection
        id="visa-jobs"
        eyebrow="Visa sponsorship"
        title="Jobs offering visa sponsorship"
        description="Universities open to sponsoring skilled international academics."
        jobs={visa}
        href="/jobs?visa=1"
        linkLabel="All visa sponsored jobs"
      />
      <CityGrid counts={counts.byCity} />
    </>
  )
}
