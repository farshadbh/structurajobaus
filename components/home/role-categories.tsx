import { ChevronRight, GraduationCap, HardHat } from 'lucide-react'
import Link from 'next/link'
import { ACADEMIC_ROLES, INDUSTRY_ROLES, type Role } from '@/lib/taxonomy'

interface RoleCategoriesProps {
  counts: Record<string, number>
}

function RoleColumn({
  title,
  description,
  icon: Icon,
  roles,
  basePath,
  counts,
}: {
  title: string
  description: string
  icon: typeof GraduationCap
  roles: Role[]
  basePath: string
  counts: Record<string, number>
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-start gap-4 border-b p-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">
            <Link href={basePath} className="hover:text-primary">
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ul className="divide-y">
        {roles.map((role) => (
          <li key={role.slug}>
            <Link
              href={`${basePath}?role=${role.slug}`}
              className="flex items-center justify-between px-6 py-3.5 text-sm transition-colors hover:bg-muted"
            >
              <span className="font-medium">{role.name}</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-xs tabular-nums">{counts[role.slug] ?? 0} jobs</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RoleCategories({ counts }: RoleCategoriesProps) {
  return (
    <section aria-labelledby="browse-roles" className="border-y bg-muted/50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs font-medium tracking-wider text-accent uppercase">Browse by role</p>
        <h2 id="browse-roles" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Academic and industry career paths
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RoleColumn
            title="Academic Jobs"
            description="Teaching, research and scholarship positions at Australian universities."
            icon={GraduationCap}
            roles={ACADEMIC_ROLES}
            basePath="/academic"
            counts={counts}
          />
          <RoleColumn
            title="Industry Jobs"
            description="Design, consulting and delivery roles with engineering firms and contractors."
            icon={HardHat}
            roles={INDUSTRY_ROLES}
            basePath="/industry"
            counts={counts}
          />
        </div>
      </div>
    </section>
  )
}
