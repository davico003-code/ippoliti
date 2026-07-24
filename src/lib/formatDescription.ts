// Parser de descripciones de propiedades (Tokko / HILO).
//
// El texto llega en formatos muy variados según lo cargó el agente:
//  1) Con saltos de línea reales (uno por párrafo o por ítem) — el más común.
//  2) HTML ya "aplanado" por getDescription (que convirtió <p>/<div>/<br> a \n).
//  3) Texto "corrido": todo pegado, sin saltos, unido por camelCase y punto+
//     mayúscula.
//
// Objetivo: que leer un anuncio sea AGRADABLE — títulos en negrita con aire,
// listas de comodidades como viñetas y párrafos separados, nunca un muro denso.

export type FormattedBlock =
  | { type: 'title'; content: string }
  | { type: 'paragraph'; content: string; subtitle?: string }
  | { type: 'dataGroup'; content: Array<{ key: string; value: string }> }
  | { type: 'list'; items: string[] }

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

// Encabezados de sección de una/dos palabras que aparecen solos en su línea
// (labels de bloques que muchos agentes usan). Se detectan como título aunque
// no estén en MAYÚSCULAS ni terminen en ":".
const SHORT_HEADERS = [
  'El Edificio',
  'El Barrio',
  'La Propiedad',
  'Ubicación',
  'Observación',
  'Observaciones',
  'Superficies',
  'Superficie',
  'Antigüedad',
  'Garantías',
  'Garantía',
  'Expensas',
  'Método de pago',
  'Etapa del inmueble',
  'Condiciones del contrato',
  'Contrato',
  'Dormitorios',
  'Cocina',
  'Living',
  'Baños',
  'Detalle',
]

const norm = (s: string) =>
  s.trim().toLocaleLowerCase('es-AR').normalize('NFD').replace(/[̀-ͯ]/g, '')
const KNOWN_HEADERS_NORM = new Set([...SECTION_HEADERS, ...SHORT_HEADERS].map(norm))

// ¿La línea es un encabezado de sección conocido? (tolerante a acentos/caso)
function isKnownSectionHeader(line: string): boolean {
  return KNOWN_HEADERS_NORM.has(norm(stripTrailingColon(line)))
}

// Secciones que abren una LISTA de comodidades (sus ítems van como viñetas).
const LIST_SECTION_RE = /^(planta |amenities|comodidades|servicios|terminaciones|equipamiento|caracter[ií]sticas|detalles)/i

// Encabezados que introducen una lista de comodidades: las líneas cortas que les
// siguen se agrupan como viñetas aunque no traigan marcador.
const LIST_INTRO_RE =
  /^(consta de|cuenta con|la propiedad (cuenta|consta)|incluye|comodidades|caracter[ií]sticas|servicios|amenities|detalles|equipamiento|distribuci[óo]n|posee|dispone de)\b/i

// Marcador de viñeta al inicio de línea: •, -, –, *, ✓, y el "?" con el que
// HILO/Tokko suelen mandar los ítems (un check que se degradó a "?").
const BULLET_RE = /^\s*(?:[•·‣▪◦●○*✓✔☑▶►»–—-]|\?)\s+/

