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
const MICROLINK = 'https://api.microlink.io'

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

function metaContent(html: string, key: 'name' | 'property', value: string): string {
  const re = new RegExp(`<meta(?=[^>]*\\b${key}=["']${value}["'])(?=[^>]*\\bcontent=["']([^"']*)["'])[^>]*>`, 'i')
  const m = re.exec(html)
  return decodeEntities(m?.[1] || '')
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
  const blocks = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi))
  for (const m of blocks) {
    try {
      const parsed = JSON.parse(m[1].trim())
      const nodes = Array.isArray(parsed) ? parsed : [parsed]
      const node = nodes.find((n) => n?.address || n?.numberOfRooms || n?.numberOfBedrooms || n?.floorSize)
      if (node) return node as JsonLd
    } catch {
      // probamos el siguiente bloque
    }
  }
  return null
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
  const rawTitle = decodeEntities(/<title>([^<]+)<\/title>/i.exec(html)?.[1] ?? '') ||
    metaContent(html, 'property', 'og:title')
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

  const visibleAddress = stripHtml(/class="titlebar__address"[^>]*>([\s\S]*?)<\/h2>/i.exec(html)?.[1] || '')
  const visibleTitle = stripHtml(/class="titlebar__title"[^>]*>([\s\S]*?)<\/h2>/i.exec(html)?.[1] || '')
  const keywords = metaContent(html, 'name', 'keywords')
  const metaDesc = metaContent(html, 'name', 'description')
  const kwParts = keywords.split(',').map(s => s.trim()).filter(Boolean)
  const keywordTipo = kwParts[1] || ''
  const keywordOperacion = kwParts[2] || ''
  const keywordZona = kwParts[3] || ''
  const featureSource = `${html} ${keywords} ${rawTitle}`
  const m2Total =
    num(/([\d.]+)\s*m[²2]?\s*total/i.exec(featureSource)?.[1]) ??
    num(/([\d.]+)\s*m[²2]?\s*terreno/i.exec(featureSource)?.[1])
  const m2Construible = num(/([\d.]+)\s*m[²2]?\s*construible/i.exec(featureSource)?.[1])

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
  let zona = region || keywordZona
  if (!zona) {
    const enParts = (visibleTitle || nombre || rawTitle).split(/\s+en\s+/i)
    zona = enParts.length > 1 ? enParts[enParts.length - 1].split(/[-,–|]/)[0].trim() : ''
  }
  // query de geocoding: dirección de calle (más precisa) + zona + Argentina.
  const geoQuery =
    [calle, region, /argentina/i.test(locality) ? locality : `${locality} Argentina`]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ') || (zona ? `${zona}, Argentina` : null)

  // ── Descripción (JSON-LD o meta) ──
  const visibleDesc = stripHtml(
    /<section[^>]*class="[^"]*\bsection-description\b[^"]*"[\s\S]*?<div[^>]*class="[^"]*section-description__content[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html)?.[1] ||
    /<section[^>]*class="[^"]*\bsection-description\b[^"]*"[\s\S]*?<div[^>]*class="[^"]*section-description--content[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html)?.[1] ||
    /<section[^>]*class="[^"]*\bsection-description\b[^"]*"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1] ||
    '',
  )
  const descripcion = stripHtml(ld?.description || visibleDesc || metaDesc || '')

  // ── Fotos: usar la URL REAL que trae Argenprop. Antes reconstruíamos
  // /static-content/<id>/<uuid>.jpg y eso rompe con IDs tipo "890082_a" y
  // variantes actuales "_u_medium.jpg". Priorizamos medium/large del aviso y
  // descartamos thumbnails relacionados si ya tenemos galería principal.
  const fotosRaw = Array.from(html.matchAll(/(?:https?:\/\/www\.argenprop\.com)?\/static-content\/[A-Za-z0-9_-]+\/[a-f0-9-]{36}(?:_[a-z]+)?(?:_(?:small|medium|large))?\.jpe?g/gi))
    .map(m => m[0].startsWith('http') ? m[0] : `${BASE}${m[0]}`)
  const hasUsefulSizes = fotosRaw.some(u => /_(?:medium|large)\.jpe?g/i.test(u))
  const fotos: string[] = []
  for (const raw of fotosRaw) {
    const u = raw.replace(/_small\.jpe?g$/i, '_medium.jpg')
    if (hasUsefulSizes && /_small\.jpe?g/i.test(raw)) continue
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
      tipo: tipo === 'Propiedad' && keywordTipo ? keywordTipo : tipo,
      precioRaw,
      moneda,
      zona,
      direccion: visibleAddress || calle,
      m2cubiertos,
      m2terreno: m2terreno ?? m2Total,
      ambientes,
      dormitorios,
      banos,
      cocheras,
      caracteristicas: [
        m2terreno ?? m2Total ? `${m2terreno ?? m2Total} m² total` : '',
        m2cubiertos ? `${m2cubiertos} m² cubiertos` : '',
        m2Construible ? `${m2Construible} m² construible` : '',
        ambientes ? `${ambientes} ambientes` : '',
        dormitorios ? `${dormitorios} dormitorios` : '',
        banos ? `${banos} baños` : '',
        keywordOperacion || operacion,
        cocheras ? `${cocheras} cocheras` : '',
      ].filter(Boolean),
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
    html = res.status === 200 ? await res.text() : ''
  } catch {
    html = ''
  }

  // Fallback best-effort: a veces Microlink logra traer el body aunque el fetch
  // directo sea bloqueado. Si también recibe el challenge, el guard positivo
  // de abajo lo descarta.
  if (!/application\/ld\+json/.test(html) && !/\/static-content\/\d+\//.test(html)) {
    try {
      const api =
        `${MICROLINK}?url=${encodeURIComponent(url)}` +
        `&meta=true&data.body.selector=body&data.body.type=text`
      const res = await fetch(api, { signal: AbortSignal.timeout(45000) })
      if (res.ok) {
        const json = await res.json() as { status?: string; data?: { body?: string } }
        if (json.status === 'success') html = json.data?.body || ''
      }
    } catch {
      // cae al guard positivo de abajo
    }
  }

  // Guard positivo: la página real trae JSON-LD y fotos en /static-content. Si no
  // están, es un challenge/página vacía de CloudFront → degradamos a carga manual.
  if (!/application\/ld\+json/.test(html) && !/\/static-content\/\d+\//.test(html)) return null

  const parsed = parseArgenprop(html, url)
  if (!parsed) return null

  return parsed.data
}
