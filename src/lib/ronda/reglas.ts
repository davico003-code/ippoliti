// Ronda Funes Roldán — tipos y reglas puras (sin red ni Redis).
//
// La Ronda es la grilla semanal donde las inmobiliarias de Funes y Roldán se
// comparten propiedades (verficha.casa/ronda). Reglas de David (12-oct-2026):
// ronda mensual (cada oportunidad dura 30 días; empezó semanal), solo
// oportunidades reales con su motivo por escrito, hasta 3 por inmobiliaria, y todos
// cargan su WhatsApp la primera vez.

export const CIUDADES_RONDA = ['Funes', 'Roldán'] as const
export type CiudadRonda = (typeof CIUDADES_RONDA)[number]

/** Los tres botones de la grilla; lo demás (locales, galpones…) sale en "Todas". */
export type GrupoTipo = 'Casa' | 'Lote' | 'Departamento' | 'Otro'

/** La ronda es MENSUAL (David, 14-oct-2026: "lo vamos a hacer 1 vez al mes"). */
export const DIAS_PUBLICACION = 30
/** "Es fundamental y obligatorio escribir por qué lo considerás oportunidad" (David, 14-oct-2026). */
export const MOTIVO_MINIMO = 25
export const MOTIVO_MAXIMO = 500
export const MAX_POR_INMOBILIARIA = 3
export const DIA_MS = 86_400_000

export interface Inmobiliaria {
  id: string
  nombre: string
  matriculado: string
  matricula: string
  creada: number
}

export interface AgenteRonda {
  id: string
  nombre: string
  /** 10 dígitos, con característica, sin 0 ni 15 ("3413340916"). */
  whatsapp: string
  inmobiliariaId: string
  alta: number
}

export interface Publicacion {
  id: string
  tipo: string
  grupo: GrupoTipo
  operacion: string
  ciudad: CiudadRonda
  barrio: string | null
  titulo: string
  precio: number | null
  moneda: 'USD' | 'ARS'
  m2: number | null
  dormitorios: number | null
  banos: number | null
  foto: string | null
  fotos: number
  /** La ficha neutra para el cliente (verficha.casa/<slug>). */
  ficha: string
  origen: 'Tokko' | 'Zonaprop' | 'Web'
  urlOriginal: string
  oportunidad: string
  agente: { id: string; nombre: string; whatsapp: string }
  inmobiliaria: { id: string; nombre: string; matriculado: string; matricula: string }
  creada: number
  vence: number
  /** Todo lo que se ve sin entrar a la ficha (desde el 14-oct-2026; las de antes lo completan al leerse). */
  detalle?: DetallePublicacion
}

export interface DetallePublicacion {
  /** La galería: las mismas fotos de la ficha para el cliente. */
  fotos: string[]
  m2Cubiertos: number | null
  m2Terreno: number | null
  ambientes: number | null
  cocheras: number | null
  /** Pileta, parrilla, seguridad… (nunca los números: esos van aparte). */
  comodidades: string[]
  /** La descripción ya limpia de contactos (la misma de la ficha), recortada. */
  descripcion: string
}

/** Lo que es comodidad de verdad: saca "3 dormitorios", "546 m² terreno" y repetidos. */
export function comodidadesDe(caracteristicas: unknown): string[] {
  const lista = Array.isArray(caracteristicas) ? caracteristicas : []
  const vistas = new Set<string>()
  const out: string[] = []
  for (const c of lista) {
    const t = String(c ?? '').replace(/\s+/g, ' ').trim()
    const clave = sinTildes(t)
    if (!t || t.length > 40 || /^\d/.test(t) || /\bm²|\bm2\b|ambiente|dormitorio|bano|cochera|toilette/.test(clave) || vistas.has(clave)) continue
    vistas.add(clave)
    out.push(t.charAt(0).toUpperCase() + t.slice(1))
  }
  return out.slice(0, 16)
}

