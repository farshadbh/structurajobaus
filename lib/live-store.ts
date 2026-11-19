/*
 * Client-side "live" state for the Industry site: theme, header settings,
 * bookmarked jobs and the fresh-roles feed.
 *
 * Everything here lives in localStorage on this device only — nothing is
 * synced to the server, and the UI says so ("Saved on this device"). The
 * server-side saved lists and email alerts (Upstash + Brevo) are a separate
 * system in lib/accounts.ts and keep working as before.
 *
 * One external store (useSyncExternalStore) so the header, hero, job cards
 * and the "just in" toast all read the same values without prop-drilling.
 * The store starts with defaults on the server and hydrates from localStorage
 * once, in LiveProvider, so the first client render matches the server and
 * nothing flashes or mismatches during hydration.
 */

import { useSyncExternalStore } from 'react'

export type DateMode = 'posted' | 'updated'
export type CheckIntervalHours = 1 | 3 | 6 | 12
export type Theme = 'light' | 'dark'

export interface LiveSettings {
  dateMode: DateMode
  checkIntervalHours: CheckIntervalHours
  browserAlerts: boolean
  sound: boolean
}

/** Minimal role fields the header/hero/toast need — no summaries or bodies. */
export interface LiveJob {
  id: string
  slug: string
  title: string
  organisation: string
  postedAt: string
  kind: 'industry'
}

interface LiveState {
  settings: LiveSettings
  savedIds: string[]
  theme: Theme
  freshJobs: LiveJob[]
  /** Roles posted after the visitor's previous visit (date-only compare). */
  newJobs: LiveJob[]
  /** When the client last revalidated, for the "next pass" countdown. */
  lastCheckAt: number | null
  toastDismissed: boolean
  hydrated: boolean
}

const SETTINGS_KEY = 'structurajobaus:settings:v1'
const SAVED_KEY = 'structurajobaus:saved:v1'
const THEME_KEY = 'structurajobaus:theme:v1'
const LAST_VISIT_KEY = 'structurajobaus:last-visit:v1'

const DEFAULT_SETTINGS: LiveSettings = {
  dateMode: 'posted',
  checkIntervalHours: 1,
  browserAlerts: false,
  sound: false,
}

const INITIAL_STATE: LiveState = {
  settings: DEFAULT_SETTINGS,
  savedIds: [],
  theme: 'light',
  freshJobs: [],
  newJobs: [],
  lastCheckAt: null,
  toastDismissed: false,
  hydrated: false,
}

let state: LiveState = INITIAL_STATE
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<LiveState>) {
  state = { ...state, ...patch }
  emit()
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return INITIAL_STATE
}

export function useLiveStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode / full storage: settings simply do not persist.
  }
}

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

/**
 * Reads localStorage once (called from LiveProvider on mount) and computes
 * which roles arrived since the visitor's last visit. The first visit has no
 * "new" roles — everything is new to a first-time visitor, so nothing is
 * counted and no toast is shown.
 */
export function hydrateLiveStore(freshJobs: LiveJob[]) {
  if (typeof window === 'undefined' || state.hydrated) return

  const settings: LiveSettings = {
    ...DEFAULT_SETTINGS,
    ...(readJson<Partial<LiveSettings>>(SETTINGS_KEY) ?? {}),
  }
  if (settings.dateMode !== 'posted' && settings.dateMode !== 'updated') {
    settings.dateMode = 'posted'
  }
  if (![1, 3, 6, 12].includes(settings.checkIntervalHours)) {
    settings.checkIntervalHours = 1
  }

  const savedIds = (readJson<string[]>(SAVED_KEY) ?? []).filter(
    (id): id is string => typeof id === 'string',
  )

  const storedTheme = localStorage.getItem(THEME_KEY)
  const theme: Theme =
    storedTheme === 'dark' ||
    (storedTheme !== 'light' && document.documentElement.classList.contains('dark'))
      ? 'dark'
      : 'light'

  const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
  const newJobs = lastVisit
    ? freshJobs
        .filter((job) => job.postedAt > lastVisit.slice(0, 10))
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt) || a.title.localeCompare(b.title))
    : []
  try {
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
  } catch {
    // Ignore: the "new" count simply recomputes next visit.
  }

  applyThemeClass(theme)
  setState({
    settings,
    savedIds,
    theme,
    freshJobs,
    newJobs,
    lastCheckAt: Date.now(),
    toastDismissed: false,
    hydrated: true,
  })
}

export function updateSettings(patch: Partial<LiveSettings>) {
  const settings = { ...state.settings, ...patch }
  writeJson(SETTINGS_KEY, settings)
  setState({ settings })
}

export function toggleTheme() {
  const theme: Theme = state.theme === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Ignore: the choice simply does not persist.
  }
  applyThemeClass(theme)
  setState({ theme })
}

export function toggleSaved(id: string) {
  const savedIds = state.savedIds.includes(id)
    ? state.savedIds.filter((saved) => saved !== id)
    : [...state.savedIds, id]
  writeJson(SAVED_KEY, savedIds)
  setState({ savedIds })
}

export function markChecked() {
  setState({ lastCheckAt: Date.now() })
}

export function dismissToast() {
  setState({ toastDismissed: true })
}

/**
 * Short two-note beep for a new matching role. Best-effort: audio is blocked
 * in some browsers until the visitor has interacted with the page, so a
 * failure here is swallowed instead of breaking the toast.
 */
export function playAlertSound() {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    void ctx.resume()
    const start = ctx.currentTime
    ;[880, 1318].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      const at = start + index * 0.12
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.12)
    })
  } catch {
    // Sound is a nicety, never a blocker.
  }
}
