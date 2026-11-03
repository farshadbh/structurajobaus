/*
 * Reads a CV in the browser: nothing is uploaded, nothing is stored on the
 * server, and no library is needed.
 *
 * PDF and DOCX are containers, not text, so both are unpacked here with the
 * browser's own DecompressionStream: a DOCX is a zip with word/document.xml in
 * it, and a PDF stores its page text in Flate-compressed streams. Text-based
 * files are read directly. Scanned PDFs (pictures of pages) carry no text at
 * all, which is why every failure path ends with "paste your CV instead".
 */

export interface CandidateProfile {
  name?: string
  email?: string
  phone?: string
  degree?: string
  university?: string
  graduationYear?: string
  /** Short facts lifted from experience / projects / skills, for the email body. */
  highlights: string[]
  fileName: string
  characters: number
}

export class CvReadError extends Error {}

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const DEGREE =
  /\b(ph\.?d|doctorate|doctor of|master|m\.?eng|m\.?sc|mba|bachelor|b\.?eng|beng|b\.?sc|bsc|honours|hons|advanced diploma|diploma)\b/i
const UNIVERSITY = /\b(university|institute of technology|polytechnic|college|school of engineering|faculty of engineering)\b/i
const SECTION_HEAD =
  /^(experience|work experience|professional experience|employment|industry experience|projects?|research|research experience|skills|technical skills|software|thesis|final.year project|capstone|awards?|publications?|education)\b/i
const NOISE = /^(curriculum vitae|resume|résumé|vitae|cv)$/i

function tidy(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[\s#>*\-–•|,:]+/, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim()
}

function lines(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(tidy)
    .filter(Boolean)
}

function findName(all: string[]) {
  for (const line of all.slice(0, 12)) {
    if (NOISE.test(line) || EMAIL.test(line) || /\d/.test(line)) continue
    if (DEGREE.test(line) || UNIVERSITY.test(line)) continue
    const words = line.split(' ')
    if (words.length < 2 || words.length > 4) continue
    if (line.length > 42) continue
    if (!words.every((word) => /^[A-Z][A-Za-z'’.-]+$/.test(word))) continue
    return line
  }
  return undefined
}

function findEmail(text: string) {
  return text.match(EMAIL)?.[0]
}

function findPhone(all: string[]) {
  for (const line of all) {
    const matches = line.match(/\+?\d[\d\s().-]{7,18}\d/g)
    if (!matches) continue
    for (const candidate of matches) {
      const digits = candidate.replace(/\D/g, '')
      if (digits.length >= 8 && digits.length <= 15) return tidy(candidate)
    }
  }
  return undefined
}

function findDegree(all: string[]) {
  const line = all.find((entry) => DEGREE.test(entry) && entry.length < 120)
  return line ? line.slice(0, 110) : undefined
}

function findUniversity(all: string[]) {
  const line = all.find((entry) => UNIVERSITY.test(entry) && entry.length < 120)
  if (!line) return undefined

  // Pull the institution out of the line rather than repeating the whole degree.
  const phrase =
    line.match(/(?:The )?University of [A-Z][\w'’.-]*(?:\s+[A-Z][\w'’.-]*)*/)?.[0] ??
    line.match(/[A-Z][\w'’.-]*(?:\s+[A-Z][\w'’.-]*)+\)?\s+(?:University|Institute of Technology|College)/)?.[0]

  return (phrase ?? line).replace(/\)+\s*$/, '').replace(/,$/, '').slice(0, 90)
}

function findGraduationYear(text: string) {
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)]
    .map((match) => Number(match[0]))
    .filter((year) => year >= 1990 && year <= 2035)
  return years.length ? String(Math.max(...years)) : undefined
}

function findHighlights(all: string[]) {
  const picked: string[] = []

  for (let index = 0; index < all.length && picked.length < 3; index += 1) {
    if (!SECTION_HEAD.test(all[index])) continue
    for (let next = index + 1; next < all.length && next <= index + 4; next += 1) {
      const line = all[next]
      if (SECTION_HEAD.test(line)) break
      if (line.length < 18 || line.length > 150) continue
      if (EMAIL.test(line) || DEGREE.test(line) || UNIVERSITY.test(line)) continue
      picked.push(line)
      break
    }
  }

  return picked.slice(0, 3)
}

/** Pull the email-ready facts out of CV text. Missing fields stay undefined rather than guessed. */
export function parseCv(rawText: string, fileName = ''): CandidateProfile {
  const all = lines(rawText)

  return {
    name: findName(all),
    email: findEmail(rawText),
    phone: findPhone(all),
    degree: findDegree(all),
    university: findUniversity(all),
    graduationYear: findGraduationYear(rawText),
    highlights: findHighlights(all),
    fileName,
    characters: rawText.replace(/\s+/g, ' ').trim().length,
  }
}

