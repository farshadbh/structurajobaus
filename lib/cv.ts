/*
 * Reads a CV in the browser: nothing is uploaded, nothing is stored on the
 * server, and no library is needed.
 *
 * PDF and DOCX are containers, not text, so both are unpacked here with the
 * browser's own DecompressionStream: a DOCX is a zip with word/document.xml in
 * it, and a PDF stores its page text in compressed streams. Text files are read
 * directly.
 *
 * PDFs come in three flavours and all three are handled:
 *  - plain text in `(literal)` strings, the Word / LaTeX case;
 *  - text in `<hex>` strings drawn with a subset font, where the bytes are glyph
 *    ids rather than letters - the Chrome, Canva and Google Docs case. The file
 *    ships a ToUnicode table next to the font, which is read here and used to
 *    turn those ids back into characters;
 *  - pictures of pages (scans), which carry no text at all. That case cannot be
 *    read without OCR, so the student is offered the paste box instead.
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

function asciiHex(bytes: Uint8Array) {
  const clean = latin1(bytes).replace(/[^0-9a-f]/gi, '')
  const out = new Uint8Array(Math.floor(clean.length / 2))
  for (let index = 0; index < out.length; index += 1) {
    out[index] = parseInt(clean.slice(index * 2, index * 2 + 2), 16)
  }
  return out
}

/** ASCII85, used as an outer filter by a few PDF generators. */
function ascii85(bytes: Uint8Array) {
  const text = latin1(bytes)
    .replace(/[\s\r\n]+/g, '')
    .replace(/^<~/, '')
    .replace(/~>[\s\S]*$/, '')

  const out: number[] = []
  let group: number[] = []

  for (const character of text) {
    if (character === 'z' && group.length === 0) {
      out.push(0, 0, 0, 0)
      continue
    }
    const digit = character.charCodeAt(0) - 33
    if (digit < 0 || digit > 84) continue
    group.push(digit)
    if (group.length === 5) {
      let value = 0
      for (const entry of group) value = value * 85 + entry
      out.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255)
      group = []
    }
  }

  if (group.length > 1) {
    const missing = 5 - group.length
    let value = 0
    for (const entry of group) value = value * 85 + entry
    for (let index = 0; index < missing; index += 1) value = value * 85 + 84
    const quad = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]
    out.push(...quad.slice(0, 4 - missing))
  }

  return new Uint8Array(out)
}

/* ------------------------------------------------------------------ cmaps */

interface CMap {
  codes: Map<number, string>
  wide: boolean
}

function utf16be(hex: string) {
  const clean = hex.replace(/[^0-9a-f]/gi, '')
  if (clean.length <= 2) return String.fromCharCode(parseInt(clean || '0', 16))

  let out = ''
  for (let index = 0; index + 4 <= clean.length; index += 4) {
    out += String.fromCharCode(parseInt(clean.slice(index, index + 4), 16))
  }
  return out
}

/**
 * A ToUnicode table: the file's own glyph-id to character dictionary. Without
 * it, a subset-font PDF reads as meaningless numbers, which is the "it says my
 * CV is a photo" complaint.
 */
function parseToUnicode(text: string): CMap | null {
  const codes = new Map<number, string>()
  let wide = false

  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const match of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      if (match[1].length > 2) wide = true
      codes.set(parseInt(match[1], 16), utf16be(match[2]))
    }
  }

  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const match of block[1].matchAll(
      /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(\[[\s\S]*?\]|<[0-9a-fA-F]+>)/g,
    )) {
      const start = parseInt(match[1], 16)
      const end = parseInt(match[2], 16)
      if (match[1].length > 2) wide = true
      if (end < start || end - start > 4096) continue

      if (match[3].startsWith('[')) {
        const targets = [...match[3].matchAll(/<([0-9a-fA-F]+)>/g)].map((entry) => entry[1])
        targets.forEach((hex, offset) => {
          if (start + offset <= end) codes.set(start + offset, utf16be(hex))
        })
      } else {
        const base = parseInt(match[3].slice(1, -1), 16)
        for (let code = start; code <= end; code += 1) {
          codes.set(code, String.fromCharCode(base + (code - start)))
        }
      }
    }
  }

  return codes.size ? { codes, wide } : null
}

type Piece = { kind: 'literal' | 'hex' | 'space'; value: string }

function unescapeLiteral(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, character: string) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }
      return map[character] ?? character
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
}

