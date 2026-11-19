import { MapPin, Search } from 'lucide-react'
import { CITIES } from '@/lib/taxonomy'

const fieldClass =
  'h-12 w-full appearance-none rounded-md border-0 bg-transparent pr-3 pl-10 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function SearchBar() {
  return (
    <form
      action="/jobs"
      method="get"
      role="search"
      aria-label="Search structural engineering jobs"
      className="grid gap-2 rounded-xl bg-card p-2 shadow-2xl shadow-black/20 md:grid-cols-[1.6fr_1fr_auto] md:gap-0 md:divide-x"
    >
      <div className="relative">
        <label htmlFor="search-q" className="sr-only">
          Keywords
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="search-q"
          name="q"
          type="search"
          placeholder="Job title, keyword or employer"
          className={`${fieldClass} placeholder:text-muted-foreground`}
        />
      </div>

      <div className="relative">
        <label htmlFor="search-city" className="sr-only">
          City
        </label>
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <select id="search-city" name="city" defaultValue="" className={fieldClass}>
          <option value="">All cities</option>
          {CITIES.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}, {city.state}
            </option>
          ))}
        </select>
      </div>

      <div className="md:pl-2">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Search className="size-4" aria-hidden="true" />
          Search jobs
        </button>
      </div>
    </form>
  )
}
