import { fieldName, type Academic } from './academics'

/*
 * A first email to a potential supervisor, pre-filled but still worth reading
 * before sending. Every square bracket is a decision only the student can make,
 * so the template stays short and the student fills in the substance.
 */

const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'phd', 'pe', 'p.e.'])

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

export function buildSupervisorEmail(person: Academic): { subject: string; body: string } {
  const subject = `PhD enquiry: ${fieldName(person.field)} supervision`

  const body = [
    `Dear ${salutation(person)},`,
    '',
    `I am writing to ask whether you are taking on new PhD students in the next intake. I am applying for a PhD in ${fieldName(person.field).toLowerCase()} engineering, and your work on ${focusClause(person)} is the closest match to what I want to study.`,
    '',
    'About me',
    '- Degree and university: [e.g. BEng Civil (Hons), University of X, 2025]',
    '- Results: [WAM/GPA or class rank]',
    '- Experience: [final-year thesis topic, internship, software or lab work in one line]',
    '',
    'What I would like to work on',
    '[Two or three sentences on the problem you want to solve, why it fits this group, and what you could contribute in the first year.]',
    '',
    'Funding: [scholarship you hold, one you are applying for, or ask which funding rounds they recommend]',
    '',
    'I have attached my CV and academic transcript, and can send a one-page research proposal if that is useful. I would be glad to talk at a time that suits you.',
    '',
    'Thank you for your time.',
    '',
    'Kind regards,',
    '[Your full name]',
    '[Email] · [Phone]',
    '[LinkedIn or Google Scholar, if you have one]',
  ].join('\n')

  return { subject, body }
}

/** A mailto: link with the template already written into it, or null without a published address. */
export function mailtoHref(person: Academic): string | null {
  if (!person.email) return null
  const { subject, body } = buildSupervisorEmail(person)
  return `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
