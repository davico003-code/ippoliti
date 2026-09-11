// Listado de alquileres — proyección, agrupado y formato compartidos entre
// la hoja imprimible del panel (/agentes/lista-alquileres) y el PDF
// descargable desde /propiedades. Fuente única: las dos salidas muestran
// exactamente lo mismo.

import {
  getMainPhoto,
  getTotalSurface,
  type TokkoProperty,
} from './tokko'

export interface AlquilerItem {
  id: number
  /** Calle y altura; si la propiedad no tiene dirección cargada, el barrio. */
  direccion: string
  /** "Barrio, Ciudad" — sin repetir lo que ya diga la dirección. */
  ubicacion: string
  barrio: string | null
  ciudad: string | null
  tipoId: number | null
  foto: string | null
  /** null → "Consultar" (web_price false o sin monto cargado) */
  precio: number | null
  moneda: string | null
  dormitorios: number
  banos: number
  superficie: number | null
  cocheras: number
  referencia: string
}

// ── Barrio y ciudad de verdad ───────────────────────────────────────────────
// formatLocation() (lib/tokko) devuelve las dos últimas partes del path de
// Tokko, que según cómo se cargó la propiedad son "ciudad, departamento"
// ("Roldan, San Lorenzo") o "ciudad, provincia" ("Roldán, Santa Fe"): nunca
// barrio y ciudad. Acá resolvemos el path a mano — la última parte que sea una
// ciudad conocida del corredor manda, y lo que venga después de una ciudad es
// el barrio.

const CIUDADES: Record<string, string> = {
  roldan: 'Roldán',
  funes: 'Funes',
  rosario: 'Rosario',
  perez: 'Pérez',
  'san lorenzo': 'San Lorenzo',
  'granadero baigorria': 'Granadero Baigorria',
  ibarlucea: 'Ibarlucea',
  'villa gobernador galvez': 'Villa Gobernador Gálvez',
  'capitan bermudez': 'Capitán Bermúdez',
  'fray luis beltran': 'Fray Luis Beltrán',
  'puerto general san martin': 'Puerto General San Martín',
  'arroyo seco': 'Arroyo Seco',
  'luis palacios': 'Luis Palacios',
  carcarana: 'Carcarañá',
  zavalla: 'Zavalla',
  soldini: 'Soldini',
  alvear: 'Alvear',
  pinero: 'Piñero',
  ricardone: 'Ricardone',
  timbues: 'Timbúes',
}

// País y provincia no son ubicación útil en una lista del corredor.
const NO_ES_LUGAR = new Set(['argentina', 'santa fe', 'provincia de santa fe'])

// Barrios que en el CRM están cargados sin tilde (o con el nombre corto).
// Sólo corrige la escritura: no inventa barrios que la propiedad no tenga.
const BARRIOS_CANONICOS: Record<string, string> = {
  'san sebastian': 'San Sebastián',
  'tierra de suenos': 'Tierra de Sueños',
  'tierra de suenos 1': 'Tierra de Sueños 1',
  'tierra de suenos 2': 'Tierra de Sueños 2',
  'tierra de suenos 3': 'Tierra de Sueños 3',
  'area industrial roldan': 'Área Industrial Roldán',
  'el charquito': 'El Charquito',
  'funes hills san marino': 'Funes Hills San Marino',
  'funes hills cadaques': 'Funes Hills Cadaqués',
}

// Barrios genéricos: sirven como dato de ubicación, no como título de la fila.
const BARRIOS_GENERICOS = new Set([
  'centro',
  'microcentro',
  'macrocentro',
  'zona norte',
  'zona sur',
  'zona oeste',
  'zona centro',
])

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolverUbicacion(p: TokkoProperty): {
  barrio: string | null
  ciudad: string | null
} {
  const loc = p.location
  const path = loc?.full_location || loc?.short_location || loc?.name || ''
  const partes: string[] = []
  for (const parte of path.split('|').map((s) => s.trim())) {
    if (!parte || NO_ES_LUGAR.has(norm(parte))) continue
    // "Santa Fe | Rosario | Rosario" → una sola Rosario.
    if (partes.length && norm(partes[partes.length - 1]) === norm(parte)) continue
    partes.push(parte)
  }
  if (!partes.length) return { barrio: null, ciudad: null }

  const ultima = partes[partes.length - 1]
  const ciudadUltima = CIUDADES[norm(ultima)]
  // La última parte ya es una ciudad → no hay barrio cargado, y lo anterior es
  // el departamento ("San Lorenzo" en "Santa Fe | San Lorenzo | Roldan").
  if (ciudadUltima) return { barrio: null, ciudad: ciudadUltima }

  const anterior = partes.length > 1 ? partes[partes.length - 2] : null
  const ciudad = anterior ? CIUDADES[norm(anterior)] ?? anterior : null
  return { barrio: BARRIOS_CANONICOS[norm(ultima)] ?? ultima, ciudad }
}

// Saca de la dirección los segmentos que sólo repiten el barrio o la ciudad,
// que van en la línea de abajo: "Catamarca 755 - PA /Roldán" → "Catamarca 755
// - PA"; "Acequias del Aire, Roldán" → "" (la fila se titula con el barrio).
function calleSola(direccion: string, barrio: string | null, ciudad: string | null): string {
  const lugares = [barrio, ciudad].filter((v): v is string => !!v).map(norm)
  // Separadores capturados (índices impares) para rearmar la dirección tal
  // como se cargó en el CRM.
  const tokens = direccion.split(/(\s*[,/|]\s*|\s+[-–—]\s+)/)
  let out = ''
  for (let i = 0; i < tokens.length; i += 2) {
    const seg = (tokens[i] ?? '').trim()
    if (!seg || lugares.includes(norm(seg))) continue
    out = out ? `${out}${tokens[i - 1] ?? ' - '}${seg}` : seg
  }
  const limpia = out.replace(/[\s,\-–—/|]+$/, '').trim()
  // Misma escritura que el barrio cuando la dirección ES el barrio ("Area
  // Industrial Roldán" y "Área Industrial Roldán" no pueden convivir).
  return BARRIOS_CANONICOS[norm(limpia)] ?? limpia
}

