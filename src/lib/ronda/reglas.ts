// Ronda Funes Roldán — tipos y reglas puras (sin red ni Redis).
//
// La Ronda es la grilla semanal donde las inmobiliarias de Funes y Roldán se
// comparten propiedades (verficha.casa/ronda). Reglas de David (12-oct-2026):
// cada publicación dura 7 días, hasta 2 propiedades por inmobiliaria, y todos
// cargan su WhatsApp la primera vez.

export const CIUDADES_RONDA = ['Funes', 'Roldán'] as const
export type CiudadRonda = (typeof CIUDADES_RONDA)[number]

/** Los tres botones de la grilla; lo demás (locales, galpones…) sale en "Todas". */
export type GrupoTipo = 'Casa' | 'Lote' | 'Departamento' | 'Otro'

export const DIAS_PUBLICACION = 7
export const MAX_POR_INMOBILIARIA = 2
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
  origen: 'Tokko' | 'Web' | 'Manual'
  /** Vacío en las cargadas a mano. */
  urlOriginal: string
  oportunidad: string
  agente: { id: string; nombre: string; whatsapp: string }
  inmobiliaria: { id: string; nombre: string; matriculado: string; matricula: string }
  creada: number
  vence: number
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

export type OrigenLink = 'tokko' | 'web'

/**
 * De dónde es el link que se puede leer solo; null si no es de ninguno.
 * Solo páginas que se dejan leer con un pedido común: la ficha pública de Tokko
 * y la web de SI. Zonaprop y Argenprop bloquean la lectura automática (y no se
 * les pasa por arriba): esas propiedades se cargan a mano.
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
  return null
}

// ── Carga a mano ────────────────────────────────────────────────────────

export const TIPOS_MANUAL = ['Casa', 'Lote', 'Departamento', 'PH', 'Local', 'Oficina', 'Galpón', 'Quinta'] as const
export const MAX_FOTOS_MANUAL = 10

export interface DatosManual {
  tipo: string
  operacion: 'Venta' | 'Alquiler'
  barrio: string | null
  precio: number | null
  moneda: 'USD' | 'ARS'
  m2: number | null
  dormitorios: number | null
  banos: number | null
  descripcion: string
  fotos: string[]
  /** El aviso en su portal (Zonaprop, Argenprop…), para que el colega lo pueda abrir. */
  enlace: string | null
}

/** Solo fotos que subió la Ronda a nuestro almacén: nadie cuela una dirección ajena. */
export function esFotoDeLaRonda(url: unknown): url is string {
  try {
    const u = new URL(String(url))
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com') && u.pathname.startsWith('/ronda/')
  } catch {
    return false
  }
}

/** Un enlace https sano (sin usuario ni puerto), o null. No se lee: solo se guarda para abrirlo. */
export function enlaceDeAviso(v: unknown): string | null {
  try {
    const u = new URL(String(v ?? '').trim().slice(0, 600))
    if (u.protocol !== 'https:' || u.username || u.password || u.port || !u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

function numeroEntre(v: unknown, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/\./g, '').replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 && n <= max ? Math.round(n) : null
}

/** Valida lo que llega del formulario de carga a mano. */
export function leerDatosManual(crudo: unknown): { datos: DatosManual } | { error: string } {
  const c = (crudo && typeof crudo === 'object' ? crudo : {}) as Record<string, unknown>
  const tipo = TIPOS_MANUAL.find((t) => t === c.tipo)
  if (!tipo) return { error: 'Elegí el tipo de propiedad.' }
  const fotos = Array.isArray(c.fotos) ? c.fotos.filter(esFotoDeLaRonda).slice(0, MAX_FOTOS_MANUAL) : []
  if (fotos.length === 0) return { error: 'Agregá al menos una foto.' }
  const texto = (v: unknown, max: number) => String(v ?? '').replace(/[ \t]+/g, ' ').trim().slice(0, max)
  return {
    datos: {
      tipo,
      operacion: c.operacion === 'Alquiler' ? 'Alquiler' : 'Venta',
      barrio: texto(c.barrio, 60).replace(/\s+/g, ' ') || null,
      precio: numeroEntre(c.precio, 2_000_000_000),
      moneda: c.moneda === 'ARS' ? 'ARS' : 'USD',
      m2: numeroEntre(c.m2, 10_000_000),
      dormitorios: numeroEntre(c.dormitorios, 30),
      banos: numeroEntre(c.banos, 30),
      descripcion: texto(c.descripcion, 3000),
      fotos,
      enlace: enlaceDeAviso(c.enlace),
    },
  }
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
