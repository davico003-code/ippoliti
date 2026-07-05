// Extracción automática de un aviso de Argenprop.
//
// A diferencia de Zonaprop (que está tras Cloudflare y necesita Microlink),
// Argenprop responde bien a un fetch directo con User-Agent de navegador — y
// Microlink, al revés, es rechazado por su CDN. Así que acá fetcheamos derecho.
//
// El aviso trae un bloque JSON-LD (schema.org/House) con datos limpios
// (dormitorios, ambientes, superficie, dirección) + el título con las specs
// ("Casa 4 dorm, 270m² cub, 800m² terreno") + las fotos en /static-content.
// Argenprop NO expone lat/lng en el HTML, pero sí la dirección de calle, así que
// geocodificamos esa dirección (más preciso que la zona sola).
//
// parseArgenprop() es puro (testeable con un fixture); fetchArgenprop() agrega el
// fetch + el geocoding. Devuelven null ante cualquier duda (el caller decide el
// fallback: reintentar / carga manual).

import type { FichaExternaInput } from './ficha'
import { geocodeZona } from './geocode'

export type ArgenpropParsed = FichaExternaInput & { cocheras: number | null }

export function isArgenpropUrl(url: string): boolean {
  try {
    return /(^|\.)argenprop\.com$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
const BASE = 'https://www.argenprop.com'

function decodeEntities(s: string): string {
  return (s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
    .replace(/&Aacute;/gi, 'Á').replace(/&Eacute;/gi, 'É')
}

function stripHtml(s: string): string {
  return decodeEntities(
    (s || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function num(v: string | undefined | null): number | null {
  if (v == null) return null
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

type JsonLd = {
  name?: string
  description?: string
  numberOfRooms?: number | string
  numberOfBedrooms?: number | string
  floorSize?: { value?: number | string }
  address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string }
}

/** Extrae el bloque JSON-LD (schema.org) del aviso, si está. */
function extraerJsonLd(html: string): JsonLd | null {
  const m = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i.exec(html)
  if (!m) return null
  try {
    const parsed = JSON.parse(m[1].trim())
    const node = Array.isArray(parsed) ? parsed.find((n) => n?.address || n?.name) ?? parsed[0] : parsed
    return (node ?? null) as JsonLd | null
  } catch {
    return null
  }
}

/**
 * Parsea el HTML de un aviso de Argenprop a los campos de la ficha + una query
 * de dirección para geocodificar. PURO (sin red): testeable con un fixture.
 */
export function parseArgenprop(
  html: string,
  url: string,
): { data: ArgenpropParsed; geoQuery: string | null } | null {
  if (!html || html.length < 2000) return null
  const ld = extraerJsonLd(html)

  // ── Título (meta) con specs y nombre del JSON-LD ──
  const rawTitle = decodeEntities(/<title>([^<]+)<\/title>/i.exec(html)?.[1] ?? '')
  const nombre = decodeEntities(ld?.name ?? '')
  const base = `${nombre} ${rawTitle}`

  // Operación: del nombre/URL ("en Venta" / "en Alquiler").
  const operacion = /\balquiler\s+temporario\b/i.test(base)
    ? 'Alquiler temporario'
    : /\balquiler\b/i.test(base) || /alquiler/i.test(url)
      ? 'Alquiler'
      : 'Venta'

  // Tipo: por palabra clave en nombre/URL.
  const TIPO_RE = /\b(casas?|departamentos?|ph|lotes?|terrenos?|locales?|local|oficinas?|quintas?|galp[oó]n|campos?|cocheras?|dep[oó]sitos?|d[uú]plex|chalets?|cabañas?)\b/i
  const tm = TIPO_RE.exec(nombre) || TIPO_RE.exec(url) || TIPO_RE.exec(rawTitle)
  let tipo = 'Propiedad'
  if (tm) {
    const raw = tm[1].toLowerCase()
    tipo = /galp/.test(raw) ? 'Galpón'
      : /dep[oó]sito/.test(raw) ? 'Depósito'
      : /d[uú]plex/.test(raw) ? 'Dúplex'
      : /terreno|lote/.test(raw) ? 'Terreno'
      : /departamento/.test(raw) ? 'Departamento'
      : raw.replace(/s$/, '').replace(/^\w/, (c) => c.toUpperCase())
  }

  // ── Specs: título ("270m² cub, 800m² terreno") + JSON-LD + body ──
  const m2cubiertos =
    num(/([\d.]+)\s*m[²2]?\s*cub/i.exec(rawTitle)?.[1]) ??
    num(/([\d.]+)\s*m[²2]?\s*cubiert/i.exec(html)?.[1])
  const m2terreno =
    num(/([\d.]+)\s*m[²2]?\s*terreno/i.exec(rawTitle)?.[1]) ??
    num(ld?.floorSize?.value != null ? String(ld.floorSize.value) : null) ??
    num(/([\d.]+)\s*m[²2]?\s*(?:de\s*)?terreno/i.exec(html)?.[1])
  const dormitorios =
    num(ld?.numberOfBedrooms != null ? String(ld.numberOfBedrooms) : null) ??
    num(/(\d+)\s*dorm/i.exec(base)?.[1])
  const ambientes =
    num(ld?.numberOfRooms != null ? String(ld.numberOfRooms) : null) ??
    num(/(\d+)\s*ambiente/i.exec(html)?.[1])
  const banos = num(/(\d+)\s*ba[ñn]o/i.exec(html)?.[1])
  const cocheras = num(/(\d+)\s*cochera/i.exec(html)?.[1])

  // ── Precio (body: "USD 750.000" / "$ 350.000") ──
  let precioRaw = 0
  let moneda = 'USD'
  const pj = /"price"\s*:\s*"?(\d{4,})"?[\s\S]{0,40}?"priceCurrency"\s*:\s*"([A-Z$]{1,3})"/i.exec(html)
  if (pj) {
    precioRaw = num(pj[1]) || 0
    moneda = /ars|\$$/i.test(pj[2]) && !/usd|u\$s/i.test(pj[2]) ? 'ARS' : 'USD'
  } else {
    const pt = /\b(USD|U\$S|ARS|\$)\s?([\d.]{4,})/i.exec(html)
    if (pt) {
      precioRaw = num(pt[2]) || 0
      moneda = /ars/i.test(pt[1]) || pt[1] === '$' ? 'ARS' : 'USD'
    }
  }

  // ── Zona (barrio/localidad) + dirección para geocodificar ──
  const region = decodeEntities(ld?.address?.addressRegion ?? '') // ej "Funes"
  const locality = decodeEntities(ld?.address?.addressLocality ?? '') // ej "Rosario, Argentina"
  const calle = decodeEntities(ld?.address?.streetAddress ?? '')
    .replace(/\s+al\s+(\d+)/i, ' $1') // "Illia al 300" → "Illia 300"
    .replace(/\s{2,}/g, ' ')
    .trim()
  // zona de display: region (barrio/ciudad chica), o el "en X" del nombre.
  let zona = region
  if (!zona) {
    const enParts = nombre.split(/\s+en\s+/i)
    zona = enParts.length > 1 ? enParts[enParts.length - 1].split(/[-,–|]/)[0].trim() : ''
  }
  // query de geocoding: dirección de calle (más precisa) + zona + Argentina.
  const geoQuery =
    [calle, region, /argentina/i.test(locality) ? locality : `${locality} Argentina`]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ') || (zona ? `${zona}, Argentina` : null)

  // ── Descripción (JSON-LD o meta) ──
  const descripcion = stripHtml(
    ld?.description ||
      /<meta[^>]+name="description"[^>]+content="([^"]+)"/i.exec(html)?.[1] ||
      '',
  )

  // ── Fotos: /static-content/<listingId>/<uuid>.jpg (dedup, en orden) ──
  const fotos: string[] = []
  const reFoto = /\/static-content\/(\d+)\/([a-f0-9-]{36})/gi
  let mf: RegExpExecArray | null
  while ((mf = reFoto.exec(html))) {
    const u = `${BASE}/static-content/${mf[1]}/${mf[2]}.jpg`
    if (!fotos.includes(u)) fotos.push(u)
  }

  const titulo = decodeEntities(nombre || rawTitle)
    .replace(/\s*[-|]\s*Argenprop\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Sin título Y sin fotos Y sin precio ⇒ no parseamos nada útil.
  if (!titulo && !fotos.length && !precioRaw) return null

  return {
    data: {
      titulo,
      descripcion,
      fotos: fotos.slice(0, 20),
      operacion,
      tipo,
      precioRaw,
      moneda,
      zona,
      m2cubiertos,
      m2terreno,
      ambientes,
      dormitorios,
      banos,
      cocheras,
      lat: null,
      lng: null,
    },
    geoQuery,
  }
}

// Headers de navegador completos: Argenprop está detrás de CloudFront y sirve la
// página a requests que parecen un browser real, pero desafía (202 / body corto)
// a las que huelen a bot. Con esto maximizamos el "camino limpio"; si igual nos
// desafía, degradamos a carga manual (el route lo maneja, igual que Zonaprop).
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

export async function fetchArgenprop(url: string): Promise<ArgenpropParsed | null> {
  let html: string
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(20000) })
    // CloudFront devuelve 202/403 con un body de challenge cuando nos bloquea.
    if (res.status !== 200) return null
    html = await res.text()
  } catch {
    return null
  }
  // Guard positivo: la página real trae JSON-LD y fotos en /static-content. Si no
  // están, es un challenge/página vacía de CloudFront → degradamos a carga manual.
  if (!/application\/ld\+json/.test(html) && !/\/static-content\/\d+\//.test(html)) return null

  const parsed = parseArgenprop(html, url)
  if (!parsed) return null

  // Geocoding de la dirección de calle (Argenprop no trae lat/lng en el HTML).
  // Best-effort: si no resuelve, la ficha queda con la geocodificación de zona
  // que hace crearFichaExterna, o sin pin.
  if (parsed.geoQuery) {
    const coords = await geocodeZona(parsed.geoQuery)
    if (coords) {
      parsed.data.lat = coords.lat
      parsed.data.lng = coords.lng
    }
  }
  return parsed.data
}
