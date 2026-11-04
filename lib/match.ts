/*
 * CV-to-professor matching that runs anywhere - in the browser for the
 * private, free-of-charge reading, and on the server as the fallback when
 * Claude is not configured.
 *
 * 1. extractKeywords() pulls the research phrases out of a CV: one- to
 *    three-word terms, weighted up when they sit in a thesis, project,
 *    research or publication section and down when they are CV boilerplate.
 * 2. scoreMatch() compares those terms with a professor's research topics and
 *    recent paper titles (topics count double: they summarise years of work)
 *    and turns the overlap into a 0-100 percentage, with the shared terms
 *    listed so the number can be checked.
 */

import type { ProfessorSummary } from './openalex'

const STOP = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours
  using based via new novel study studies analysis approach approaches method methods results result paper papers work works research researcher project projects thesis dissertation application applications system systems model models modelling modeling data use used towards toward effect effects case role impact performance development design evaluation investigation framework assessment review high low large small within across among one two three first second
  university college school faculty department institute bachelor master masters phd doctor honours hons degree diploma gpa wam cgpa grade grades course courses unit units subject subjects semester year years month months present current
  experience experienced skills skill software tools tool proficient proficiency knowledge familiar ability strong excellent good team teamwork communication leadership responsible responsibilities duties including include includes various several
  email phone mobile address linkedin github website curriculum vitae resume cv references available request name date dates
  final graduate graduated undergraduate postgraduate student students intern internship cadet trainee junior senior
  designed developed conducted performed managed led worked assisted prepared supported delivered undertook carried completed involved participated contributed created built implemented produced achieved awarded received
  january february march april may june july august september october november december jan feb mar apr jun jul aug sep sept oct nov dec`.split(/\s+/),
)

const SECTION_BOOST =
  /^(research|research experience|research interests?|thesis|final.year project|honours project|capstone|projects?|publications?|conference papers?|journal papers?|selected publications|research projects?)\b/i
const SECTION_DAMP =
  /^(education|experience|work experience|employment|professional experience|skills|technical skills|software|languages|referees|references|awards?|certifications?|interests|hobbies|volunteer)/i

/** A light stemmer: enough to make "beams"/"beam" and "corroded"/"corrosion" meet. */
export function stem(word: string) {
  let w = word.toLowerCase()
  if (w.length > 5) w = w.replace(/(ations?|ition|isations?|izations?)$/, 'ate')
  if (w.length > 4) w = w.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '')
  if (w.length > 5) w = w.replace(/(al|ive|ic|ous)$/, '')
  return w
}

function tokens(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .filter((word) => word.length > 2 && !STOP.has(word) && !/^\d+$/.test(word))
}

export interface Keyword {
  term: string
  weight: number
}

/** The research phrases of a CV, strongest first. */
export function extractKeywords(text: string, limit = 18): Keyword[] {
  const scores = new Map<string, number>()
  const display = new Map<string, string>()
  let multiplier = 1

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  // The first line of a CV is the student's own name.
  const ownName = new Set(lines[0] && lines[0].split(/\s+/).length <= 5 ? tokens(lines[0]) : [])

  for (const [index, line] of lines.entries()) {
    if (index === 0 && ownName.size) continue
    // A short line is a heading and sets the weight of the section under it;
    // "Final year project: ..." boosts just its own line.
    let lineMultiplier = multiplier
    if (SECTION_BOOST.test(line)) {
      if (line.length < 60 && !line.includes(':')) multiplier = 2.2
      lineMultiplier = 2.2
    } else if (line.length < 40 && SECTION_DAMP.test(line)) {
      multiplier = 0.6
      lineMultiplier = 0.6
    }
    // Contact lines and dates say nothing about research.
    if (/@|https?:|\+?\d[\d\s()-]{7,}/.test(line)) continue

    const words = tokens(line).filter((word) => !ownName.has(word))
    for (let size = 1; size <= 3; size++) {
      for (let i = 0; i + size <= words.length; i++) {
        const gram = words.slice(i, i + size)
        const key = gram.map(stem).join(' ')
        // Phrases are rarer and more telling than single words.
        const add = lineMultiplier * (size === 1 ? 1 : size === 2 ? 2.4 : 2)
        scores.set(key, (scores.get(key) ?? 0) + add)
        if (!display.has(key)) display.set(key, gram.join(' '))
      }
    }
  }

  // Thresholds are relative to the CV's strongest term, so a one-page CV and a
  // ten-page one both yield keywords; longer phrases win ties.
  const top = Math.max(0, ...scores.values())
  const ranked = [...scores.entries()]
    .filter(([key, score]) => score >= top * (key.includes(' ') ? 0.25 : 0.4))
    .sort((a, b) => b[1] - a[1] || b[0].split(' ').length - a[0].split(' ').length)

  const chosen: Keyword[] = []
  for (const [key, score] of ranked) {
    // Skip a term that mostly repeats a stronger one ("seismic retrofit" vs
    // "seismic retrofit masonry"): more than half its words already chosen.
    const words = key.split(' ')
    const overlaps = chosen.some((kw) => {
      const other = new Set(stemKey(kw.term).split(' '))
      return words.filter((word) => other.has(word)).length > words.length / 2
    })
    if (overlaps) continue
    chosen.push({ term: display.get(key) ?? key, weight: Math.round(score * 10) / 10 })
    if (chosen.length >= limit) break
  }
  return chosen
}

const stemKey = (term: string) => tokens(term).map(stem).join(' ')

/** A search query for OpenAlex built from the strongest phrases. */
export function keywordsToQuery(keywords: Keyword[], take = 4) {
  return keywords
    .slice(0, take)
    // Two-word terms as exact phrases; longer ones as a group of words, which
    // is less brittle than an exact three-word phrase.
    .map((kw) => {
      const words = kw.term.split(' ').length
      return words === 2 ? `"${kw.term}"` : words > 2 ? `(${kw.term})` : kw.term
    })
    .join(' OR ')
}

export interface MatchScore {
  percent: number
  shared: string[]
  /** Claude's one-line explanation, when Claude did the scoring. */
  reason?: string
}

function bag(texts: string[], weight: number, into: Map<string, number>) {
  for (const text of texts) {
    const words = tokens(text).map(stem)
    for (const word of words) into.set(word, (into.get(word) ?? 0) + weight)
    for (let i = 0; i + 1 < words.length; i++) {
      const pair = `${words[i]} ${words[i + 1]}`
      into.set(pair, (into.get(pair) ?? 0) + weight * 1.5)
    }
  }
  return into
}

/**
 * How well a professor fits the CV's keywords, as a percentage. The score is
 * the share of the CV's research weight that the professor's work covers,
 * softened so that covering the top half of a CV already reads as a strong
 * match (nobody's CV lines up with a supervisor's word for word).
 */
export function scoreMatch(keywords: Keyword[], person: Pick<ProfessorSummary, 'topics' | 'fields' | 'recentWorks'>): MatchScore {
  if (keywords.length === 0) return { percent: 0, shared: [] }

  const profile = new Map<string, number>()
  bag(person.topics, 2, profile)
  bag(person.fields, 0.8, profile)
  bag(
    person.recentWorks.map((work) => work.title),
    1,
    profile,
  )

  let total = 0
  let covered = 0
  const shared: string[] = []
  for (const kw of keywords) {
    const parts = tokens(kw.term).map(stem)
    if (parts.length === 0) continue
    total += kw.weight
    const phrase = parts.join(' ')
    const hits = parts.filter((part) => profile.has(part)).length / parts.length
    const exact = parts.length > 1 && profile.has(phrase)
    const coverage = exact ? 1 : hits * (parts.length > 1 ? 0.75 : 1)
    if (coverage > 0) {
      covered += kw.weight * coverage
      if (coverage >= 0.5) shared.push(kw.term)
    }
  }

  const ratio = total ? covered / total : 0
  const percent = Math.round(100 * (1 - Math.exp(-3 * ratio)) / (1 - Math.exp(-3)))
  return { percent: Math.max(0, Math.min(99, percent)), shared: shared.slice(0, 6) }
}