export function sinTildes(s: string): string {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * "341 334-0916", "+54 9 341 3340916", "0341 15 3340916" → "3413340916".
 * null si no quedan los 10 dígitos de un celular argentino.
 */
export function normalizarWhatsapp(crudo: unknown): string | null {
  let d = String(crudo ?? '').replace(/\D/g, '')
  if (d.length > 10 && d.startsWith('54')) d = d.slice(2)
  if (d.length > 10 && d.startsWith('9')) d = d.slice(1)
  if (d.length > 10 && d.startsWith('0')) d = d.slice(1)
  // "341 15 3340916": el 15 va después de la característica (2 a 4 dígitos).
  if (d.length === 12) {
    for (const largo of [2, 3, 4]) {
      if (d.slice(largo, largo + 2) === '15') {
        d = d.slice(0, largo) + d.slice(largo + 2)
        break
      }
    }
  }
  return /^[1-9]\d{9}$/.test(d) ? d : null
}

/** La ciudad de la ronda que nombran los textos; null si no nombran ninguna o nombran las dos. */
export function detectarCiudad(...textos: Array<string | null | undefined>): CiudadRonda | null {
  const t = sinTildes(textos.filter(Boolean).join(' · '))
  const funes = /\bfunes\b/.test(t)
  const roldan = /\broldan\b/.test(t)
  if (funes === roldan) return null
  return funes ? 'Funes' : 'Roldán'
}

export function esCiudadRonda(v: unknown): v is CiudadRonda {
  return v === 'Funes' || v === 'Roldán'
}

const ETIQUETA_TIPO: Record<string, string> = {
  house: 'Casa',
  apartment: 'Departamento',
  lot: 'Lote',
  ph: 'PH',
  country_house: 'Quinta',
  commercial: 'Local',
  office: 'Oficina',
  warehouse: 'Galpón',
  garage: 'Cochera',
}

/** property_type del lector ("house", "lot"…) o un nombre suelto ("Terreno") → etiqueta de la grilla. */
export function etiquetaTipo(tipo: string): string {
  if (ETIQUETA_TIPO[tipo]) return ETIQUETA_TIPO[tipo]
  const t = sinTildes(tipo)
  if (/terreno|lote/.test(t)) return 'Lote'
  if (/depart|monoamb/.test(t)) return 'Departamento'
  if (/^ph$/.test(t)) return 'PH'
  // Zonaprop nombra los tipos en plural ("Casas", "Locales comerciales").
  if (/^casas?$/.test(t) || /chalet/.test(t)) return 'Casa'
  if (/^local/.test(t)) return 'Local'
  if (/^oficina/.test(t)) return 'Oficina'
  if (/galpon|deposito|bodega/.test(t)) return 'Galpón'
  if (/^quinta/.test(t)) return 'Quinta'
  if (/^cochera/.test(t)) return 'Cochera'
  if (/^campo/.test(t)) return 'Campo'
  const limpio = String(tipo ?? '').trim()
  return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : 'Propiedad'
}

export function grupoDeTipo(etiqueta: string): GrupoTipo {
  const t = sinTildes(etiqueta)
  if (/lote|terreno/.test(t)) return 'Lote'
  if (/depart|monoamb|loft|duplex|\bph\b/.test(t)) return 'Departamento'
  if (/casa|chalet|quinta|cabana/.test(t)) return 'Casa'
  return 'Otro'
}

export function textoOperacion(op: string): string {
  const t = sinTildes(op)
  if (/tempor/.test(t)) return 'Alquiler temporario'
  if (/rent|alquil/.test(t)) return 'Alquiler'
  return 'Venta'
}

/** "Casa en venta en Kentucky, Funes": el título lo arma la Ronda, nunca el texto del aviso. */
export function tituloRonda(p: { tipo: string; operacion: string; barrio: string | null; ciudad: string }): string {
  const lugar = [p.barrio, p.ciudad].filter(Boolean).join(', ')
  return `${p.tipo} en ${p.operacion.toLowerCase()} en ${lugar}`
}

/** El barrio que se muestra: nada si repite la ciudad. */
export function barrioVisible(barrio: string | null | undefined, ciudad: string): string | null {
  const b = String(barrio ?? '').trim()
  if (!b) return null
  const nb = sinTildes(b)
  if (nb === sinTildes(ciudad) || CIUDADES_RONDA.some((c) => sinTildes(c) === nb)) return null
  return b.slice(0, 60)
}

/** Clave para saber si un link ya está publicado: host + ruta, sin parámetros. */
export function claveDeUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/+$/, '').toLowerCase()}`
  } catch {
    return url.trim().toLowerCase()
  }
}

export type OrigenLink = 'tokko' | 'web' | 'zonaprop'

/** El número de un aviso de Zonaprop: "…-en-vida-barrio-59318668.html" → "59318668". */
export function idDeZonaprop(url: string): string | null {
  try {
    const u = new URL(url)
    if (!/(^|\.)zonaprop\.com\.ar$/.test(u.hostname.toLowerCase())) return null
    return /-(\d{6,12})\.html$/.exec(u.pathname)?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * De dónde es el link que se intenta convertir solo; null si no es de ninguno.
 *  - tokko / web: páginas que se dejan leer con un pedido común (la ficha
 *    pública de Tokko y la web de SI).
 *  - zonaprop: se lee por su número en la búsqueda pública de Zonaprop (ver
 *    zonaprop-busqueda.ts) y se completa con la copia que Hilo ya tenía; si no
 *    aparece en ninguna de las dos, se pide otro enlace (no hay carga a mano).
 */
export function origenDeLink(url: string): OrigenLink | null {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null
  const host = u.hostname.toLowerCase()
  if (/(^|\.)ficha\.info$/.test(host) && u.pathname.startsWith('/p/')) return 'tokko'
  if (/(^|\.)siinmobiliaria\.com$/.test(host) && /^\/propiedades\/\d+/.test(u.pathname)) return 'web'
  if (idDeZonaprop(url)) return 'zonaprop'
  return null
}

/** El precio que corrige quien publica: un número sano, o null (a consultar). */
export function leerPrecio(v: unknown): number | null {
  return numeroEntre(v, 2_000_000_000)
}

function numeroEntre(v: unknown, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/\./g, '').replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 && n <= max ? Math.round(n) : null
}

/**
 * Antes de leer o publicar: el cupo de la inmobiliaria y las repetidas.
 *  - Reemplazar (David, 14-oct-2026: "se puede reemplazar la oportunidad y
 *    arranca desde 0"): la que se reemplaza no cuenta, y tiene que ser de quien publica.
 *  - La misma propiedad la pueden publicar DOS inmobiliarias ("cada uno puede
 *    elegir a qué colega contactar"); lo que no se puede es repetirla dentro de la misma.
 */
export function chequeoAlPublicar(
  grilla: Publicacion[],
  quien: { agenteId: string; inmobiliariaId: string },
  { url, reemplaza }: { url: string; reemplaza?: string | null },
  ahora = Date.now(),
): { error: string; status: number; limite?: boolean } | null {
  const vigentes = activas(grilla, ahora)
  if (reemplaza) {
    const vieja = vigentes.find((p) => p.id === reemplaza)
    if (!vieja) return { error: 'La oportunidad que querías reemplazar ya no está en la ronda.', status: 404 }
    if (vieja.agente.id !== quien.agenteId) return { error: 'Solo podés reemplazar una oportunidad que publicaste vos.', status: 403 }
  }
  const otras = vigentes.filter((p) => p.id !== reemplaza)
  if (ocupadas(otras, quien.inmobiliariaId, ahora) >= MAX_POR_INMOBILIARIA) {
    return {
      error: `Tu inmobiliaria ya tiene ${MAX_POR_INMOBILIARIA} oportunidades en la ronda, que es el máximo. Para publicar otra, reemplazá o dá de baja una.`,
      status: 409,
      limite: true,
    }
  }
  const clave = url ? claveDeUrl(url) : ''
  if (clave && otras.some((p) => p.inmobiliaria.id === quien.inmobiliariaId && p.urlOriginal && claveDeUrl(p.urlOriginal) === clave)) {
    return { error: 'Tu inmobiliaria ya publicó esa propiedad en la ronda.', status: 409 }
  }
  return null
}

/** El motivo de la oportunidad: obligatorio y con sustancia. Devuelve el texto limpio o el error. */
export function leerMotivo(v: unknown): { motivo: string } | { error: string } {
  const motivo = String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, MOTIVO_MAXIMO)
  if (!motivo) return { error: 'Escribí por qué es una oportunidad: es obligatorio.' }
  if (motivo.length < MOTIVO_MINIMO) return { error: 'Contá un poco más por qué es una oportunidad (precio, urgencia del dueño, permuta…).' }
  return { motivo }
}

export function activas(publicaciones: Publicacion[], ahora = Date.now()): Publicacion[] {
  return publicaciones.filter((p) => p.vence > ahora).sort((a, b) => b.creada - a.creada)
}

/** Cuántos lugares tiene ocupados una inmobiliaria esta semana. */
export function ocupadas(publicaciones: Publicacion[], inmobiliariaId: string, ahora = Date.now()): number {
  return activas(publicaciones, ahora).filter((p) => p.inmobiliaria.id === inmobiliariaId).length
}

// ── Descripción apta para el cliente ────────────────────────────────────
// Portado de Hilo (si-crm/src/lib/mercado/detalle-neutral.ts → descripcionNeutra):
// saca cada ORACIÓN que nombre a la inmobiliaria, dé un contacto o ubique el
// inmueble. Mejor perder una oración que regalarle el colega al cliente.

const RENGLON_DE_CONTACTO = new RegExp(
  [
    '@', 'https?://', 'www\\.', '\\.com', 'whats\\s*app', '\\bwsp\\b', '\\bwpp\\b', '\\btel[eé]?f?', '\\bcel(ular)?\\b',
    '\\bllam', '\\bcontact', '\\bconsult(a|á|e|ar|anos|enos)(?![a-zñ])', 'inmobiliari', '\\bmatr[ií]cula', '\\bmat\\.', 'cucicba', 'cpmcal',
    '\\bcorredor', '\\bcol\\.? ?n', '\\bhonorari', '\\bcomisi[oó]n', '\\bvisitas?\\b.*\\bcoordin', '\\bref(erencia)?\\.? ?:',
    '\\bc[oó]d(igo)?\\.? ?:', '\\bid ?:',
  ].join('|'),
  'i',
)
/** 7+ dígitos seguidos (con espacios, guiones o puntos): un teléfono. */
const TELEFONO = /(?:\+?\d[\s().-]?){7,}/
/** Una calle con nombre propio ("sobre calle Onas"): ubica el inmueble. */
const CALLE = /\b(?:[Cc]alles?|[Aa]v(?:enida)?\.?|[Bb]v(?:ard)?\.?|[Pp]asaje|[Rr]uta)\s+(?:N[°º]?\s*)?[A-ZÁÉÍÓÚÑ0-9]/

/**
 * El texto de un aviso de Zonaprop tal como lo manda (`descriptionNormalized`):
 * las comillas vienen codificadas DOS veces ("&amp;quot;A&amp;quot;") y con un
 * espacio después de cada punto, también dentro de los números ("usd350. 000",
 * "400. 08m2"). Se decodifica y se vuelven a pegar los números: sin esto,
 * `descripcionNeutra` tomaba "000." como una oración vacía y la borraba (quedaba
 * "usd350."). Se pegan los miles (punto + 3 cifras) y los decimales de una
 * medida (punto + 2 cifras + m2/mts/metros/%); "año 2010. 15 lotes" queda igual.
 * Y Zonaprop tapa con "Ver datos" todo lo que parece un teléfono, un mail o un
 * código (184 de 1.431 avisos de la copia): sale la oración que lo tiene.
 */
export function textoDeZonaprop(texto: string | null | undefined): string {
  let t = String(texto ?? '')
  for (let i = 0; i < 3 && /&amp;/i.test(t); i++) t = t.replace(/&amp;/gi, '&')
  t = t
    .replace(/&quot;/gi, '"')
    .replace(/&(?:apos|#0*39);/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    // "&#9;" (tabulación), "&#160;" (espacio duro) y los de control quedan como un espacio.
    .replace(/&#(\d{1,5});/g, (_, n: string) => (Number(n) < 32 || Number(n) === 160 ? ' ' : String.fromCodePoint(Number(n))))
  for (let i = 0; i < 4; i++) {
    const antes = t
    t = t
      .replace(/(?<!\d)(\d{1,3})\. (\d{3})(?!\d)/g, '$1.$2')
      .replace(/(?<!\d)(\d{1,4})\. (\d{2})(?=\s?(?:m2|m²|mts|metros|%))/gi, '$1.$2')
    if (t === antes) break
  }
  return t
    .split('\n')
    .map(sinVerDatos)
    .filter((renglon): renglon is string => renglon !== null)
    .join('\n')
}

/**
 * Un renglón con "Ver datos": sale ENTERA cada oración que lo tenga. Zonaprop
 * lo pone donde el colega escribió un teléfono, un mail o un código, así que esa
 * oración es casi siempre de contacto ("comunicarse al Ver datos - Ver datos",
 * "- KPVer datos - TVer datos -"); mejor perder una oración que dejar un
 * "comunicarse al -" en la ficha. Si no queda nada, sale el renglón (null).
 * Los demás renglones no se tocan. (Igual que Hilo, src/lib/zonaprop-texto.ts.)
 */
function sinVerDatos(renglon: string): string | null {
  if (!renglon.includes('Ver datos')) return renglon
  const queda = renglon
    .split(/(?<=[.!?])\s+/)
    .filter((oracion) => !oracion.includes('Ver datos'))
    .join(' ')
    .trim()
  return queda || null
}

export function descripcionNeutra(texto: string | null | undefined, marcas: Array<string | null | undefined> = []): string {
  if (!texto) return ''
  const prohibidas = marcas.map((m) => (m ? sinTildes(m) : '')).filter((m) => m.length >= 3)
  const apta = (oracion: string): boolean => {
    // Un resto sin palabras ("1234" después de "Mat.") no dice nada y puede ser un dato.
    if ((oracion.match(/[a-záéíóúñ]/gi) ?? []).length < 4) return false
    if (RENGLON_DE_CONTACTO.test(oracion) || TELEFONO.test(oracion) || CALLE.test(oracion)) return false
    const n = sinTildes(oracion)
    return !prohibidas.some((m) => n.includes(m))
  }
  const renglones = texto.split('\n').map((linea) => {
    const t = linea.trim()
    if (!t) return ''
    const quedan = t.split(/(?<=[.!?])\s+/).filter(apta)
    return quedan.length > 0 ? quedan.join(' ') : null
  })
  return renglones
    .filter((r): r is string => r !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
