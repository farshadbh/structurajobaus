'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/academic', label: 'Academic Jobs' },
  { href: '/industry', label: 'Industry Jobs' },
  { href: '/cities', label: 'Browse by City' },
  { href: '/jobs?visa=1', label: 'Visa Sponsorship' },
  { href: '/account', label: 'Job alerts' },
  { href: '/post-a-job', label: 'Post a job' },
]

/**
 * Sign-up and sign-in sit outside the main nav so they own the top-right corner,
 * where people look for an account button. Both routes redirect to /account when
 * a session already exists, so the same button is correct for returning users.
 */
const MOBILE_LINKS = [
  { href: '/jobs', label: 'Search all jobs' },
  { href: '/signup', label: 'Create account' },
  { href: '/login', label: 'Sign in' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* The nav needs real room once the account buttons are present, so it
            appears at lg and the hamburger covers everything below that. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href.split('?')[0]) && item.href !== '/jobs?visa=1'
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="hidden h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted lg:inline-flex"
          >
            Search all jobs
          </Link>
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="hidden h-9 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 sm:inline-flex"
          >
            Create account
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t bg-background lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {[...NAV_ITEMS, ...MOBILE_LINKS].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