// Precio de la operación de ALQUILER específicamente — no operacionPrincipal,
// que en una propiedad publicada en venta Y alquiler puede elegir la venta.
export function proyectarAlquiler(p: TokkoProperty): AlquilerItem | null {
  const op = (p.operations ?? []).find((o) => o.operation_type === 'Rent')
  if (!op) return null
  const pr = op.prices?.[0]
  const conPrecio = p.web_price !== false && !!pr?.price

  const { barrio, ciudad } = resolverUbicacion(p)
  const calle = calleSola(p.address || '', barrio, ciudad)
  // Sin calle, el barrio titula la fila (salvo que sea genérico: "Centro" solo
  // no identifica nada, ahí manda el título de publicación).
  const barrioTitulable = barrio && !BARRIOS_GENERICOS.has(norm(barrio)) ? barrio : null
  const direccion = calle || barrioTitulable || p.publication_title || ciudad || ''
  // Barrio y ciudad van siempre; sólo se omite la parte que ya ES el título de
  // la fila (p. ej. la fila titulada "Tierra de Sueños 1" no lo repite abajo).
  const ubicacion = [barrio, ciudad]
    .filter((v): v is string => !!v && norm(v) !== norm(direccion))
    .join(', ')

  return {
    id: p.id,
    direccion,
    ubicacion,
    barrio,
    ciudad,
    tipoId: p.type?.id ?? null,
    foto: getMainPhoto(p),
    precio: conPrecio ? pr.price : null,
    moneda: conPrecio ? pr.currency : null,
    dormitorios: Number(p.suite_amount) || 0,
    banos: Number(p.bathroom_amount) || 0,
    superficie: getTotalSurface(p),
    cocheras: (Number(p.parking_lot_amount) || 0) + (Number(p.covered_parking_lot) || 0),
    referencia: p.reference_code || String(p.id),
  }
}

// Grupos por type.id de Tokko (ver PROPERTY_TYPE_LABELS / TYPE_FILTER_GROUPS
// en lib/tokko.ts — agrupar por id, nunca por substring del nombre).
const GRUPOS: { label: string; ids: number[] }[] = [
  { label: 'Casas', ids: [3, 4, 13] },
  { label: 'Departamentos', ids: [2] },
  { label: 'Locales y oficinas', ids: [5, 7] },
  { label: 'Galpones y depósitos', ids: [12, 14, 24] },
  { label: 'Cocheras', ids: [10] },
  { label: 'Terrenos y campos', ids: [1, 9] },
]

const ES_VIVIENDA = new Set([2, 3, 4, 13])

// Dentro de cada grupo: ARS primero (más chico a más grande), después USD,
// y al final las que van sin precio publicado ("Consultar").
function ordenPrecio(a: AlquilerItem, b: AlquilerItem): number {
  const rank = (i: AlquilerItem) => (i.precio ? (i.moneda === 'USD' ? 1 : 0) : 2)
  return rank(a) - rank(b) || (a.precio ?? Infinity) - (b.precio ?? Infinity)
}

export function agruparAlquileres(
  items: AlquilerItem[],
): { label: string; items: AlquilerItem[] }[] {
  const usados = new Set<number>()
  const secciones: { label: string; items: AlquilerItem[] }[] = []
  for (const g of GRUPOS) {
    const grupo = items.filter((i) => g.ids.includes(i.tipoId ?? -1))
    grupo.forEach((i) => usados.add(i.id))
    if (grupo.length) secciones.push({ label: g.label, items: grupo.sort(ordenPrecio) })
  }
  const otros = items.filter((i) => !usados.has(i.id))
  if (otros.length) secciones.push({ label: 'Otros', items: otros.sort(ordenPrecio) })
  return secciones
}

export function precioListado(item: AlquilerItem): { main: string; sub: string } {
  if (!item.precio) return { main: 'Consultar', sub: '' }
  const n = item.precio.toLocaleString('es-AR')
  return item.moneda === 'USD'
    ? { main: `USD ${n}`, sub: 'por mes' }
    : { main: `$ ${n}`, sub: 'por mes' }
}

export function caracteristicasListado(item: AlquilerItem): string {
  const out: string[] = []
  if (ES_VIVIENDA.has(item.tipoId ?? -1)) {
    if (item.tipoId === 2 && item.dormitorios === 0) out.push('Monoambiente')
    else if (item.dormitorios > 0) out.push(`${item.dormitorios} dorm.`)
  }
  if (item.banos > 0) out.push(`${item.banos} baño${item.banos > 1 ? 's' : ''}`)
  if (item.superficie) out.push(`${Math.round(item.superficie).toLocaleString('es-AR')} m²`)
  if (item.cocheras > 0) out.push('cochera')
  return out.join('  ·  ')
}

export function fechaListadoAR(): string {
  return new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  })
}

// "Agosto 2026" — para el label del botón de descarga y el filename del PDF.
export function mesAnioAR(): string {
  const s = new Date().toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  })
  const limpio = s.replace(' de ', ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}
