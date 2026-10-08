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
  // compact: línea corta seguida de otra línea corta (dirección, datos sueltos):
  // va pegada a la siguiente en vez de con aire de párrafo.
  | { type: 'paragraph'; content: string; subtitle?: string; compact?: boolean }
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
// HILO/Tokko suelen mandar los ítems (un check que se degradó a "?"). También
// los pegados al texto ("✓Gimnasio", "-Oficina en planta alta") y el ". " que
// algunos agentes usan como viñeta.
const BULLET_RE =
  /^\s*(?:(?:[•·‣▪◦●○*✓✔☑▶►»–—-]|\?)\s+|[•‣▪◦●○✓✔☑▶►»]\s*|[-–—](?=[A-ZÁÉÍÓÚÑ0-9¿])|\.\s+(?=[A-ZÁÉÍÓÚÑ]))/

// Saca TODOS los marcadores del inicio: "• ✓ Piscina" mostraba un ✓ doble.
function stripBullets(line: string): string {
  let s = line
  while (BULLET_RE.test(s)) s = s.replace(BULLET_RE, '')
  return s.trim()
}

// Abreviaturas que terminan en punto sin cerrar la oración ("Av. Pellegrini",
// "Sup. total", "Piso 5, Depto. B"): ni subtítulo ni corte de párrafo.
const ABREVIATURAS = new Set([
  'av', 'avda', 'bv', 'bvd', 'bvard', 'sup', 'superf', 'depto', 'dpto', 'dto', 'exc', 'excl',
  'cub', 'semicub', 'descub', 'aprox', 'arq', 'ing', 'dr', 'dra', 'sr', 'sra', 'gral', 'pje',
  'nro', 'nº', 'n°', 'tel', 'cel', 'esq', 'prov', 'pcia', 'cnel', 'pte', 'sta', 'sto', 'mts',
  'mt', 'km', 'hs', 'etc', 'ej', 'lic', 'cdad', 'urb', 'mz', 'mza', 'lte',
])
function terminaEnAbreviatura(antes: string): boolean {
  const ultima = norm(antes.match(/(\S+)$/)?.[1] ?? '').replace(/^[(«"“]+/, '')
  return ultima.length === 1 || ABREVIATURAS.has(ultima)
}

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
  // "Casa 1. Lote 3", "Piso 5, Depto. B", "Av. San Martín": datos, no subtítulos.
  if (/[\d,]/.test(subtitle) || terminaEnAbreviatura(subtitle)) return null
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
      listItems.push(stripBullets(line))
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
      items.push(stripBullets(line))
    }
  }
  flushItems()

  return blocks
}

// Polish tipográfico SEGURO (no toca palabras ni mayúsculas).
function polish(s: string): string {
  return s
    // Líneas separadoras ("_______", "-----", "*****"): ruido visual.
    .replace(/^[ \t]*[_=~*·•.\-–—]{3,}[ \t]*$/gm, '')
    .replace(/_{4,}/g, '\n')
    // "7.013 m²? USD 5.030.000": una flecha/guion que llegó degradado a "?"
    // (una pregunta de verdad trae "¿" en la misma línea).
    .replace(/^[^¿\n]*$/gm, (l) => l.replace(/([0-9²³)])\?[ \t]+(?=[A-Z0-9$])/g, '$1 – '))
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

// ── Aire para leer ─────────────────────────────────────────────────────────
// Un párrafo de 700+ caracteres es un muro, sobre todo en el celular. Se corta
// en oraciones (respetando "Av.", "Sup.", etc.) y se reagrupa en párrafos de
// 2-3 oraciones. El texto no cambia: solo dónde va el aire.
const PARRAFO_LARGO = 560
const CORTE_OBJETIVO = 280

function dividirEnOraciones(texto: string): string[] {
  const oraciones: string[] = []
  const re = /[.!?…]["”»)]?\s+(?=[¿¡"“«(]?[A-ZÁÉÍÓÚÑ0-9])/g
  let desde = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(texto))) {
    const fin = m.index + m[0].trimEnd().length
    if (terminaEnAbreviatura(texto.slice(desde, m.index))) continue
    oraciones.push(texto.slice(desde, fin).trim())
    desde = m.index + m[0].length
  }
  oraciones.push(texto.slice(desde).trim())
  return oraciones.filter(Boolean)
}

function partirParrafoLargo(texto: string): string[] {
  if (texto.length <= PARRAFO_LARGO) return [texto]
  const partes: string[] = []
  let actual = ''
  for (const o of dividirEnOraciones(texto)) {
    if (actual.length >= CORTE_OBJETIVO) {
      partes.push(actual)
      actual = o
    } else {
      actual = actual ? `${actual} ${o}` : o
    }
  }
  if (actual) {
    // Una cola de media línea no merece párrafo propio.
    if (partes.length > 0 && actual.length < 120) partes[partes.length - 1] += ` ${actual}`
    else partes.push(actual)
  }
  return partes
}

const LINEA_CORTA = 90
function esLineaCorta(b: FormattedBlock | undefined): boolean {
  return !!b && b.type === 'paragraph' && b.content.length + (b.subtitle?.length ?? 0) < LINEA_CORTA
}

function darAire(blocks: FormattedBlock[]): FormattedBlock[] {
  const out: FormattedBlock[] = []
  for (const b of blocks) {
    if (b.type !== 'paragraph') {
      out.push(b)
      continue
    }
    partirParrafoLargo(b.content).forEach((content, i) =>
      out.push(i === 0 && b.subtitle ? { type: 'paragraph', content, subtitle: b.subtitle } : { type: 'paragraph', content }),
    )
  }
  // Líneas cortas seguidas ("Av. San Martín 1248." / "Contrato x 1 año.") van
  // juntas como un bloque, no como renglones sueltos con aire de párrafo.
  return out.map((b, i) =>
    b.type === 'paragraph' && esLineaCorta(b) && esLineaCorta(out[i + 1]) ? { ...b, compact: true } : b,
  )
}

// Titular SEO al inicio en forma de título ("COUNTRY PALOS VERDES – CASA DE 5
// DORMITORIOS CON PILETA"): repite el H1 de la ficha. La ficha lo saca; la
// verficha ya tiene su propio `omitirTituloInicial`.
export function quitarTitularInicial(blocks: FormattedBlock[]): FormattedBlock[] {
  // Un "Descripción" suelto arriba repite el encabezado de la sección.
  if (blocks.length > 1 && blocks[0].type !== 'list' && blocks[0].type !== 'dataGroup' &&
      /^descripcion( de la propiedad)?:?$/.test(norm(blocks[0].content))) {
    blocks = blocks.slice(1)
  }
  const b = blocks[0]
  if (blocks.length < 2 || b.type !== 'title') return blocks
  // También el titular en MAYÚSCULAS sin guiones ("LOTE EN VENTA BARRIO LA
  // CASONA ROLDÁN"); un eslogan sin datos del aviso ("OPORTUNIDAD ÚNICA EN
  // FUNES LAKES") se queda.
  const enMayusculas = b.content === b.content.toLocaleUpperCase('es-AR')
  if (isSeoHeadline(b.content) || (enMayusculas && b.content.length <= 95 && LISTING_KW.test(b.content))) {
    return blocks.slice(1)
  }
  return blocks
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

  return darAire(blocks)
}
