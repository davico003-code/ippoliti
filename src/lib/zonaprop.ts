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

function num(v: string | undefined | null): number | null {
  if (!v) return null
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function fetchZonaprop(url: string): Promise<ZonapropParsed | null> {
  const api =
    `${MICROLINK}?url=${encodeURIComponent(url)}` +
    `&meta=true&data.body.selector=body&data.body.type=text`

  let json: { status?: string; data?: { body?: string; title?: string } }
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
  const titulo = cleanTitle(rawTitle)
  const operacion = /\balquiler\s+temporario\b/i.test(rawTitle)
    ? 'Alquiler temporario'
    : /\balquiler\b/i.test(rawTitle)
      ? 'Alquiler'
      : 'Venta'

  // ── Specs desde la línea resumen "Casa · 128m² · 4 ambientes · 2 cocheras" ──
  const spec = /([A-Za-zÁ-úñ]+)\s·\s(\d+)\s?m²\s·\s(\d+)\s*ambientes(?:\s·\s(\d+)\s*cocheras)?/i.exec(body)
  const tipo = spec?.[1]?.trim() || (rawTitle.split(/\s+/)[0] || 'Propiedad')
  const m2cubiertos = num(spec?.[2])
  const ambientes = num(spec?.[3])
  const cocheras = num(spec?.[4])

  // zona: lo que sigue a " en " en el título, hasta el primer "-" o ","
  const zonaM = /\ben\s+([^-,–]+)/i.exec(titulo)
  const zona = (zonaM?.[1] || '').trim()

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

  // ── Descripción (contenedor section-description) ──
  const descM = /class="section-description">([\s\S]*?)<\/section>/i.exec(body)
  const descripcion = descM ? stripHtml(descM[1]) : ''

  // ── Fotos (todas, 1200×1200, dedup, en orden) ──
  const fotos: string[] = []
  const reFoto = /"url1200x1200":"(https:\/\/imgar\.zonapropcdn\.com[^"]+\.jpg)/g
  let mf: RegExpExecArray | null
  while ((mf = reFoto.exec(body))) {
    const u = mf[1].replace(/\?.*$/, '')
    if (!fotos.includes(u)) fotos.push(u)
  }

  // Sin título Y sin fotos Y sin precio ⇒ no parseamos nada útil.
  if (!titulo && !fotos.length && !precioRaw) return null

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
  }
}
