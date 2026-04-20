// Minimal parser for raw Tokko property descriptions.
// Only detects titles (bold) and preserves paragraphs. Nothing else.

export type FormattedBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }

function isHeading(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  // Títulos cortos en TODO MAYÚSCULAS (sin terminar en punto)
  if (trimmed.length < 60) {
    const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
    if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR') && !trimmed.endsWith('.')) {
      return true
    }
  }
  // Títulos que terminan con ":" (< 50 chars)
  if (trimmed.length < 50 && /:\s*$/.test(trimmed)) return true
  return false
}

function stripTrailingColon(s: string): string {
  return s.replace(/:\s*$/, '').trim()
}

export function formatDescription(raw: string | null | undefined): FormattedBlock[] {
  if (!raw || !raw.trim()) return []

  // Normalize line endings; collapse 3+ newlines to 2
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

    // Walk line by line inside the paragraph: títulos se promocionan a heading,
    // el resto se acumula como párrafo fluido (saltos simples → espacio).
    let buffer: string[] = []
    const flush = () => {
      if (buffer.length) {
        blocks.push({ type: 'paragraph', text: buffer.join(' ') })
        buffer = []
      }
    }
    for (const line of lines) {
      if (isHeading(line)) {
        flush()
        blocks.push({ type: 'heading', text: stripTrailingColon(line) })
      } else {
        buffer.push(line)
      }
    }
    flush()
  }

  return blocks
}
