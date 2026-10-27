import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page has been decommissioned</h1>
      <p className="mt-3 text-muted-foreground">
        The job or page you&apos;re looking for may have closed or moved.
      </p>
      <Link
        href="/jobs"
        className="mt-8 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Browse all jobs
      </Link>
    </div>
  )
}
