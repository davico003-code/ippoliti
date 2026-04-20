// Minimal parser for raw Tokko property descriptions.
// Detects only: titles (bold), data lines "Label: value" (grouped),
// inline sub-title prefixes in paragraphs ("Planta Baja. rest..."), and
// normal paragraphs. Nothing else — no lists, no icons, no grids.

export type FormattedBlock =
  | { type: 'title'; content: string }
  | { type: 'paragraph'; content: string; subtitle?: string }
  | { type: 'dataGroup'; content: Array<{ key: string; value: string }> }

// Title heuristics — any of these matches counts as a title.
function isTitle(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false

  // (a) Short line in ALL CAPS (no ending period)
  if (trimmed.length < 60) {
    const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
    if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR') && !/[.!?]$/.test(trimmed)) {
      return true
    }
  }
  // (b) Short line ending with ":"
  if (trimmed.length < 50 && /:\s*$/.test(trimmed)) return true

  return false
}

function stripTrailingColon(s: string): string {
  return s.replace(/:\s*$/, '').trim()
}

// Data line: "Label: value" — label ≤ 34 chars, ≤ 4 words, no internal period.
const DATA_LINE_RE = /^([^:\n]{1,34}):\s+(.+)$/
function parseDataLine(line: string): { key: string; value: string } | null {
  const m = line.match(DATA_LINE_RE)
  if (!m) return null
  const key = m[1].trim()
  const value = m[2].trim()
  if (!value) return null
  // Too many words in the key → probably a sentence with a colon
  if (key.split(/\s+/).length > 4) return null
  // Internal period in the key suggests a sentence boundary mis-match
  if (/\.\s/.test(key)) return null
  return { key, value }
}

// Inline sub-title in a single-line paragraph: "Planta Baja. rest of paragraph..."
const SUBTITLE_RE = /^([A-ZÁÉÍÓÚÜÑ][^.]{0,23})\.\s+(.+)$/
function parseSubtitle(line: string): { subtitle: string; rest: string } | null {
  const m = line.match(SUBTITLE_RE)
  if (!m) return null
  const subtitle = m[1].trim()
  const rest = m[2].trim()
  if (!rest) return null
  // Subtitle must have at most 3 words and each word capitalized or short connector
  const words = subtitle.split(/\s+/)
  if (words.length > 3) return null
  return { subtitle, rest }
}

export function formatDescription(raw: string | null | undefined): FormattedBlock[] {
  if (!raw || !raw.trim()) return []

  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const paragraphs = normalized.split(/\n{2,}/)
  const blocks: FormattedBlock[] = []

  for (const para of paragraphs) {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    // Walk line by line inside the paragraph, accumulating data lines into
    // a group and prose lines into a paragraph buffer. Flush transitions.
    let dataGroup: Array<{ key: string; value: string }> = []
    let proseBuffer: string[] = []

    const flushData = () => {
      if (dataGroup.length > 0) {
        blocks.push({ type: 'dataGroup', content: dataGroup })
        dataGroup = []
      }
    }
    const flushProse = () => {
      if (proseBuffer.length > 0) {
        const joined = proseBuffer.join(' ')
        // If this is a single-line prose, try to extract an inline subtitle.
        const sub = proseBuffer.length === 1 ? parseSubtitle(joined) : null
        if (sub) {
          blocks.push({ type: 'paragraph', content: sub.rest, subtitle: sub.subtitle })
        } else {
          blocks.push({ type: 'paragraph', content: joined })
        }
        proseBuffer = []
      }
    }

    for (const line of lines) {
      if (isTitle(line)) {
        flushData()
        flushProse()
        blocks.push({ type: 'title', content: stripTrailingColon(line) })
        continue
      }
      const dl = parseDataLine(line)
      if (dl) {
        flushProse()
        dataGroup.push(dl)
        continue
      }
      // Prose line — si había un grupo de datos, cerrarlo primero
      flushData()
      proseBuffer.push(line)
    }
    flushData()
    flushProse()
  }

  return blocks
}
