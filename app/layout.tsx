import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { JustInToast } from '@/components/live/just-in-toast'
import { LiveProvider } from '@/components/live/live-provider'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/format'
import { getJobs } from '@/lib/jobs'
import type { LiveJob } from '@/lib/live-store'
import './globals.css'

/*
 * Theme script: reads the saved day/night choice (or the operating system's
 * preference on a first visit) and sets the `.dark` class on <html> before
 * first paint, so the page never flashes the wrong theme. It must run before
 * React hydrates, which is why it is an inline script rather than a module.
 * The header toggle keeps the same localStorage key in sync afterwards.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('structurajobaus:theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const description =
  'Explore industry civil and structural engineering jobs across Australia.'

const ogImage = {
  url: '/images/hero-bridge.png',
  width: 1376,
  height: 768,
  alt: 'Steel arch bridge under construction',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_SHORT_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  appleWebApp: { title: SITE_SHORT_NAME },
  keywords: [
    'structural engineering jobs Australia',
    'structural engineer jobs',
    'geotechnical engineer jobs',
    'bridge engineer jobs',
    'civil engineer jobs Sydney',
    'engineering jobs Melbourne',
    'visa sponsorship engineering jobs Australia',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    images: [ogImage],
  },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description, images: [ogImage.url] },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Minimal role fields for the "new since your last visit" count and the
  // "just in" toast — loaded once here so no extra request is needed.
  const jobs = await getJobs()
  const liveJobs: LiveJob[] = jobs.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    organisation: job.organisation,
    postedAt: job.postedAt,
    kind: 'industry' as const,
  }))

  return (
    // suppressHydrationWarning: the theme script may add `.dark` to <html>
    // before React hydrates, which would otherwise look like a mismatch.
    <html lang="en-AU" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <LiveProvider jobs={liveJobs} />
        <JustInToast />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