function decodeWith(pieces: Piece[], cmap?: CMap) {
  let text = ''
  let hits = 0
  let total = 0

  for (const piece of pieces) {
    if (piece.kind === 'space') {
      text += ' '
      continue
    }

    if (piece.kind === 'literal') {
      const value = unescapeLiteral(piece.value)
      if (!cmap) {
        text += value
        continue
      }
      if (cmap.wide) {
        for (let index = 0; index + 1 < value.length; index += 2) {
          const code = (value.charCodeAt(index) << 8) | value.charCodeAt(index + 1)
          total += 1
          const hit = cmap.codes.get(code)
          if (hit) {
            text += hit
            hits += 1
          } else {
            text += ' '
          }
        }
      } else {
        for (const character of value) {
          const code = character.charCodeAt(0) & 0xff
          total += 1
          const hit = cmap.codes.get(code)
          if (hit) {
            text += hit
            hits += 1
          } else {
            text += character
          }
        }
      }
      continue
    }

    if (!cmap) continue
    const clean = piece.value.replace(/[^0-9a-fA-F]/g, '')
    const bytes: number[] = []
    for (let index = 0; index + 2 <= clean.length; index += 2) {
      bytes.push(parseInt(clean.slice(index, index + 2), 16))
    }
    const step = cmap.wide ? 2 : 1
    for (let index = 0; index + step <= bytes.length; index += step) {
      const code = step === 2 ? (bytes[index] << 8) | bytes[index + 1] : bytes[index]
      total += 1
      const hit = cmap.codes.get(code)
      if (hit) {
        text += hit
        hits += 1
      }
    }
  }

  return { text, hits, total }
}

/** Decode one run of text-showing operators, letting the file's own tables choose the mapping. */
function decodeRun(pieces: Piece[], cmaps: CMap[]) {
  const hasHex = pieces.some((piece) => piece.kind === 'hex')
  if (hasHex && cmaps.length === 0) return ''

  let best = ''
  let bestHits = 0

  for (const cmap of cmaps) {
    const attempt = decodeWith(pieces, cmap)
    if (!attempt.total) continue
    // A wrong table still produces characters, so only trust one that explains
    // most of the codes in this run.
    if (attempt.hits / attempt.total < 0.6) continue
    if (attempt.hits > bestHits) {
      bestHits = attempt.hits
      best = attempt.text
    }
  }

  if (best) return best
  return hasHex ? '' : decodeWith(pieces).text
}

