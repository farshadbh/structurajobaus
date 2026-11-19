'use client'

import { useState } from 'react'
import { Bell, Check, RefreshCw, Settings, Volume2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDropdown } from './use-dropdown'
import {
  markChecked,
  updateSettings,
  useLiveStore,
  type CheckIntervalHours,
  type DateMode,
} from '@/lib/live-store'
import { cn } from '@/lib/utils'

const INTERVALS: CheckIntervalHours[] = [1, 3, 6, 12]

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 rounded-full border px-3 text-sm font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card hover:border-primary/40',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-muted',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

/**
 * Gear menu in the header, modelled on the reference Settings panel. Every
 * choice is stored in localStorage on this device:
 *
 * - "Show dates by" switches the date on every job card between Posted and
 *   Updated (Updated falls back to the posted date: the feed reports no
 *   separate update date yet — see Job.updatedAt).
 * - "Check boards every" sets how often the page revalidates.
 * - Browser alerts ask for Notification permission only when switched on;
 *   when the browser has them blocked, the toggle stays off and says so.
 * - Sound plays a short beep when a new matching role arrives.
 */
export function SettingsMenu() {
  const router = useRouter()
  const { open, setOpen, ref } = useDropdown()
  const { settings, savedIds } = useLiveStore()
  const [alertNote, setAlertNote] = useState('')
  const [justChecked, setJustChecked] = useState(false)

  async function onBrowserAlerts(next: boolean) {
    if (next && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        if (result !== 'granted') {
          setAlertNote('Notifications were not allowed — turn them on in your browser to use alerts.')
          return
        }
      } else if (Notification.permission === 'denied') {
        setAlertNote('Browser alerts are blocked for this site — allow notifications in your browser to use them.')
        return
      }
    }
    setAlertNote('')
    updateSettings({ browserAlerts: next })
  }

  function onCheckNow() {
    markChecked()
    router.refresh()
    setJustChecked(true)
    window.setTimeout(() => setJustChecked(false), 5000)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Settings"
        title="Settings"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-medium whitespace-nowrap transition-colors hover:border-primary/40"
      >
        <Settings className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">Settings</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute top-11 right-0 z-50 w-[21rem] max-w-[calc(100vw-2rem)] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Settings</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium">Show dates by</p>
            <div className="mt-2">
              <Segmented<DateMode>
                label="Show dates by"
                value={settings.dateMode}
                options={[
                  { value: 'posted', label: 'Posted' },
                  { value: 'updated', label: 'Updated' },
                ]}
                onChange={(dateMode) => updateSettings({ dateMode })}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Changes the date on each job card.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium">Check boards every</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Segmented<CheckIntervalHours>
                label="Check boards every"
                value={settings.checkIntervalHours}
                options={INTERVALS.map((hours) => ({ value: hours, label: `${hours}h` }))}
                onChange={(checkIntervalHours) => updateSettings({ checkIntervalHours })}
              />
              <button
                type="button"
                onClick={onCheckNow}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Check now
              </button>
            </div>
            {justChecked && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-success">
                <Check className="size-3.5" aria-hidden="true" />
                Checked just now.
              </p>
            )}
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium">When a new role matches your filters</p>
            <div className="mt-2">
              <ToggleRow
                icon={<Bell className="size-4 text-muted-foreground" aria-hidden="true" />}
                label="Browser alerts"
                checked={settings.browserAlerts}
                onChange={onBrowserAlerts}
              />
              <ToggleRow
                icon={<Volume2 className="size-4 text-muted-foreground" aria-hidden="true" />}
                label="Sound"
                checked={settings.sound}
                onChange={(sound) => updateSettings({ sound })}
              />
            </div>
            {alertNote && <p className="mt-1 text-xs text-destructive">{alertNote}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Saved on this device.</p>
          </div>

          <div className="mt-5 border-t pt-3">
            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-md px-1 py-1 text-sm font-medium hover:text-primary"
            >
              Saved roles
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs tabular-nums">
                {savedIds.length}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
