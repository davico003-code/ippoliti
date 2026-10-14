import { fetchZonaprop } from '@/lib/zonaprop'
import { origenDeUrl } from './origen-url'

// COPIA del lector de Hilo (si-crm/src/lib/importar/aviso-externo.ts, 12-oct-2026),
// con UN arreglo propio: los decimales con punto de Tokko (ver `numero`). Si allá
// se arregla algo del parseo de ficha.info, traer el arreglo acá. La Ronda solo
// usa la rama de Tokko: los avisos de Zonaprop se leen en aviso.ts.

/**
 * Lee un aviso EXTERNO desde su link — la ficha pública de Tokko (ficha.info)
 * o un aviso de Zonaprop — y lo normaliza para cargarlo en Hilo como propiedad
 * "para compartir" (David, 10-sep: "le cargamos el link y listo").
 *
 *  - Tokko: ficha.info es una app Next que trae la propiedad EMBEBIDA en el
 *    payload RSC (self.__next_f), con el mismo shape que su API: tipo,
 *    operaciones, ubicación, basic_info, fotos y el agente que la publica. Un
 *    fetch server-side con UA de navegador alcanza (no hay Cloudflare).
 *  - Zonaprop: reusa fetchZonaprop (Microlink, pasa el challenge de Cloudflare).
 *
 * Parsing de markup de terceros: ante cualquier duda tira un Error con un
 * mensaje para el agente, nunca inventa datos.
 */

export type AvisoImportado = {
  origen: 'tokko' | 'zonaprop'
  url: string
  titulo: string
  descripcion: string | null
  property_type: 'house' | 'apartment' | 'lot' | 'commercial' | 'country_house' | 'office' | 'warehouse' | 'garage' | 'ph'
  operacion: 'sale' | 'rent' | 'temporary_rent'
  precio: number | null
  moneda: 'USD' | 'ARS'
  provincia: string | null
  ciudad: string | null
  barrio: string | null
  direccion: string | null
  direccionPublica: string | null
  lat: number | null
  lng: number | null
  ambientes: number | null
  dormitorios: number | null
  banos: number | null
  toilettes: number | null
  cocheras: number | null
  m2Cubiertos: number | null
  m2Semicubiertos: number | null
  m2Terreno: number | null
  m2Total: number | null
  frente: number | null
  fondo: number | null
  antiguedad: number | null
  orientacion: string | null
  /** Estado / condición ("Excelente", "A refaccionar"…). */
  estado: string | null
  tags: string[]
  fotos: string[]
  referencia: string | null
  /** Quien publica el aviso (en Tokko, el agente del colega). */
  contactoSugerido: { nombre: string; telefono: string | null } | null
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

// La detección vive aparte (sin red ni server-only) para que el navegador
// pueda avisar al pegar el link si es de Zonaprop o de Tokko.
export { esFichaTokko, origenDeUrl } from './origen-url'

export async function leerAvisoExterno(url: string): Promise<AvisoImportado> {
  const origen = origenDeUrl(url)
  if (origen === 'tokko') return leerFichaTokko(url)
  if (origen === 'zonaprop') return leerZonaprop(url)
  throw new Error('Pegá el link de la ficha de Tokko (ficha.info/p/…) o del aviso de Zonaprop.')
}

// ─── helpers ────────────────────────────────────────────────────────────

/** "150 m²", "1.234,5", 3 → número (o null). */
function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : null
  if (typeof v !== 'string') return null
  // Tokko escribe los decimales con punto ("279.96 m² cubierta"): un punto con 1
  // o 2 cifras atrás es decimal; con 3, separador de miles. (Sin esto, 279.96 m²
  // salían como 27.996 m². En Hilo el lector original todavía lo tiene.)
  const decimalConPunto = /\d\.\d{1,2}(?!\d)/.test(v) && !v.includes(',')
  const m = (decimalConPunto ? v : v.replace(/\./g, '').replace(',', '.')).match(/\d+(\.\d+)?/)
  const n = m ? Number(m[0]) : NaN
  return Number.isFinite(n) && n > 0 ? n : null
}

const entero = (v: unknown) => {
  const n = numero(v)
  return n == null ? null : Math.round(n)
}

/** Superficie en m². Tokko escribe los campos grandes en hectáreas ("16 ha terreno"):
 *  tomar el 16 como m² dejaba un campo de 16 m² (visto en una ficha real, 10-sep). */