/* ---------------------------------------------------------------- unpacking */

function inflate(bytes: Uint8Array, format: 'deflate' | 'deflate-raw') {
  if (typeof DecompressionStream === 'undefined') {
    throw new CvReadError('This browser cannot unpack the file. Paste your CV text instead.')
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format))
  return new Response(stream).arrayBuffer().then((buffer) => new Uint8Array(buffer))
}

function latin1(bytes: Uint8Array) {
  return new TextDecoder('latin1').decode(bytes)
}

function decodePdfString(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, character: string) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }
      return map[character] ?? character
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
}

/** Text from a text-based PDF. Returns '' for scans and encrypted files. */
export async function extractPdfText(bytes: Uint8Array) {
  const raw = latin1(bytes)
  const chunks: string[] = []
  let cursor = 0

  while (chunks.join(' ').length < 20000) {
    const start = raw.indexOf('stream', cursor)
    if (start === -1) break
    const bodyStart = raw.indexOf('\n', start) + 1
    const end = raw.indexOf('endstream', bodyStart)
    if (end === -1) break
    cursor = end + 9

    const header = raw.slice(Math.max(0, start - 700), start)
    const slice = bytes.subarray(bodyStart, end)

    let content = ''
    if (/\/FlateDecode/.test(header)) {
      try {
        content = latin1(await inflate(slice, 'deflate'))
      } catch {
        continue
      }
    } else if (!/\/Image|DCTDecode|JPXDecode/.test(header)) {
      content = latin1(slice)
    }

    if (!/Tj|TJ/.test(content)) continue
    for (const [, literal] of content.matchAll(/\(((?:\\.|[^\\()])*)\)/g)) {
      chunks.push(decodePdfString(literal))
    }
  }

  // One text run per line: PDF text is drawn in fragments, so joining with
  // spaces would merge the name into the email address on the same line.
  return chunks
    .join('\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

/** Text from word/document.xml inside a DOCX zip, using the central directory. */
export async function extractDocxText(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let eocd = -1
  for (let index = bytes.length - 22; index >= 0 && index > bytes.length - 66000; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocd = index
      break
    }
  }
  if (eocd === -1) throw new CvReadError('That .docx file is damaged. Paste your CV text instead.')

  const entries = view.getUint16(eocd + 10, true)
  let offset = view.getUint32(eocd + 16, true)

  for (let entry = 0; entry < entries; entry += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break
    const method = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localOffset = view.getUint32(offset + 42, true)
    const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength))

    if (name === 'word/document.xml') {
      const localNameLength = view.getUint16(localOffset + 26, true)
      const localExtraLength = view.getUint16(localOffset + 28, true)
      const dataStart = localOffset + 30 + localNameLength + localExtraLength
      const data = bytes.subarray(dataStart, dataStart + compressedSize)
      const xml =
        method === 0 ? new TextDecoder().decode(data) : latin1(await inflate(data, 'deflate-raw'))

      return xml
        .replace(/<w:tab[^>]*\/>/g, ' ')
        .replace(/<\/w:p>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    offset += 46 + nameLength + extraLength + commentLength
  }

  throw new CvReadError('That .docx file has no readable document inside it.')
}

export const CV_ACCEPT = '.pdf,.docx,.txt,.md,.rtf'

/** Read a picked file and return its text plus the parsed profile. */
export async function readCv(file: File): Promise<{ text: string; profile: CandidateProfile }> {
  const name = file.name.toLowerCase()
  let text = ''

  if (name.endsWith('.pdf')) {
    text = await extractPdfText(new Uint8Array(await file.arrayBuffer()))
    if (text.length < 40) {
      throw new CvReadError(
        'This PDF has no selectable text (it is probably a scan), so nothing could be read. Paste your CV text instead.',
      )
    }
  } else if (name.endsWith('.docx')) {
    text = await extractDocxText(new Uint8Array(await file.arrayBuffer()))
  } else if (name.endsWith('.txt') || name.endsWith('.md')) {
    text = await file.text()
  } else {
    throw new CvReadError('Only .pdf, .docx, .txt and .md files can be read. Paste your CV text instead.')
  }

  const profile = parseCv(text, file.name)
  if (!profile.name && !profile.email && !profile.degree) {
    throw new CvReadError('The text was read but nothing usable was found. Paste your CV text instead.')
  }

  return { text, profile }
}
