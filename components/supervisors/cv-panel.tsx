'use client'

import { FileCheck2, FileText, Loader2, Paperclip, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { CV_ACCEPT, parseCv, readCv, type CandidateProfile } from '@/lib/cv'

/**
 * The CV is read here, in the browser. It is never uploaded, and only the parsed
 * facts (name, degree, contact lines) are kept - in localStorage, so they are
 * still there when the student comes back to write the next email.
 */
export function CvPanel({
  profile,
  onChange,
  onClear,
  attachCv,
  onAttachChange,
}: {
  profile: CandidateProfile | null
  onChange: (profile: CandidateProfile) => void
  onClear: () => void
  attachCv: boolean
  onAttachChange: (attach: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [paste, setPaste] = useState('')

  async function handleFile(file?: File | null) {
    if (!file) return
    setReading(true)
    setError('')
    try {
      const { profile: parsed } = await readCv(file)
      onChange(parsed)
      setPasteOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That file could not be read.')
      setPasteOpen(true)
    } finally {
      setReading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function usePastedText() {
    const parsed = parseCv(paste, 'pasted text')
    if (!parsed.name && !parsed.email && !parsed.degree) {
      setError('Nothing usable was found in that text. Check that your name, email and degree are there.')
      return
    }
    onChange(parsed)
    setError('')
    setPasteOpen(false)
    setPaste('')
  }

  const facts = profile
    ? [
        profile.name,
        profile.degree,
        profile.university,
        profile.graduationYear && `graduating ${profile.graduationYear}`,
        profile.email,
        profile.phone,
      ].filter(Boolean)
    : []

  return (
    <section
      aria-labelledby="cv-heading"
      className="mt-6 rounded-xl border bg-card p-4 sm:p-5"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        handleFile(event.dataTransfer.files?.[0])
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="cv-heading" className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-accent" aria-hidden="true" />
            Your CV
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Add it once and every email writes itself from it — your name, degree, university, year
            and contact details. It is read in your browser and never uploaded.
          </p>
        </div>

        {profile && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      {profile ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <FileCheck2 className="size-3.5" aria-hidden="true" />
            Loaded: {profile.fileName} · {profile.characters.toLocaleString()} characters read
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <li
                key={String(fact)}
                className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs text-emerald-900"
              >
                {fact}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-emerald-800">
            Every email below now opens with these details already in it.
          </p>
        </div>
      ) : (
        <div
          className={`mt-4 rounded-lg border border-dashed p-4 text-center transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={CV_ACCEPT}
            className="sr-only"
            id="cv-file"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="cv-file"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {reading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {reading ? 'Reading your CV…' : 'Upload your CV'}
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF, DOCX, TXT or MD — or drop the file here. A PDF of a scanned page has no text to
            read, so paste the text instead.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {error}
        </p>
      )}

      {pasteOpen ? (
        <div className="mt-3">
          <label htmlFor="cv-paste" className="text-xs font-medium">
            Paste your CV text
          </label>
          <textarea
            id="cv-paste"
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            rows={5}
            placeholder="Name, contact details, degree, university and one or two lines of experience."
            className="mt-1.5 w-full rounded-md border bg-background p-2.5 text-sm"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={usePastedText}
              className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Use this text
            </button>
            <button
              type="button"
              onClick={() => setPasteOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        !profile && (
          <button
            type="button"
            onClick={() => setPasteOpen(true)}
            className="mt-3 text-xs text-muted-foreground underline hover:text-foreground"
          >
            Scanned CV? Paste the text instead
          </button>
        )
      )}

      <label
        htmlFor="attach-cv"
        className="mt-4 flex cursor-pointer items-start gap-2 rounded-md border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground"
      >
        <input
          id="attach-cv"
          type="checkbox"
          checked={attachCv}
          onChange={(event) => onAttachChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
        />
        <span>
          <Paperclip className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
          <span className="font-medium text-foreground">Say my CV is attached.</span> The email will
          mention your attached CV and transcript; you still attach the file yourself in your mail
          app.
        </span>
      </label>
    </section>
  )
}
