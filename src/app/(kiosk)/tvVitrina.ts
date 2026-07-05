// "Vidriera viva" — arma la secuencia CURADA de tarjetas para el kiosco vertical.
// Pisos de precio por tipo (casas ≥ USD 200k, lotes ≥ USD 40k) y un pool amplio
// para que rote mucho sin repetir. Bloques: countdown Top 5 casas de Funes, las 2
// joyas de Roldán (Cotos de la Alameda / Las Tardes), y el resto premium ordenado
// de mayor a menor precio (para que el valor baje suave, no salte). Placas
// institucionales con CTA rotando cada 2 propiedades + micro-récords entre medio.
// Cada propiedad trae su gancho: precio oculto→reveal o adiviná-el-barrio.

import QRCode from 'qrcode'
import {
  getProperties,
  getMainPhoto,
  getAllPhotos,
  getRoofedArea,
  getLotSurface,
  formatPrice,
  formatLocation,
  translatePropertyType,
  generatePropertySlug,
  type TokkoProperty,
} from '@/lib/tokko'

const SITE = 'https://siinmobiliaria.com'
const MIN_CASA = 200000
const MIN_LOTE = 40000
const MAX_PROPS = 80

export interface PropView {
  photos: string[]
  price: string
  tipo: string
  barrio: string | null
  zona: string
  titulo: string
  specs: { v: string; l: string }[]
  qr: string
  lat: number | null
  lng: number | null
  destacada: boolean
}
export interface CtaView { title: string; subtitle: string; note: string; qr: string }
export interface RecordView { emoji: string; label: string; value: string }

export type VitrinaCard =
  | { kind: 'property'; hook: 'reveal-price' | 'guess-zone' | 'plain'; rank?: number; total?: number; data: PropView }
  | { kind: 'cta'; data: CtaView }
  | { kind: 'record'; data: RecordView }

