import { ExternalLink, Mail } from 'lucide-react'
import type { Academic, AcademicField, UniversityGroup } from '@/lib/academics'

const FIELDS_LABEL: Record<AcademicField, string> = {
  structural: 'structural engineering',
  geotechnical: 'geotechnical engineering',
  transport: 'transport engineering',
  water: 'water engineering',
  construction: 'construction and materials',
}

function AcademicCard({ person }: { person: Academic }) {
  return (
    <article className="flex h-full flex-col rounded-lg border bg-card p-5">
      <h4 className="text-base font-semibold">{person.name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.researchFocus}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
        {person.email ? (
          <a
            href={`mailto:${person.email}`}
            className="inline-flex items-center gap-1.5 font-medium break-all text-primary hover:underline"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            {person.email}
          </a>
        ) : (
          // Saying "not published" is better than inventing an address: a guessed
          // email sends a student's enquiry to a stranger with a similar name.
          <span className="text-xs text-muted-foreground">Email not published</span>
        )}

        <a
          href={person.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Profile
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

export function AcademicDirectory({
  groups,
  field,
}: {
  groups: UniversityGroup[]
  field?: AcademicField
}) {
  if (groups.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold">No academics in this field yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This directory is built by hand from university pages. Try another field, or send us a name
          to add.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {groups.map((group) => (
        <section
          key={group.university}
          id={group.university.toLowerCase().replace(/[^a-z]+/g, '-')}
          className="scroll-mt-24 border-t pt-10 pb-4 first:border-t-0 first:pt-0"
          aria-labelledby={`uni-${group.university.replace(/[^a-z]+/gi, '-')}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id={`uni-${group.university.replace(/[^a-z]+/gi, '-')}`}
              className="text-xl font-semibold tracking-tight"
            >
              {group.university}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              {group.state} · {group.people.length} {group.people.length === 1 ? 'academic' : 'academics'}
            </p>
          </div>

          {group.byField.map((section) => (
            <div key={section.field} className="mt-7">
              <h3 className="flex items-center gap-3 font-mono text-[11px] font-medium tracking-wider uppercase">
                <span className="text-accent">{section.name}</span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="text-muted-foreground">{section.people.length}</span>
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {section.people.map((person) => (
                  <li key={person.id}>
                    <AcademicCard person={person} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      {field && (
        <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          Showing {FIELDS_LABEL[field]} only.{' '}
          <a href="/academic/people" className="text-primary hover:underline">
            Show every field
          </a>
          .
        </p>
      )}
    </div>
  )
}
