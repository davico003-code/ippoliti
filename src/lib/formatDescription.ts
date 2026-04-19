// Pure parser for raw Tokko property descriptions.
// Returns a structured array of blocks that the React component renders
// without dangerouslySetInnerHTML, so no auto-linking of URLs/emails/phones
// and no HTML injection surface.

export type FormattedBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'keyvalue'; items: { key: string; value: string }[] }

// Detect list prefixes: "- ", "• ", "* ", "✓ ", "✔ ", "→ "
const BULLET_RE = /^[-*•✓✔→]\s+(.*)$/
// Detect ordered list prefixes: "1) ", "1. ", "12) ", etc.
const ORDERED_RE = /^(\d{1,3})[.)]\s+(.+)$/
// Detect "Key: value" — key is short (< ~40 chars) without sentence punctuation
const KEYVALUE_RE = /^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ][\wÁÉÍÓÚÜÑáéíóúüñ\s]{1,39}?):\s+(.+)$/

// Check if a string starts with a common emoji codepoint (without needing the
// regex `u` flag which isn't available under the default TS target).
function startsWithEmoji(s: string): boolean {
  const cp = s.codePointAt(0)
  if (cp == null) return false
  return (
    (cp >= 0x2300 && cp <= 0x23FF) ||   // Misc technical (e.g. ⌚)
    (cp >= 0x2600 && cp <= 0x27BF) ||   // Misc symbols, dingbats
    (cp >= 0x1F000 && cp <= 0x1F2FF) || // Mahjong, domino, cards
    (cp >= 0x1F300 && cp <= 0x1FAFF)    // Misc pictographs, symbols
  )
}
function splitEmoji(s: string): { emoji: string; rest: string } | null {
  if (!startsWithEmoji(s)) return null
  const cp = s.codePointAt(0)!
  const emoji = String.fromCodePoint(cp)
  const rest = s.slice(emoji.length).trim()
  if (!rest) return null
  return { emoji, rest }
}

function toSentenceCase(s: string): string {
  const lower = s.toLocaleLowerCase('es-AR')
  return lower.charAt(0).toLocaleUpperCase('es-AR') + lower.slice(1)
}

function looksLikeHeading(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed.length > 60) return false
  if (BULLET_RE.test(trimmed)) return false
  if (ORDERED_RE.test(trimmed)) return false

  // 1) ALL CAPS (at least 3 chars, no ending period)
  const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR') && !trimmed.endsWith('.')) {
    return true
  }

  // 2) Ends with ":" and has NO content after it (otherwise it's a keyvalue)
  if (/:\s*$/.test(trimmed)) return true

  // 3) Starts with an emoji followed by short content (section marker)
  if (splitEmoji(trimmed) && trimmed.length <= 50) return true

  return false
}

function normalizeHeading(line: string): string {
  let s = line.trim()
  // Strip trailing ":" if present
  s = s.replace(/:\s*$/, '')
  // Keep the emoji as a prefix; normalize the rest
  const emojiMatch = splitEmoji(s)
  if (emojiMatch) {
    return `${emojiMatch.emoji} ${toSentenceCase(emojiMatch.rest)}`
  }
  // If ALL CAPS → sentence case
  const letters = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR')) {
    return toSentenceCase(s)
  }
  return s
}

type Line =
  | { kind: 'blank' }
  | { kind: 'heading'; text: string }
  | { kind: 'list-item'; ordered: boolean; text: string }
  | { kind: 'keyvalue'; key: string; value: string }
  | { kind: 'text'; text: string }

function classify(rawLine: string): Line {
  const line = rawLine.trim()
  if (!line) return { kind: 'blank' }

  // Headings win first (ALL-CAPS or trailing colon) — but only when the line
  // has no value after a colon. We check KEYVALUE only when the colon has
  // content after it.
  if (looksLikeHeading(line)) return { kind: 'heading', text: normalizeHeading(line) }

  const bullet = line.match(BULLET_RE)
  if (bullet) return { kind: 'list-item', ordered: false, text: bullet[1].trim() }

  const ordered = line.match(ORDERED_RE)
  if (ordered) return { kind: 'list-item', ordered: true, text: ordered[2].trim() }

  const kv = line.match(KEYVALUE_RE)
  if (kv) return { kind: 'keyvalue', key: kv[1].trim(), value: kv[2].trim() }

  return { kind: 'text', text: line }
}

export function formatDescription(raw: string | null | undefined): FormattedBlock[] {
  if (!raw || !raw.trim()) return []

  // Normalize line endings; collapse 3+ newlines to 2
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const lines = normalized.split('\n').map(classify)
  const blocks: FormattedBlock[] = []

  let paragraph: string[] = []
  let listItems: string[] = []
  let listOrdered = false
  let kvItems: { key: string; value: string }[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems, ordered: listOrdered })
      listItems = []
    }
  }
  const flushKV = () => {
    if (kvItems.length === 1) {
      // Single keyvalue is better as a paragraph-like line
      blocks.push({ type: 'paragraph', text: `${kvItems[0].key}: ${kvItems[0].value}` })
    } else if (kvItems.length > 1) {
      blocks.push({ type: 'keyvalue', items: kvItems })
    }
    kvItems = []
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
    flushKV()
  }

  for (const line of lines) {
    switch (line.kind) {
      case 'blank':
        flushAll()
        break
      case 'heading':
        flushAll()
        blocks.push({ type: 'heading', text: line.text })
        break
      case 'list-item':
        flushParagraph()
        flushKV()
        if (listItems.length && listOrdered !== line.ordered) flushList()
        listOrdered = line.ordered
        listItems.push(line.text)
        break
      case 'keyvalue':
        flushParagraph()
        flushList()
        kvItems.push({ key: line.key, value: line.value })
        break
      case 'text':
        flushList()
        flushKV()
        paragraph.push(line.text)
        break
    }
  }
  flushAll()

  return blocks
}