// ── helpers ───────────────────────────────────────────────────────────────
function priceNumber(p: TokkoProperty): number {
  if ((p as { web_price?: boolean }).web_price === false) return 0
  const pr = p.operations?.[0]?.prices?.[0]
  return pr?.price ?? 0
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function barrioOf(p: TokkoProperty): string | null {
  const addr = p.fake_address || p.address || ''
  const divs = [...(p.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const found = divs.find((d) => new RegExp(`\\b${escapeRegex(d.name)}\\b`, 'i').test(addr))
  return found?.name || null
}

function locText(p: TokkoProperty): string {
  return [p.location?.name, p.location?.short_location, p.fake_address, p.address, barrioOf(p)]
    .filter(Boolean).join(' ')
}

function isFunes(p: TokkoProperty): boolean { return /funes/i.test(locText(p)) }
function isRoldan(p: TokkoProperty): boolean { return /rold[aá]n/i.test(locText(p)) }
function isCasa(p: TokkoProperty): boolean {
  return /casa|house|condo|country house/i.test(`${p.type?.name} ${translatePropertyType(p.type?.name)}`)
}
function isLote(p: TokkoProperty): boolean {
  return /terreno|land|lote/i.test(`${p.type?.name} ${translatePropertyType(p.type?.name)}`)
}

// Piso de precio por tipo: casas ≥ 200k, lotes ≥ 40k, otros ≥ 200k. Sin precio
// visible (Consultar) queda afuera porque el gancho de reveal necesita un número.
function passesFloor(p: TokkoProperty): boolean {
  const price = priceNumber(p)
  if (price <= 0) return false
  if (isLote(p)) return price >= MIN_LOTE
  if (isCasa(p)) return price >= MIN_CASA
  return price >= MIN_CASA
}

function specsOf(p: TokkoProperty): { v: string; l: string }[] {
  const out: { v: string; l: string }[] = []
  const dorm = p.suite_amount || 0
  const amb = p.room_amount || 0
  if (dorm > 0) out.push({ v: String(dorm), l: dorm === 1 ? 'Dormitorio' : 'Dormitorios' })
  else if (amb > 0) out.push({ v: String(amb), l: amb === 1 ? 'Ambiente' : 'Ambientes' })
  if (p.bathroom_amount > 0) out.push({ v: String(p.bathroom_amount), l: p.bathroom_amount === 1 ? 'Baño' : 'Baños' })
  const cub = getRoofedArea(p)
  if (cub) out.push({ v: cub.toLocaleString('es-AR'), l: 'm² cubiertos' })
  const lote = getLotSurface(p)
  if (lote) out.push({ v: lote.toLocaleString('es-AR'), l: 'm² de lote' })
  return out.slice(0, 4)
}

async function qrFor(slug: string): Promise<string> {
  try {
    return await QRCode.toDataURL(`${SITE}/propiedades/${slug}`, {
      margin: 1, width: 240, color: { dark: '#0E1A14', light: '#FFFFFF' },
    })
  } catch { return '' }
}

async function qrRaw(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#0E1A14', light: '#FFFFFF' } })
  } catch { return '' }
}

async function toView(p: TokkoProperty): Promise<PropView> {
  const photo = getMainPhoto(p) as string
  const photos = [photo, ...getAllPhotos(p).filter((x) => x !== photo)].slice(0, 4)
  const lat = p.geo_lat ? parseFloat(p.geo_lat) : null
  const lng = p.geo_long ? parseFloat(p.geo_long) : null
  return {
    photos,
    price: formatPrice(p),
    tipo: translatePropertyType(p.type?.name) || 'Propiedad',
    barrio: barrioOf(p),
    zona: formatLocation(p),
    titulo: p.publication_title ?? '',
    specs: specsOf(p),
    qr: await qrFor(generatePropertySlug(p)),
    lat: Number.isFinite(lat as number) ? lat : null,
    lng: Number.isFinite(lng as number) ? lng : null,
    destacada: !!p.is_starred_on_web,
  }
}

function hookFor(p: TokkoProperty): 'reveal-price' | 'guess-zone' {
  return isLote(p) ? 'guess-zone' : 'reveal-price'
}

// ── CTAs institucionales (rotan) ─────────────────────────────────────────────
const CTAS: Omit<CtaView, 'qr'>[] = [
  { title: 'Tasá tu propiedad', subtitle: 'con nosotros', note: 'Tasación en 24 hs' },
  { title: 'Vendé con SI', subtitle: 'Te acompañamos en todo', note: 'Escaneá y contactanos' },
  { title: 'Seguinos', subtitle: '@inmobiliaria.si', note: 'Todas las propiedades en Instagram' },
]
const CTA_QR_URLS = [`${SITE}/tasaciones`, `${SITE}/contacto`, 'https://instagram.com/inmobiliaria.si']

// ── build principal ──────────────────────────────────────────────────────────
export async function getVitrina(): Promise<VitrinaCard[]> {
  let objects: TokkoProperty[] = []
  try {
    const resp = await getProperties({ operation: 'Sale', limit: 500 })
    objects = resp.objects ?? []
  } catch { return [] }

  const seen = new Set<number>()
  const props = objects.filter((p) => {
    if (!getMainPhoto(p)) return false
    if (!p.operations?.length) return false
    if (p.id && seen.has(p.id)) return false
    if (p.id) seen.add(p.id)
    return true
  })

  // Pool con pisos por tipo (casas ≥200k, lotes ≥40k).
  const pool = props.filter(passesFloor)

  const used = new Set<number>()
  const take = (p: TokkoProperty) => { if (p.id) used.add(p.id) }
  const free = (p: TokkoProperty) => !p.id || !used.has(p.id)

  // 1) Top 5 casas de Funes más caras (countdown)
  const funesCasas = pool
    .filter((p) => free(p) && isCasa(p) && isFunes(p))
    .sort((a, b) => priceNumber(b) - priceNumber(a))
    .slice(0, 5)
  funesCasas.forEach(take)

  // 2) Las 2 joyas de Roldán: Cotos de la Alameda y Las Tardes
  const roldan = pool.filter((p) => free(p) && isRoldan(p))
  const pickRoldan = (rx: RegExp): TokkoProperty | undefined => {
    const cands = roldan.filter((p) => rx.test(locText(p)) && free(p))
    if (cands.length === 0) return undefined
    return cands.sort((a, b) => Math.abs(priceNumber(a) - 240000) - Math.abs(priceNumber(b) - 240000))[0]
  }
  const roldanPicks = [pickRoldan(/cotos|alameda/i), pickRoldan(/las tardes|tardes/i)]
    .filter((p): p is TokkoProperty => !!p)
  roldanPicks.forEach(take)

  // 3) Lotes (≥40k) — bloque garantizado (si no, el orden por precio los dejaría
  //    fuera del top). No hace falta que sean de barrio privado. Gancho: adiviná
  //    el barrio.
  const lotes = pool
    .filter((p) => free(p) && isLote(p))
    .sort((a, b) => priceNumber(b) - priceNumber(a))
    .slice(0, 12)
  lotes.forEach(take)

  // 4) Resto premium (dentro del piso): de mayor a menor precio → el valor baja
  //    suave y no salta. Muchas propiedades para que no repita.
  const rest = pool
    .filter((p) => free(p))
    .sort((a, b) => priceNumber(b) - priceNumber(a))
    .slice(0, Math.max(0, MAX_PROPS - used.size))
  rest.forEach(take)

  // ── Micro-récords (dentro del piso) ────────────────────────────────────────
  const records: RecordView[] = []
  const casasReales = pool.filter((p) => isCasa(p)).filter((p) => {
    const r = getRoofedArea(p); return r && r >= 100 && r <= 2000
  })
  const biggest = casasReales.sort((a, b) => (getRoofedArea(b) || 0) - (getRoofedArea(a) || 0))[0]
  if (biggest) records.push({ emoji: '🏡', label: 'La casa más grande', value: `${getRoofedArea(biggest)!.toLocaleString('es-AR')} m²` })
  const lotesConSup = pool.filter((p) => isLote(p) && getLotSurface(p))
  const biggestLot = lotesConSup.sort((a, b) => (getLotSurface(b) || 0) - (getLotSurface(a) || 0))[0]
  if (biggestLot) records.push({ emoji: '🌳', label: 'El lote más grande', value: `${getLotSurface(biggestLot)!.toLocaleString('es-AR')} m²` })
  const casasPriced = pool.filter((p) => isCasa(p) && priceNumber(p) > 0)
  const cheapestCasa = casasPriced.sort((a, b) => priceNumber(a) - priceNumber(b))[0]
  if (cheapestCasa) records.push({ emoji: '💰', label: 'Casas desde', value: formatPrice(cheapestCasa) })
  records.push({ emoji: '📍', label: 'Propiedades en venta', value: `${pool.length}+` })

  // ── tarjetas de propiedad con su gancho ────────────────────────────────────
  const propCards: VitrinaCard[] = []

  // Countdown Top 5 Funes: de la MENOS cara del top (N°5) a la MÁS cara (N°1).
  const n = funesCasas.length
  const funesDisplay = [...funesCasas].reverse()
  for (let j = 0; j < n; j++) {
    propCards.push({ kind: 'property', hook: 'reveal-price', rank: n - j, total: n, data: await toView(funesDisplay[j]) })
  }
  // Roldán
  for (const p of roldanPicks) {
    propCards.push({ kind: 'property', hook: 'reveal-price', data: await toView(p) })
  }
  // Lotes — adiviná el barrio
  for (const p of lotes) {
    propCards.push({ kind: 'property', hook: 'guess-zone', data: await toView(p) })
  }
  // Resto
  for (const p of rest) {
    propCards.push({ kind: 'property', hook: hookFor(p), data: await toView(p) })
  }

  if (propCards.length === 0) return []

  // ── intercalar CTA cada 2 propiedades + récords entre bloques ──────────────
  const ctaCards: VitrinaCard[] = await Promise.all(
    CTAS.map(async (c, i) => ({ kind: 'cta' as const, data: { ...c, qr: await qrRaw(CTA_QR_URLS[i]) } })),
  )

  const seq: VitrinaCard[] = []
  let ctaI = 0
  let sinceCta = 0
  let recI = 0
  propCards.forEach((card, i) => {
    seq.push(card)
    sinceCta++
    if (sinceCta >= 2 && i < propCards.length - 1) {
      seq.push(ctaCards[ctaI % ctaCards.length])
      ctaI++
      sinceCta = 0
      if (ctaI % 2 === 0 && records.length) {
        seq.push({ kind: 'record', data: records[recI % records.length] })
        recI++
      }
    }
  })
  if (records.length) seq.unshift({ kind: 'record', data: records[records.length - 1] })

  return seq
}
