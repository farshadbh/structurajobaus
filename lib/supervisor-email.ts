import type { CandidateProfile } from './cv'
import { fieldName, type Academic } from './academics'

/*
 * A first email to a potential supervisor, pre-filled but still worth reading
 * before sending. With a CV loaded the facts about the student fill themselves
 * in; the research idea stays as a prompt, because only the student knows it.
 *
 * The follow-up is a separate, shorter message: one nudge two weeks later, not
 * a second application.
 */

const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'phd', 'pe', 'p.e.'])

export interface EmailOptions {
  /** Whether the message should say the CV is attached. */
  attachCv?: boolean
  /** When the first email went out, for the follow-up. */
  sentAt?: string
}

export function surnameOf(person: Academic): string {
  if (person.surname) return person.surname

  const cleaned = person.name
    .replace(/\(.*?\)/g, '')
    .replace(/,.*$/, '')
    .trim()

  const words = cleaned.split(/\s+/).filter(Boolean)
  while (words.length > 1 && SUFFIXES.has(words[words.length - 1].toLowerCase())) words.pop()

  return words[words.length - 1] ?? person.name
}

/** "Professor Mueller", "Dr Okafor" - professors get the full title, everyone else the doctorate. */
export function salutation(person: Academic): string {
  return /professor/i.test(person.title) ? `Professor ${surnameOf(person)}` : `Dr ${surnameOf(person)}`
}

function focusClause(person: Academic) {
  const clause = person.researchFocus.split(/[.;]/)[0].trim()
  const lower = clause.charAt(0).toLowerCase() + clause.slice(1)
  return lower.replace(/\.$/, '')
}

/** The degree line: "BEng Civil (Hons), University of Sydney" when both halves are known. */
function degreeLine(profile?: CandidateProfile) {
  const parts = [profile?.degree, profile?.university].filter(Boolean)
  return parts.length ? parts.join(', ') : '[e.g. BEng Civil (Hons), University of X, 2025]'
}

function attachmentSentence(attachCv: boolean) {
  return attachCv
    ? 'I have attached my CV and academic transcript'
    : 'I can send my CV and academic transcript if useful'
}

function sentDate(iso?: string) {
  if (!iso) return 'earlier this month'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'earlier this month'
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })
}

export function buildSupervisorEmail(
  person: Academic,
  profile?: CandidateProfile,
  options: EmailOptions = {},
): { subject: string; body: string } {
  const attachCv = options.attachCv ?? true
  const who = profile?.name
  const subject = `PhD enquiry: ${fieldName(person.field)} supervision${who ? ` — ${who}` : ''}`

  const about = [
    `- Degree and university: ${degreeLine(profile)}`,
    profile?.graduationYear
      ? `- Graduated: ${profile.graduationYear}`
      : '- Results: [WAM/GPA or class rank]',
    ...(profile?.highlights.length
      ? profile.highlights.map((fact) => `- ${fact}`)
      : ['- Experience: [final-year thesis topic, internship, software or lab work in one line]']),
  ]

  const signature = [
    profile?.name ?? '[Your full name]',
    [profile?.email, profile?.phone].filter(Boolean).join(' · ') || '[Email] · [Phone]',
    '[LinkedIn or Google Scholar, if you have one]',
  ]

  const body = [
    `Dear ${salutation(person)},`,
    '',
    `I am writing to ask whether you are taking on new PhD students in the next intake. I am applying for a PhD in ${fieldName(person.field).toLowerCase()} engineering, and your work on ${focusClause(person)} is the closest match to what I want to study.`,
    '',
    'About me',
    ...about,
    '',
    'What I would like to work on',
    '[Two or three sentences on the problem you want to solve, why it fits this group, and what you could contribute in the first year.]',
    '',
    'Funding: [scholarship you hold, one you are applying for, or ask which funding rounds they recommend]',
    '',
    `${attachmentSentence(attachCv)}, and can send a one-page research proposal if that is useful. I would be glad to talk at a time that suits you.`,
    '',
    'Thank you for your time.',
    '',
    'Kind regards,',
    ...signature,
  ].join('\n')

  return { subject, body }
}

/**
 * The second email: short, dated, and it gives the professor an easy way out.
 * Two weeks of silence is normal, so this never accuses anyone of ignoring it.
 */
export function buildFollowUpEmail(
  person: Academic,
  profile?: CandidateProfile,
  options: EmailOptions = {},
): { subject: string; body: string } {
  const attachCv = options.attachCv ?? true
  const subject = `Following up: PhD enquiry — ${fieldName(person.field)} supervision`
  const qualification = profile?.degree ? ` (${profile.degree})` : ''

  const body = [
    `Dear ${salutation(person)},`,
    '',
    `I wrote to you on ${sentDate(options.sentAt)} about a PhD in ${fieldName(person.field).toLowerCase()} engineering under your supervision, on ${focusClause(person)}. I am following up in case it arrived at a busy time — I know the start of semester is not the easiest moment for email.`,
    '',
    profile?.name
      ? `Since then nothing has changed except my interest: I finished ${profile.degree ?? 'my degree'}${qualification ? '' : ''}${profile.university ? ` at ${profile.university}` : ''}${profile.graduationYear ? ` in ${profile.graduationYear}` : ''} and I am ready to start in the next intake.`
      : 'Nothing has changed since then except my interest: I am ready to start in the next intake.',
    '',
    'If you are not taking students this round, I would be grateful for a pointer to a colleague whose work is closer to mine — that would be just as useful to me.',
    '',
    `${attachmentSentence(attachCv)} in case they are helpful, and I would be glad to talk at any time that suits you.`,
    '',
    'Thank you again for your time.',
    '',
    'Kind regards,',
    profile?.name ?? '[Your full name]',
    [profile?.email, profile?.phone].filter(Boolean).join(' · ') || '[Email] · [Phone]',
  ].join('\n')

  return { subject, body }
}

function mailto(address: string, subject: string, body: string) {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** A mailto: link with the template already written into it, or null without a published address. */
export function mailtoHref(
  person: Academic,
  profile?: CandidateProfile,
  options: EmailOptions = {},
): string | null {
  if (!person.email) return null
  const { subject, body } = buildSupervisorEmail(person, profile, options)
  return mailto(person.email, subject, body)
}

/** The follow-up as a mailto: link, dated from when the first email went out. */
export function followUpMailtoHref(
  person: Academic,
  profile: CandidateProfile | null | undefined,
  options: EmailOptions = {},
): string | null {
  if (!person.email) return null
  const { subject, body } = buildFollowUpEmail(person, profile ?? undefined, options)
  return mailto(person.email, subject, body)
}