function superficie(v: unknown): number | null {
  const n = numero(v)
  if (n == null) return null
  return typeof v === 'string' && /\d\s*(ha\b|hect)/i.test(v) ? n * 10000 : n
}

function textoPlano(html: string | null | undefined): string | null {
  const t = (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    // Negritas markdown del texto del colega ("**espacios amplios**"): en la
    // ficha neutra se veían los asteriscos.
    .replace(/\*\*/g, '')
    // Emojis que Tokko guardó rotos ("???? AMPLITUD…") al comienzo de una línea.
    .replace(/(^|\n)[ \t]*\?{2,}[ \t]*/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return t || null
}

/** Nombre de tipo (Tokko/Zonaprop) → property_type de Hilo. */
function tipoDe(nombre: string): AvisoImportado['property_type'] {
  const t = nombre.toLowerCase()
  if (/\bph\b/.test(t)) return 'ph'
  if (/depart|monoamb|d[uú]plex|loft/.test(t)) return 'apartment'
  // "Campo"/"Chacra" van como quinta (country_house), igual que el import de Tokko de siempre.
  if (/quinta|campo|chacra/.test(t)) return 'country_house'
  if (/terreno|lote/.test(t)) return 'lot'
  if (/oficina/.test(t)) return 'office'
  if (/galp[oó]n|dep[oó]sito|nave|bodega/.test(t)) return 'warehouse'
  if (/cochera|garage/.test(t)) return 'garage'
  if (/local|comercio|comercial|edificio/.test(t)) return 'commercial'
  return 'house'
}

/** "USD 130.000" / "$$ 500.000" → { precio, moneda }. */
function precioDe(raw: string | null | undefined): { precio: number | null; moneda: 'USD' | 'ARS' } {
  const s = raw ?? ''
  const moneda = /u\$s|us\$|usd|d[oó]lar/i.test(s) ? 'USD' : 'ARS'
  const n = Number(s.replace(/[^\d]/g, ''))
  return { precio: Number.isFinite(n) && n > 0 ? n : null, moneda }
}

/**
 * Extrae el objeto JSON que empieza en `inicio` (un '{'), respetando strings
 * y escapes — el payload RSC trae el objeto dentro de una fila más grande.
 */
function objetoJsonDesde(s: string, inicio: number): string | null {
  let prof = 0
  let enString = false
  let escape = false
  for (let i = inicio; i < s.length; i++) {
    const c = s[i]
    if (enString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') enString = false
      continue
    }
    if (c === '"') enString = true
    else if (c === '{') prof++
    else if (c === '}') {
      prof--
      if (prof === 0) return s.slice(inicio, i + 1)
    }
  }
  return null
}

// ─── Tokko (ficha.info) ─────────────────────────────────────────────────

type FichaTokko = {
  type?: { name?: string }
  operations?: Record<string, string[]>
  location?: string
  address?: string
  fake_address?: string
  geolocation?: { lat?: string | number; lng?: string | number }
  basic_info?: { key: string; name?: string; value: unknown }[]
  attributes_list?: { attr: string; value: unknown }[]
  description?: string
  pictures?: { images?: string[] }
  tags?: { name: string }[]
  reference?: string
  producer_user?: { name?: string; phone?: string; cellphone?: string } | null
  status?: { name?: string }
}

async function htmlDe(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(25000) })
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status })
    return await res.text()
  } catch (e) {
    // `status` (0 = no respondió) le dice al vigía si fue un link viejo o una caída.
    throw Object.assign(new Error('No pude abrir la ficha de Tokko. Revisá el link y probá de nuevo.'), {
      status: (e as { status?: number }).status ?? 0,
    })
  }
}

/** La propiedad embebida en el payload RSC (self.__next_f.push([1,"<string JS>"])),
 *  junto con el stream completo (lo necesitan las referencias "$17"), o null. */
function propiedadDeHtml(html: string): { p: FichaTokko; rsc: string } | null {
  const rsc = Array.from(html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g))
    .map((m) => {
      try {
        return JSON.parse(`"${m[1]}"`) as string
      } catch {
        return ''
      }
    })
    .join('')
  const i = rsc.indexOf('"property":{"id":')
  const crudo = i >= 0 ? objetoJsonDesde(rsc, i + '"property":'.length) : null
  if (!crudo) return null
  try {
    return { p: JSON.parse(crudo) as FichaTokko, rsc }
  } catch {
    return null
  }
}