// ── Heurísticas de título ──────────────────────────────────────────────────
function isTitle(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  // Línea en MAYÚSCULAS (headline), sin puntuación de cierre.
  if (trimmed.length <= 90) {
    const letters = trimmed.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
    if (letters.length >= 3 && letters === letters.toLocaleUpperCase('es-AR') && !/[.!?]$/.test(trimmed)) {
      return true
    }
  }
  // Línea corta que termina en ":" (subtítulo tipo "Cuenta con:").
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

// Un título en MAYÚSCULAS suele venir pegado al cuerpo por falta de salto:
// "…POSIBILIDADESSobre un extraordinario terreno…". Detectamos la transición
// (última MAYÚS de la corrida seguida de Palabra-Capitalizada) y separamos el
// headline en su propia línea.
function splitGluedHeadline(line: string): string {
  const m = line.match(
    /^([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ,;.|/&()°²–—-]{6,})([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ].*)$/,
  )
  if (!m) return line
  const head = m[1].trim()
  const rest = m[2].trim()
  // El head tiene que ser realmente un headline en mayúsculas (sin minúsculas).
  const headLetters = head.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  if (headLetters.length < 6 || headLetters !== headLetters.toLocaleUpperCase('es-AR')) return line
  return `${head}\n${rest}`
}

// Es una línea de prosa "de verdad": tiene corte de oración interno o es larga.
function isProseLine(line: string): boolean {
  return /[.;]\s/.test(line) || line.length > 92
}

// ── Camino principal (texto con saltos de línea) ───────────────────────────
function parseStructured(normalized: string): FormattedBlock[] {
  // Cada \n es un corte deliberado del agente → cada línea es una unidad.
  const lines = normalized
    .split('\n')
    .flatMap((l) => splitGluedHeadline(l.trim()).split('\n'))
    .map((l) => l.trim())

  const blocks: FormattedBlock[] = []
  let dataGroup: Array<{ key: string; value: string }> = []
  let listItems: string[] = []
  // Si el título anterior introduce una lista, las líneas cortas siguientes se
  // agrupan como viñetas aunque no traigan marcador.
  let listMode = false

  const flushData = () => {
    if (dataGroup.length > 0) {
      blocks.push({ type: 'dataGroup', content: dataGroup })
      dataGroup = []
    }
  }
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems })
      listItems = []
    }
  }

  // Label corto (1-4 palabras, sin puntuación de cierre) que rotula el bloque
  // siguiente: título si lo que sigue es prosa o un dato ("El Edificio", "Método
  // de pago"). No dispara en modo lista (ahí una línea corta es un ítem).
  const looksLikeLabel = (line: string, next: string | undefined): boolean => {
    if (!next) return false
    if (line.length > 30 || /[.!?:;]$/.test(line)) return false
    if (!/^[A-ZÁÉÍÓÚÜÑ¿]/.test(line)) return false
    if (line.split(/\s+/).length > 4) return false
    if (BULLET_RE.test(line) || parseDataLine(line)) return false
    return isProseLine(next) || !!parseDataLine(next)
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const next = lines.slice(i + 1).find(Boolean)

    // Ítem con marcador explícito (•, -, ?, …): siempre viñeta.
    if (BULLET_RE.test(line)) {
      flushData()
      listItems.push(line.replace(BULLET_RE, '').trim())
      continue
    }

    const knownHeader = isKnownSectionHeader(line)
    if (knownHeader || isTitle(line) || looksLikeLabel(line, next)) {
      flushData()
      flushList()
      const clean = stripTrailingColon(line)
      blocks.push({ type: 'title', content: clean })
      // ¿Este título abre una lista de comodidades? (secciones tipo "Planta
      // Baja", "Amenities", intros "Cuenta con:", o cualquier título seguido de
      // líneas cortas). Un label seguido de prosa NO abre lista.
      listMode =
        LIST_INTRO_RE.test(clean) ||
        LIST_SECTION_RE.test(clean) ||
        /:\s*$/.test(line) ||
        (!!next && !isProseLine(next) && !parseDataLine(next))
      continue
    }

    const dl = parseDataLine(line)
    if (dl) {
      flushList()
      dataGroup.push(dl)
      continue
    }

    flushData()

    // En "modo lista" (venimos de un intro tipo "Cuenta con:" o "Planta Baja"),
    // las líneas cortas sin corte de oración son ítems; una de prosa cierra la
    // lista.
    if (listMode && !isProseLine(line)) {
      listItems.push(line)
      continue
    }
    listMode = false
    flushList()

    // Párrafo (con posible subtítulo inline "Documentación. El texto…").
    const sub = parseSubtitle(line)
    if (sub) blocks.push({ type: 'paragraph', content: sub.rest, subtitle: sub.subtitle })
    else blocks.push({ type: 'paragraph', content: line })
  }
  flushData()
  flushList()

  return blocks
}

// ── Camino "texto corrido" ─────────────────────────────────────────────────
function preprocessRunOn(raw: string): string {
  let t = raw.replace(/\r\n?/g, '\n').trim()
  t = t.replace(/([.;:!?,])(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '$1 ')
  t = t.replace(/([a-záéíóúüñ0-9%²°)\]])([A-ZÁÉÍÓÚÑ])/g, '$1\n$2')
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
  return SECTION_HEADERS.some((h) => h.toLowerCase() === l)
}

function parseRunOn(raw: string): FormattedBlock[] {
  const lines = preprocessRunOn(raw)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const blocks: FormattedBlock[] = []
  let items: string[] = []

  const flushItems = () => {
    if (items.length === 0) return
    blocks.push({ type: 'list', items: items.slice() })
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
      items.push(line.replace(BULLET_RE, '').trim())
    }
  }
  flushItems()

  return blocks
}

// Polish tipográfico SEGURO (no toca palabras ni mayúsculas).
function polish(s: string): string {
  return s
    .replace(/(\d)[ \t]*[xX][ \t]*(\d)/g, '$1×$2')
    // Solo espacios/tabs antes de puntuación (NO \n: rompía las viñetas "\n? item",
    // porque "?" es puntuación y se comía el salto de línea del ítem).
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
}

// "Headline SEO" inicial (repite el título de la ficha): operación + tipo +
// dormitorios + barrio, con guiones. No es prosa real.
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
