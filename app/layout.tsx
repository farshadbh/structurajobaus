import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/format'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const description =
  'Browse university positions in structural engineering — postdoctoral fellow, research fellow, lecturer, senior lecturer, associate professor and professor — at Australian universities.'

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
    'academic position structural engineering',
    'lecturer structural engineering',
    'professor civil engineering',
    'postdoctoral fellow structural engineering',
    'research fellow civil engineering',
    'academic engineering jobs Australia',
    'university lecturer jobs Australia',
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
  colorScheme: 'light',
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
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
