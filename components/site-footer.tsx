import Link from 'next/link'
import { Logo } from '@/components/logo'

const COLUMNS = [
  {
    title: 'Find',
    links: [
      { href: '/professors', label: 'Professor finder' },
      { href: '/supervisors', label: 'Supervisor directory' },
      { href: '/academic/people', label: 'Academics by university' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { href: '/universities', label: 'Universities worldwide' },
      { href: '/scholarships', label: 'PhD scholarships' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/pricing', label: 'Membership' },
      { href: '/account', label: 'My account' },
      { href: '/signup', label: 'Create account' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Find an active professor for your PhD, check whether they are taking students, and write to
            them with an email that fills itself from your CV.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-mono text-xs font-medium tracking-wider text-accent uppercase">{column.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-primary-foreground/75 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} PhD Compass. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/privacy" className="hover:text-primary-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary-foreground">
              Terms
            </Link>
            <span>
              Research data from{' '}
              <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground">
                OpenAlex
              </a>
              .
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
