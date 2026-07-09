// Extracción de un aviso de MercadoLibre → ficha propia de verficha.casa.
//
// ML cerró su API pública (búsqueda y páginas requieren OAuth / son JS-render con
// anti-bot). La vía confiable es su API de items CON token: del link que pega el
// agente sacamos el ID (MLA########) y consultamos /items/{id}. El token es el
// mismo de la app de ML del CRM — se pasa por env (MELI_ACCESS_TOKEN).
//
// Best-effort: si no hay token o la API falla, devolvemos null y el caller cae a
// la carga manual (que funciona para cualquier portal).

import type { FichaExternaInput } from './ficha'

export type MercadolibreParsed = FichaExternaInput & { cocheras: number | null }

const API = 'https://api.mercadolibre.com'

export function isMercadolibreUrl(url: string): boolean {
  try {
    return /(^|\.)mercadolibre\.com(\.ar)?$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

/** Saca el ID del aviso (MLA########) del link pegado. */
export function extraerItemId(url: string): string | null {
  const normalized = decodeURIComponent(url)
  const m = /\bMLA-?(\d{6,})\b/i.exec(normalized)
  if (m) return `MLA${m[1]}`

  const compact = /\b(\d{9,})\b/.exec(normalized)
  return compact ? `MLA${compact[1]}` : null
}

type MlAttr = { id: string; value_name?: string | null; value_struct?: { number?: number | null } | null }
type MlItem = {
  title?: string
  price?: number | null
  currency_id?: string | null
  pictures?: { secure_url?: string; url?: string }[]
  attributes?: MlAttr[]
  location?: {
    neighborhood?: { name?: string }
    city?: { name?: string }
    state?: { name?: string }
    latitude?: number | null
    longitude?: number | null
  }
  seller_address?: { latitude?: number | null; longitude?: number | null }
}

function attrNum(attrs: MlAttr[], ...ids: string[]): number | null {
  for (const id of ids) {
    const a = attrs.find((x) => x.id === id)
    const n = a?.value_struct?.number ?? (a?.value_name ? parseInt(a.value_name.replace(/[^\d]/g, ''), 10) : NaN)
    if (Number.isFinite(n) && (n as number) > 0) return n as number
  }
  return null
}
function attrStr(attrs: MlAttr[], id: string): string | null {
  return attrs.find((x) => x.id === id)?.value_name?.trim() || null
}

export async function fetchMercadolibre(url: string): Promise<MercadolibreParsed | null> {
  const id = extraerItemId(url)
  if (!id) return null

  const token = process.env.MELI_ACCESS_TOKEN || process.env.ML_ACCESS_TOKEN || ''
  let item: MlItem
  try {
    const res = await fetch(`${API}/items/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null // 401/403 sin token, o 404 → cae a manual
    item = (await res.json()) as MlItem
  } catch {
    return null
  }

  const attrs = item.attributes ?? []
  const tipoRaw = (attrStr(attrs, 'PROPERTY_TYPE') || '').toLowerCase()
  const tipo =
    /departamento|depto/.test(tipoRaw) ? 'Departamento'
      : /ph/.test(tipoRaw) ? 'PH'
        : /terreno|lote/.test(tipoRaw) ? 'Terreno'
          : /local/.test(tipoRaw) ? 'Local'
            : /oficina/.test(tipoRaw) ? 'Oficina'
              : /galp/.test(tipoRaw) ? 'Galpón'
                : /quinta|country/.test(tipoRaw) ? 'Casa quinta'
                  : /casa/.test(tipoRaw) ? 'Casa'
                    : (attrStr(attrs, 'PROPERTY_TYPE') || 'Propiedad')

  const opRaw = (attrStr(attrs, 'OPERATION') || '').toLowerCase()
  const operacion = /alquiler\s*temporal/.test(opRaw) ? 'Alquiler temporario' : /alquiler|renta/.test(opRaw) ? 'Alquiler' : 'Venta'

  const zona = item.location?.neighborhood?.name || item.location?.city?.name || item.location?.state?.name || ''
  const lat = item.location?.latitude ?? item.seller_address?.latitude ?? null
  const lng = item.location?.longitude ?? item.seller_address?.longitude ?? null

  const fotos = (item.pictures ?? [])
    .map((p) => p.secure_url || p.url || '')
    .filter((u) => /^https:\/\//i.test(u))
    .slice(0, 20)

  return {
    titulo: (item.title || '').slice(0, 200),
    descripcion: '',
    fotos,
    operacion,
    tipo,
    precioRaw: typeof item.price === 'number' && item.price > 0 ? item.price : 0,
    moneda: item.currency_id === 'USD' ? 'USD' : 'ARS',
    zona,
    m2cubiertos: attrNum(attrs, 'COVERED_AREA'),
    m2terreno: attrNum(attrs, 'TOTAL_AREA', 'LAND_AREA'),
    ambientes: attrNum(attrs, 'ROOMS'),
    dormitorios: attrNum(attrs, 'BEDROOMS'),
    banos: attrNum(attrs, 'FULL_BATHROOMS', 'BATHROOMS'),
    cocheras: attrNum(attrs, 'PARKING_LOTS'),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  }
}
