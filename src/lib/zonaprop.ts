// Extracción automática de un aviso de Zonaprop.
//
// Zonaprop está detrás de Cloudflare ("Just a moment…"): un fetch directo desde
// server da 403. Microlink (navegador headless) SÍ pasa el challenge, así que le
// pedimos el body renderizado completo y parseamos de ahí — precio, fotos, specs
// y descripción vienen en el HTML/JSON embebido del aviso.
//
// Es parsing por regex sobre markup de un tercero: si Zonaprop cambia su
// estructura puede romperse. Por eso fetchZonaprop() devuelve null ante cualquier
// duda y el caller decide el fallback (reintentar / carga manual).

import type { FichaExternaInput } from './ficha'

const MICROLINK = 'https://api.microlink.io'

export type ZonapropParsed = FichaExternaInput & { cocheras: number | null }

export function isZonapropUrl(url: string): boolean {
  try {
    return /(^|\.)zonaprop\.com\.ar$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

function stripHtml(s: string): string {
  return (s || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Quita el portal y la provincia del título: "Casa Venta 3 Dorm. en Funes - Club
// de Campo Haras de Funes, Santa Fe - Zonaprop" → limpio.
function cleanTitle(t: string): string {
  return (t || '')
    .replace(/\s*[-|]\s*Zonaprop\s*$/i, '')
    .replace(/,?\s*Santa Fe\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isGenericListingTitle(t: string): boolean {
  return /propiedades e inmuebles en argentina/i.test(t) ||
    /inmuebles en argentina/i.test(t) ||
    /^\s*\d[\d.]*\s+propiedades/i.test(t)
}

function num(v: string | undefined | null): number | null {
  if (!v) return null
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function fetchZonaprop(url: string): Promise<ZonapropParsed | null> {
  const api =
    `${MICROLINK}?url=${encodeURIComponent(url)}` +
    `&meta=true&data.body.selector=body&data.body.type=text`

  let json: { status?: string; data?: { body?: string; title?: string; description?: string } }
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(45000) })
    if (!res.ok) return null
    json = await res.json()
  } catch {
    return null
  }
  if (json.status !== 'success') return null

  const body = json.data?.body || ''
  // Body chico ⇒ Cloudflare nos devolvió la página de challenge, no el aviso.
  if (body.length < 2000) return null

  // ── Título / operación / tipo / zona (desde el meta title) ──
  const rawTitle = json.data?.title || ''
  if (isGenericListingTitle(rawTitle)) return null
  const titulo = cleanTitle(rawTitle)
  const operacion = /\balquiler\s+temporario\b/i.test(rawTitle)
    ? 'Alquiler temporario'
    : /\balquiler\b/i.test(rawTitle)
      ? 'Alquiler'
      : 'Venta'

  // ── Tipo: detectado por palabra clave (NO la primera palabra del título, que
  // suele ser la operación). Sirve para casa, depto, terreno, lote, etc. ──
  const TIPO_RE = /\b(casas?|departamentos?|ph|lotes?|terrenos?|locales?|local|oficinas?|quintas?|galp[oó]n|campos?|cocheras?|dep[oó]sitos?|chalets?|d[uú]plex|tríplex|cabañas?|fondo de comercio)\b/i
  const tm = TIPO_RE.exec(rawTitle) || TIPO_RE.exec(body)
  let tipo = 'Propiedad'
  if (tm) {
    const raw = tm[1].toLowerCase()
    tipo = /galp/.test(raw) ? 'Galpón'
      : /dep[oó]sito/.test(raw) ? 'Depósito'
      : /d[uú]plex/.test(raw) ? 'Dúplex'
      : /terreno|lote/.test(raw) ? 'Terreno'
      : /departamento/.test(raw) ? 'Departamento'
      : raw.replace(/s$/, '').replace(/^\w/, c => c.toUpperCase())
  }

  // ── Specs (línea resumen "… · 128m² · 4 ambientes · 2 cocheras" + fallbacks) ──
  const spec = /·\s*(\d+)\s?m²\s*·\s*(\d+)\s*ambientes(?:\s*·\s*(\d+)\s*cocheras)?/i.exec(body)
  const m2cubiertos =
    num(spec?.[1]) ?? num(/(\d+)\s*m²?\s*cubiert/i.exec(body)?.[1])
  const ambientes = num(spec?.[2]) ?? num(/(\d+)\s*ambiente/i.exec(body)?.[1])
  const cocheras = num(spec?.[3]) ?? num(/(\d+)\s*cochera/i.exec(body)?.[1])

  // zona: el ÚLTIMO "… en X" del título (evita "en Alquiler/Venta"), recortado
  // al primer separador. Si no hay "en", la palabra que sigue al tipo.
  const enParts = titulo.split(/\s+en\s+/i)
  let zona = enParts.length > 1 ? enParts[enParts.length - 1].split(/[-,–|]/)[0].trim() : ''
  if (!zona && tm) {
    const after = titulo.slice(titulo.toLowerCase().indexOf(tm[1].toLowerCase()) + tm[1].length).trim()
    zona = (after.match(/^[A-Za-zÁ-úñ]+/)?.[0] || '').trim()
  }

  // ── Precio (JSON embebido confiable) ──
  let precioRaw = 0
  let moneda = 'USD'
  const pj =
    /"currency":"(USD|ARS|U\$S|\$)","amount":(\d{3,})/.exec(body) ||
    /"amount":(\d{3,}),"currency":"(USD|ARS|U\$S|\$)"/.exec(body)
  if (pj) {
    const a = /^\d+$/.test(pj[1]) ? pj[1] : pj[2]
    const c = /^\d+$/.test(pj[1]) ? pj[2] : pj[1]
    precioRaw = num(a) || 0
    moneda = c === 'ARS' ? 'ARS' : 'USD'
  } else {
    const pt = /\b(USD|U\$S|ARS)\s?([\d.]{4,})/.exec(body)
    if (pt) { precioRaw = num(pt[2]) || 0; moneda = pt[1] === 'ARS' ? 'ARS' : 'USD' }
  }

  // ── Dormitorios / baños ──
  const dorm = /(\d+)\s*dormitorio/i.exec(body)
  const banos = /(\d+)\s*bañ?o/i.exec(body)

  // ── Terreno (de la descripción) ──
  const terr = /terreno de\s*([\d.]+)\s*m/i.exec(body) || /([\d.]+)\s*m²?\s*de\s*terreno/i.exec(body)

  // ── Descripción (contenedor section-description; fallback al meta de Microlink) ──
  const descM = /class="section-description">([\s\S]*?)<\/section>/i.exec(body)
  let descripcion = descM ? stripHtml(descM[1]) : ''
  if (descripcion.length < 40) {
    descripcion = stripHtml((json.data?.description || '').replace(/\.{2,}\s*Zona\s*\d+\s*$/i, ''))
  }

  // ── Fotos (todas, 1200×1200, dedup, en orden) ──
  const fotos: string[] = []
  const reFoto = /"url1200x1200":"(https:\/\/imgar\.zonapropcdn\.com[^"]+\.jpg)/g
  let mf: RegExpExecArray | null
  while ((mf = reFoto.exec(body))) {
    const u = mf[1].replace(/\?.*$/, '')
    if (!fotos.includes(u)) fotos.push(u)
  }

  // Sin datos de aviso, o si Microlink cayó en una página genérica/listado,
  // devolvemos null para abrir carga manual y no mintear una ficha basura.
  if ((!titulo && !fotos.length && !precioRaw) || (isGenericListingTitle(titulo) && !fotos.length)) return null

  return {
    titulo,
    descripcion,
    fotos: fotos.slice(0, 20),
    operacion,
    tipo,
    precioRaw,
    moneda,
    zona,
    m2cubiertos,
    m2terreno: num(terr?.[1]),
    ambientes,
    dormitorios: num(dorm?.[1]),
    banos: num(banos?.[1]),
    cocheras,
    caracteristicas: [
      ambientes ? `${ambientes} ambientes` : '',
      m2cubiertos ? `${m2cubiertos} m² cubiertos` : '',
      num(terr?.[1]) ? `${num(terr?.[1])} m² terreno` : '',
      num(dorm?.[1]) ? `${num(dorm?.[1])} dormitorios` : '',
      num(banos?.[1]) ? `${num(banos?.[1])} baños` : '',
      cocheras ? `${cocheras} cocheras` : '',
    ].filter(Boolean),
  }
}