/**
 * Los textos largos (la descripción) NO vienen en línea: el objeto trae una
 * referencia "$17" y el texto vive en otra fila del stream, "17:T<largo hex>,<texto>",
 * con el largo en BYTES UTF-8 (verificado con una ficha real, 10-sep).
 */
function resolverTexto(valor: unknown, rsc: string): string | null {
  if (typeof valor !== 'string') return null
  const ref = /^\$([0-9a-f]+)$/i.exec(valor)
  if (!ref) return valor
  const fila = new RegExp(`(?:^|\\n)${ref[1]}:T([0-9a-f]+),`, 'i').exec(rsc)
  if (!fila) return null
  const bytes = Buffer.from(rsc.slice(fila.index + fila[0].length), 'utf8')
  return bytes.subarray(0, parseInt(fila[1], 16)).toString('utf8')
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Localidades de la zona (y alguna capital) para desambiguar la ubicación de Tokko. */
const CIUDADES = new Map(
  [
    'Rosario', 'Funes', 'Roldán', 'San Lorenzo', 'Granadero Baigorria', 'Ibarlucea', 'Pérez',
    'Capitán Bermúdez', 'Fray Luis Beltrán', 'Puerto General San Martín', 'Villa Gobernador Gálvez',
    'Pueblo Esther', 'Arroyo Seco', 'Soldini', 'Zavalla', 'Alvear', 'Timbúes', 'Oliveros', 'Piñero',
    'Álvarez', 'Carcarañá', 'Cañada de Gómez', 'Villa Constitución', 'Coronel Arnold', 'Santa Fe',
    'Córdoba', 'Paraná', 'San Nicolás',
  ].map((c) => [sinTildes(c), c] as const),
)

/**
 * "Pichincha | Rosario | Santa Fe" (barrio de Rosario) y "Roldan | San Lorenzo |
 * Santa Fe" (ciudad + departamento) tienen la MISMA forma: la primera localidad
 * conocida es la ciudad y lo que está justo antes, el barrio.
 */
function ubicacionDe(location: string | undefined): { provincia: string | null; ciudad: string | null; barrio: string | null } {
  const partes = (location ?? '').split('|').map((s) => s.trim()).filter(Boolean)
  const provincia = partes.length > 1 ? partes[partes.length - 1] : null
  const resto = partes.length > 1 ? partes.slice(0, -1) : partes
  const idx = resto.findIndex((s) => CIUDADES.has(sinTildes(s)))
  if (idx >= 0) {
    return { provincia, ciudad: CIUDADES.get(sinTildes(resto[idx])) ?? resto[idx], barrio: idx > 0 ? resto[idx - 1] : null }
  }
  return resto.length >= 3
    ? { provincia, ciudad: resto[1], barrio: resto[0] }
    : { provincia, ciudad: resto[0] ?? null, barrio: null }
}

async function leerFichaTokko(url: string): Promise<AvisoImportado> {
  const html = await htmlDe(url)
  let ficha = propiedadDeHtml(html)
  // El link CORTO (ficha.info/p/eCsO…) no redirige por HTTP: devuelve una
  // página liviana que salta al link largo (/p/<32 hex>) desde el navegador.
  // Seguimos ese salto una sola vez.
  if (!ficha) {
    const largo = html.match(/https:\/\/ficha\.info\/p\/[0-9a-f]{32}/i)?.[0]
    if (largo && largo !== url) ficha = propiedadDeHtml(await htmlDe(largo))
  }
  if (!ficha) throw new Error('La ficha de Tokko no trae la propiedad (puede estar dada de baja).')
  const { p, rsc } = ficha

  const info = new Map<string, unknown>()
  for (const a of p.attributes_list ?? []) info.set(a.attr, a.value)
  for (const b of p.basic_info ?? []) info.set(b.key, b.value) // basic_info trae el número limpio
  const v = (k: string) => info.get(k)

  // Operación: preferimos venta si publica varias.
  const ops = Object.entries(p.operations ?? {})
  const op = ops.find(([k]) => /sale|venta/i.test(k)) ?? ops[0]
  const operacion: AvisoImportado['operacion'] = !op
    ? 'sale'
    : /temporar/i.test(op[0])
      ? 'temporary_rent'
      : /rent|alquiler/i.test(op[0])
        ? 'rent'
        : 'sale'
  const { precio, moneda } = precioDe(op?.[1]?.[0])

  const { provincia, ciudad, barrio } = ubicacionDe(p.location)
  const texto = (k: string) => {
    const x = v(k)
    return typeof x === 'string' && x.trim() ? x.trim() : null
  }

  const antig = v('age')
  const productor = p.producer_user
  return {
    origen: 'tokko',
    url,
    titulo: p.address?.trim() || p.fake_address?.trim() || '',
    descripcion: textoPlano(resolverTexto(p.description, rsc)),
    property_type: tipoDe(p.type?.name ?? ''),
    operacion,
    precio,
    moneda,
    provincia,
    ciudad,
    barrio,
    direccion: p.address?.trim() || null,
    direccionPublica: p.fake_address?.trim() || null,
    lat: numeroCoord(p.geolocation?.lat),
    lng: numeroCoord(p.geolocation?.lng),
    ambientes: entero(v('room_amount')),
    dormitorios: entero(v('suite_amount')),
    banos: entero(v('bathroom_amount')),
    toilettes: entero(v('toilet_amount')),
    cocheras: entero(v('parking_lot_amount')),
    m2Cubiertos: superficie(v('roofed_surface')),
    m2Semicubiertos: superficie(v('semiroofed_surface')),
    m2Terreno: superficie(v('surface')),
    m2Total: superficie(v('total_surface')),
    frente: numero(v('front_measure')),
    fondo: numero(v('depth_measure')),
    antiguedad: typeof antig === 'string' && /estrenar/i.test(antig) ? 0 : entero(antig),
    orientacion: texto('orientation'),
    estado: texto('property_condition'),
    tags: (p.tags ?? []).map((t) => t.name).filter(Boolean),
    fotos: (p.pictures?.images ?? []).filter((f) => /^https:\/\/static\.tokkobroker\.com\//.test(f)),
    referencia: p.reference ?? null,
    contactoSugerido: productor?.name
      ? { nombre: productor.name, telefono: productor.cellphone || productor.phone || null }
      : null,
  }
}

/** Coordenada: a diferencia de `numero`, admite negativos. */
function numeroCoord(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) && n !== 0 ? n : null
}

// ─── Zonaprop ───────────────────────────────────────────────────────────

async function leerZonaprop(url: string): Promise<AvisoImportado> {
  const z = await fetchZonaprop(url)
  if (!z) throw new Error('Zonaprop no respondió o cambió su página. Probá de nuevo en un rato.')
  const operacion: AvisoImportado['operacion'] = /temporar/i.test(z.operacion)
    ? 'temporary_rent'
    : /alquiler/i.test(z.operacion)
      ? 'rent'
      : 'sale'
  // La zona sale del título del aviso: puede arrastrar la operación
  // ("Venta Vida Club de Campo"). Si es una localidad conocida es la ciudad;
  // si no, un barrio/club (la ciudad queda para completar).
  const zona = (z.zona || '').replace(/^(venta|alquiler(\s+temporario)?)\s+/i, '').trim()
  const ciudadConocida = zona ? CIUDADES.get(sinTildes(zona)) ?? null : null
  return {
    origen: 'zonaprop',
    url,
    titulo: z.titulo,
    descripcion: z.descripcion || null,
    property_type: tipoDe(z.tipo),
    operacion,
    precio: z.precioRaw > 0 ? z.precioRaw : null,
    moneda: /usd|u\$s/i.test(z.moneda) ? 'USD' : 'ARS',
    provincia: 'Santa Fe',
    ciudad: ciudadConocida,
    barrio: ciudadConocida ? null : zona || null,
    direccion: null,
    direccionPublica: null,
    lat: null,
    lng: null,
    ambientes: z.ambientes,
    dormitorios: z.dormitorios,
    banos: z.banos,
    toilettes: null,
    cocheras: z.cocheras,
    m2Cubiertos: z.m2cubiertos,
    m2Semicubiertos: null,
    m2Terreno: z.m2terreno,
    m2Total: null,
    frente: null,
    fondo: null,
    antiguedad: null,
    orientacion: null,
    estado: null,
    tags: [],
    fotos: z.fotos.filter((f) => /^https:\/\/[a-z0-9.-]*zonapropcdn\.com\//i.test(f)),
    referencia: null,
    contactoSugerido: null,
  }
}
