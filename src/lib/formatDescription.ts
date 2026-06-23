// Parser de descripciones de propiedades de Tokko.
//
// Dos caminos:
//  1) Texto YA formateado (con saltos de línea): camino clásico — detecta títulos
//     (negrita), líneas de dato "Label: value" (agrupadas), subtítulos inline y
//     párrafos normales. No se toca: respeta lo que cargó el agente.
//  2) Texto "corrido" (sin saltos, todo pegado por camelCase y punto+mayúscula):
//     se normaliza automáticamente — se arreglan los espacios, se separan los
//     ítems pegados, se detectan secciones (Planta Baja/Alta, Terminaciones, etc.)
//     y se renderizan como párrafos con título en negrita. Degrada elegante.

export type FormattedBlock =
  | { type: 'title'; content: string }
  | { type: 'paragraph'; content: string; subtitle?: string }
  | { type: 'dataGroup'; content: Array<{ key: string; value: string }> }

// Secciones conocidas (multi-palabra y distintivas para evitar falsos positivos).
const SECTION_HEADERS = [
  'Planta Baja',
  'Planta Alta',
  'Planta Subsuelo',
  'Terminaciones y equipamiento',
  'Terminaciones',
  'Equipamiento',
  'Amenities',
  'Servicios',
  'Comodidades',
  'Distribución',
  'Detalles constructivos',
  'Características',
]

// ── Heurísticas de título (camino clásico) ─────────────────────────────────
function isTitle(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed.length < 60) {
    const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
    if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR') && !/[.!?]$/.test(trimmed)) {
      return true
    }
  }
  if (trimmed.length < 50 && /:\s*$/.test(trimmed)) return true
  return false
}

function stripTrailingColon(s: string): string {
  return s.replace(/:\s*$/, '').trim()
}

const DATA_LINE_RE = /^([^:\n]{1,34}):\s+(.+)$/
function parseDataLine(line: string): { key: string; value: string } | null {
  const m = line.match(DATA_LINE_RE)
  if (!m) return null
  const key = m[1].trim()
  const value = m[2].trim()
  if (!value) return null
  if (key.split(/\s+/).length > 4) return null
  if (/\.\s/.test(key)) return null
  return { key, value }
}

const SUBTITLE_RE = /^([A-ZÁÉÍÓÚÜÑ][^.]{0,23})\.\s+(.+)$/
function parseSubtitle(line: string): { subtitle: string; rest: string } | null {
  const m = line.match(SUBTITLE_RE)
  if (!m) return null
  const subtitle = m[1].trim()
  const rest = m[2].trim()
  if (!rest) return null
  if (subtitle.split(/\s+/).length > 3) return null
  return { subtitle, rest }
}

// ── Camino clásico (texto ya con saltos de línea) ──────────────────────────
function parseStructured(normalized: string): FormattedBlock[] {
  const paragraphs = normalized.split(/\n{2,}/)
  const blocks: FormattedBlock[] = []

  for (const para of paragraphs) {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

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
      flushData()
      proseBuffer.push(line)
    }
    flushData()
    flushProse()
  }

  return blocks
}

// ── Camino "texto corrido" ─────────────────────────────────────────────────
// Inserta los cortes que el texto no trae: espacio tras puntuación pegada a
// mayúscula, salto al unir ítems (minúscula/dígito → Mayúscula) y aísla las
// secciones conocidas en su propia línea.
function preprocessRunOn(raw: string): string {
  let t = raw.replace(/\r\n?/g, '\n').trim()
  // Oraciones pegadas: "minutos.La" → "minutos. La"
  t = t.replace(/([.;:!?,])(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '$1 ')
  // Ítems pegados: "guardadoBaño" / "82x82Aberturas" → salto de línea
  t = t.replace(/([a-záéíóúüñ0-9%²°)\]])([A-ZÁÉÍÓÚÑ])/g, '$1\n$2')
  // Aísla las secciones conocidas en su propia línea (solo si ocupan el final de la línea)
  for (const h of SECTION_HEADERS) {
    const re = new RegExp(`[ \\t]*(${h})[ \\t]*(?=\\n|$)`, 'g')
    t = t.replace(re, '\n$1\n')
  }
  return t
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function isKnownHeader(line: string): boolean {
  const l = line.trim().toLowerCase()
  return SECTION_HEADERS.some(h => h.toLowerCase() === l)
}

// Línea de prosa: tiene corte de oración interno o es larga (no es un ítem suelto).
function isProseLine(line: string): boolean {
  return /\.\s/.test(line) || line.length > 92
}

function parseRunOn(raw: string): FormattedBlock[] {
  const lines = preprocessRunOn(raw)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const blocks: FormattedBlock[] = []
  let items: string[] = []

  const flushItems = () => {
    if (items.length === 0) return
    const joined = items.join(' · ').replace(/\s{2,}/g, ' ').trim()
    blocks.push({ type: 'paragraph', content: joined })
    items = []
  }

  for (const line of lines) {
    if (isKnownHeader(line) || isTitle(line)) {
      flushItems()
      blocks.push({ type: 'title', content: stripTrailingColon(line) })
    } else if (isProseLine(line)) {
      flushItems()
      blocks.push({ type: 'paragraph', content: line })
    } else {
      items.push(line)
    }
  }
  flushItems()

  return blocks
}

// Polish tipográfico SEGURO (no toca palabras ni mayúsculas):
//  - dimensiones "82x82" → "82×82"
//  - espacios sobrantes antes de signos de puntuación
function polish(s: string): string {
  return s
    .replace(/(\d)\s*[xX]\s*(\d)/g, '$1×$2')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
}

// Detecta un "headline SEO" inicial — la típica primera línea que repite el
// título de la ficha (operación + tipo + dormitorios + barrio, con guiones).
// No tiene corte de oración (no es prosa real) y no se pisa con la intro.
const LISTING_KW = /\b(en venta|en alquiler|venta|alquiler|dormitorios?|ambientes?|monoambiente|departamento|casa|ph|lote|terreno|local|oficina|d[uú]plex|chalet)\b/i
function isSeoHeadline(content: string): boolean {
  const c = content.trim()
  if (/[.][ ]/.test(c) || c.length > 95) return false
  return LISTING_KW.test(c) && /[-–—|·]/.test(c)
}

// ── Entry point ────────────────────────────────────────────────────────────
export function formatDescription(raw: string | null | undefined): FormattedBlock[] {
  if (!raw || !raw.trim()) return []

  const normalized = polish(
    raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  )

  // "Texto corrido": casi sin saltos pero largo → normalización automática.
  const newlineCount = (normalized.match(/\n/g) || []).length
  const isRunOn = newlineCount < 2 && normalized.length > 180

  let blocks: FormattedBlock[] = []
  if (isRunOn) blocks = parseRunOn(normalized)
  if (blocks.length === 0) blocks = parseStructured(normalized)

  // Saca el headline SEO inicial (repite el título de la ficha que ya está arriba).
  if (blocks.length > 1 && blocks[0].type === 'paragraph' && isSeoHeadline(blocks[0].content)) {
    blocks = blocks.slice(1)
  }

  return blocks
}