const PDF_TOKEN =
  /\[((?:[^[\]\\]|\\.)*)\]\s*TJ|\(((?:\\.|[^\\()])*)\)\s*(Tj|'|")|<([0-9a-fA-F\s]+)>\s*Tj|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|(-?[\d.]+(?:\s+-?[\d.]+){5})\s+Tm|(T\*)|(BT|ET)/g

function inflated(bytes: Uint8Array, format: 'deflate' | 'deflate-raw') {
  return inflate(bytes, format).catch((error) => {
    // A stream whose /Length is one byte long drags the newline before
    // "endstream" into the data, and the decompressor refuses trailing junk.
    let end = bytes.length
    while (end > 0 && (bytes[end - 1] === 10 || bytes[end - 1] === 13 || bytes[end - 1] === 32)) {
      end -= 1
    }
    if (end === bytes.length) throw error
    return inflate(bytes.subarray(0, end), format)
  })
}

/** Turn one decompressed content stream into lines of text. */
function textFromContent(content: string, cmaps: CMap[]) {
  let out = ''
  let buffer = ''
  let pieces: Piece[] = []
  let x = 0
  let y = 0
  let sawText = false

  const flush = () => {
    if (!pieces.length) return
    buffer += decodeRun(pieces, cmaps)
    pieces = []
  }

  const newline = () => {
    flush()
    out += buffer.replace(/[ \t]+/g, ' ').trim() + '\n'
    buffer = ''
  }

  const space = () => {
    flush()
    if (buffer && !buffer.endsWith(' ')) buffer += ' '
  }

  PDF_TOKEN.lastIndex = 0
  for (let match = PDF_TOKEN.exec(content); match; match = PDF_TOKEN.exec(content)) {
    if (match[1] !== undefined) {
      sawText = true
      for (const inner of match[1].matchAll(
        /\(((?:\\.|[^\\()])*)\)|<([0-9a-fA-F\s]+)>|(-?[\d.]+)/g,
      )) {
        if (inner[1] !== undefined) pieces.push({ kind: 'literal', value: inner[1] })
        else if (inner[2] !== undefined) pieces.push({ kind: 'hex', value: inner[2] })
        else if (Number(inner[3]) <= -80) pieces.push({ kind: 'space', value: ' ' })
      }
      continue
    }

    if (match[2] !== undefined) {
      sawText = true
      if (match[3] !== 'Tj') newline()
      pieces.push({ kind: 'literal', value: match[2] })
      continue
    }

    if (match[4] !== undefined) {
      sawText = true
      pieces.push({ kind: 'hex', value: match[4] })
      continue
    }

    if (match[5] !== undefined) {
      const dx = Number(match[5])
      const dy = Number(match[6])
      x += dx
      y += dy
      if (Math.abs(dy) > 0.5) newline()
      else if (dx > 0.5) space()
      continue
    }

    if (match[7] !== undefined) {
      const numbers = match[7].trim().split(/\s+/).map(Number)
      const nextX = numbers[4] ?? 0
      const nextY = numbers[5] ?? 0
      if (Math.abs(nextY - y) > 0.5) newline()
      else if (nextX > x + 0.5) space()
      x = nextX
      y = nextY
      continue
    }

    if (match[8] !== undefined) {
      newline()
      continue
    }

    if (match[9] !== undefined) newline()
  }

  newline()
  return { text: out, sawText }
}

function filtersOf(header: string) {
  const at = header.lastIndexOf('/Filter')
  if (at === -1) return []
  const tail = header.slice(at, at + 200)
  return [...tail.matchAll(
    /\/(ASCII85Decode|ASCIIHexDecode|FlateDecode|LZWDecode|RunLengthDecode|DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode)/g,
  )].map((match) => match[1])
}

export interface PdfText {
  text: string
  /** True when the file has text operators but none could be decoded. */
  sawTextOperators: boolean
  imageStreams: number
}

/** Text from a PDF. Returns empty text (never throws) for scans and odd files. */
export async function extractPdfText(bytes: Uint8Array): Promise<PdfText> {
  const raw = latin1(bytes)
  const streams: Uint8Array[] = []
  let cursor = 0

  while (streams.length < 400) {
    const start = raw.indexOf('stream', cursor)
    if (start === -1) break
    // "endstream" also contains "stream"; skip it.
    if (raw.slice(start - 3, start) === 'end') {
      cursor = start + 6
      continue
    }

    // Only this object's own dictionary: a 900-byte window can reach back into
    // the previous object and pick up its /Length, which silently clips the
    // compressed data and loses the font map.
    const header = raw.slice(Math.max(0, raw.lastIndexOf('obj', start), start - 4000), start)
    const after = start + 6
    let bodyStart = after
    if (raw[after] === '\r' && raw[after + 1] === '\n') bodyStart = after + 2
    else if (raw[after] === '\n' || raw[after] === '\r') bodyStart = after + 1

    // A direct /Length is authoritative; an indirect one is left to the
    // endstream search, which is where an off-by-one used to lose every stream.
    const declared = header.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/)
    let end = -1
    if (declared) {
      const candidate = bodyStart + Number(declared[1])
      if (raw.slice(candidate, candidate + 30).includes('endstream')) end = candidate
    }
    if (end === -1) end = raw.indexOf('endstream', bodyStart)
    if (end === -1) break
    cursor = end + 9

    let data = bytes.subarray(bodyStart, end)
    try {
      for (const filter of filtersOf(header)) {
        if (filter === 'FlateDecode') data = await inflated(data, 'deflate')
        else if (filter === 'ASCII85Decode') data = ascii85(data)
        else if (filter === 'ASCIIHexDecode') data = asciiHex(data)
        else throw new CvReadError('unsupported filter')
      }
    } catch {
      continue
    }
    streams.push(data)
    if (streams.reduce((total, stream) => total + stream.length, 0) > 24_000_000) break
  }

  let textBytes = 0
  for (const stream of streams) textBytes += stream.length

  const cmaps: CMap[] = []
  for (const stream of streams) {
    const content = latin1(stream)
    if (content.includes('beginbfchar') || content.includes('beginbfrange')) {
      const cmap = parseToUnicode(content)
      if (cmap) cmaps.push(cmap)
    }
  }

  const out: string[] = []
  let sawTextOperators = false
  let imageStreams = 0

  for (const stream of streams) {
    const content = latin1(stream)
    if (content.includes('beginbfchar') || content.includes('beginbfrange')) continue
    if (!/Tj|TJ/.test(content)) {
      if (/\/Image|DCTDecode|JPXDecode|CCITTFaxDecode/.test(content)) imageStreams += 1
      continue
    }
    const result = textFromContent(content, cmaps)
    sawTextOperators = sawTextOperators || result.sawText
    if (result.text.trim()) out.push(result.text)
  }

  const text = out
    .join('')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')

  return { text, sawTextOperators, imageStreams }
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
    const pdf = await extractPdfText(new Uint8Array(await file.arrayBuffer()))
    if (pdf.text.length < 40) {
      throw new CvReadError(
        pdf.sawTextOperators
          ? 'This PDF draws its text with an embedded font that cannot be decoded reliably, so nothing usable came out. Open the PDF, select all, copy, and paste the text below — that always works.'
          : 'This PDF is a picture of a page with no text layer, so there is nothing to read. Paste your CV text below instead.',
      )
    }
    text = pdf.text
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
