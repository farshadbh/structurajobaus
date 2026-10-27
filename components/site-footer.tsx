import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ACADEMIC_ROLES, CITIES, INDUSTRY_ROLES } from '@/lib/taxonomy'

export function SiteFooter() {
  const columns = [
    {
      title: 'Academic Jobs',
      links: ACADEMIC_ROLES.map((role) => ({ href: `/academic?role=${role.slug}`, label: role.name })),
    },
    {
      title: 'Industry Jobs',
      links: INDUSTRY_ROLES.map((role) => ({ href: `/industry?role=${role.slug}`, label: role.name })),
    },
    {
      title: 'Jobs by City',
      links: CITIES.map((city) => ({ href: `/cities/${city.slug}`, label: `${city.name} jobs` })),
    },
  ]

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            The specialist job board connecting structural engineers with universities, research institutes and
            engineering firms across Australia.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-mono text-xs font-medium tracking-wider text-accent uppercase">{column.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Structural Engineering Academic & Industry Jobs Australia.</p>
          <p>Listings shown are sample data for demonstration.</p>
        </div>
      </div>
    </footer>
  )
}
