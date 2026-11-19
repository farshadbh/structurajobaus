'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { toggleTheme, useLiveStore } from '@/lib/live-store'
import { cn } from '@/lib/utils'

/**
 * Day/night pill in the header, like the reference: a sliding knob with the
 * sun in light mode and the moon in dark mode. The choice is stored in
 * localStorage and the `.dark` class is applied before first paint by the
 * theme script in app/layout.tsx, so the page never flashes the wrong theme.
 */
export function ThemeToggle() {
  const { theme } = useLiveStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dark = mounted && theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      title={dark ? 'Dark mode — switch to light' : 'Light mode — switch to dark'}
      className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border bg-card px-1 transition-colors hover:border-primary/40"
    >
      <Sun className="absolute left-2 size-4 text-amber-500" aria-hidden="true" />
      <Moon className="absolute right-2 size-4 text-primary" aria-hidden="true" />
      <span
        aria-hidden="true"
        className={cn(
          'relative z-10 flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm transition-transform',
          dark ? 'translate-x-7' : 'translate-x-0',
        )}
      >
        {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
    </button>
  )
}
