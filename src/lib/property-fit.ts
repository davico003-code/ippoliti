import type { TokkoProperty } from '@/lib/tokko'

export type SmartObjective = 'vivir' | 'invertir' | 'oportunidad'
export type SmartPropertyType = 'todos' | 'casa' | 'departamento' | 'terreno'
export type SmartLifestyleNeed = 'pileta' | 'verde' | 'cochera' | 'seguridad' | 'lista'

export type SmartProfile = {
  operation: 'venta' | 'alquiler'
  objective: SmartObjective
  locations: Array<'funes' | 'roldan' | 'rosario'>
  propertyType: SmartPropertyType
  bedroomsMin: number | null
  budgetMax: number | null
  surfaceMin: number | null
  flexible: boolean
  needs: SmartLifestyleNeed[]
}

export type PropertyFit = {
  score: number
  reasons: string[]
  caveats: string[]
}

export const DEFAULT_SMART_PROFILE: SmartProfile = {
  operation: 'venta',
  objective: 'vivir',
  locations: [],
  propertyType: 'todos',
  bedroomsMin: null,
  budgetMax: null,
  surfaceMin: null,
  flexible: true,
  needs: [],
}

const TYPE_IDS: Record<Exclude<SmartPropertyType, 'todos'>, number[]> = {
  terreno: [1],
  casa: [3, 4],
  departamento: [2],
}

const NEED_LABEL: Record<SmartLifestyleNeed, string> = {
  pileta: 'Pileta',
  verde: 'Espacio verde',
  cochera: 'Cochera',
  seguridad: 'Barrio cerrado',
  lista: 'Lista para mudarse',
}

const NEED_TERMS: Record<SmartLifestyleNeed, string[]> = {
  pileta: ['pileta', 'piscina', 'swimming'],
  verde: ['jardin', 'parque', 'patio', 'verde', 'forestada'],
  cochera: ['cochera', 'garage', 'garaje', 'estacionamiento'],
  seguridad: ['barrio cerrado', 'country', 'funes hills', 'vida', 'kentucky', 'san sebastian', 'seguridad'],
  lista: ['estrenar', 'impecable', 'excelente estado', 'reciclada', 'nueva'],
}

const norm = (value: string | null | undefined): string =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

function propertyHaystack(property: TokkoProperty): string {
  return norm([
    property.publication_title,
    property.address,
    property.fake_address,
    property.location?.name,
    property.location?.short_location,
    property.development?.name,
    property.property_condition,
    ...(property.tags ?? []).map((tag) => tag.name),
  ].filter(Boolean).join(' '))
}

function propertyPriceUsd(property: TokkoProperty): number | null {
  if (property.web_price === false) return null
  const price = property.operations
    ?.flatMap((operation) => operation.prices ?? [])
    .find((candidate) => candidate.currency === 'USD')?.price
  return price != null && Number.isFinite(Number(price)) ? Number(price) : null
}

function propertyBedrooms(property: TokkoProperty): number {
  return Number(property.suite_amount || property.room_amount || 0)
}

function propertySurface(property: TokkoProperty): number | null {
  const candidates = [property.total_surface, property.surface, property.roofed_surface]
  for (const value of candidates) {
    const parsed = Number.parseFloat(String(value ?? ''))
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

function matchesLocation(property: TokkoProperty, location: SmartProfile['locations'][number]): boolean {
  const text = propertyHaystack(property)
  if (location === 'roldan') return text.includes('roldan')
  return text.includes(location)
}

function matchesNeed(property: TokkoProperty, need: SmartLifestyleNeed): boolean {
  if (need === 'cochera' && (property.parking_lot_amount > 0 || property.covered_parking_lot > 0)) return true
  const text = propertyHaystack(property)
  return NEED_TERMS[need].some((term) => text.includes(norm(term)))
}

/**
 * Compuerta de relevancia: evita el “catálogo infinito”. Los obligatorios se
 * cumplen; la flexibilidad solo admite una concesión chica y explícita.
 */
export function isRelevantForProfile(property: TokkoProperty, profile: SmartProfile): boolean {
  const operations = new Set((property.operations ?? []).map((item) => item.operation_type))
  if (profile.operation === 'venta' && !operations.has('Sale')) return false
  if (profile.operation === 'alquiler' && !operations.has('Rent')) return false

  if (profile.locations.length > 0 && !profile.locations.some((location) => matchesLocation(property, location))) {
    return false
  }

  if (profile.propertyType !== 'todos') {
    const ids = TYPE_IDS[profile.propertyType]
    if (!ids.includes(property.type?.id ?? -1)) return false
  }

  const bedrooms = propertyBedrooms(property)
  if (profile.bedroomsMin != null && bedrooms < profile.bedroomsMin) return false

  const price = propertyPriceUsd(property)
  if (profile.budgetMax != null) {
    if (price == null) return false
    const ceiling = profile.budgetMax * (profile.flexible ? 1.1 : 1.02)
    if (price > ceiling) return false
  }

  const surface = propertySurface(property)
  if (profile.surfaceMin != null) {
    if (surface == null) return false
    const floor = profile.surfaceMin * (profile.flexible ? 0.9 : 1)
    if (surface < floor) return false
  }

  return true
}

function addCriterion(
  value: number,
  weight: number,
  reason: string | null,
  caveat: string | null,
  state: { earned: number; possible: number; reasons: string[]; caveats: string[] },
) {
  state.possible += weight
  state.earned += Math.max(0, Math.min(1, value)) * weight
  if (reason) state.reasons.push(reason)
  if (caveat) state.caveats.push(caveat)
}

/** Puntaje explicable y determinístico: no inventa atributos ausentes. */
export function scorePropertyFit(property: TokkoProperty, profile: SmartProfile): PropertyFit {
  const state = { earned: 0, possible: 0, reasons: [] as string[], caveats: [] as string[] }
  const price = propertyPriceUsd(property)
  const bedrooms = propertyBedrooms(property)
  const surface = propertySurface(property)

  if (profile.locations.length > 0) {
    const hit = profile.locations.some((location) => matchesLocation(property, location))
    addCriterion(hit ? 1 : 0, 24, hit ? 'Está en una de tus zonas' : null, null, state)
  }

  if (profile.propertyType !== 'todos') {
    const hit = TYPE_IDS[profile.propertyType].includes(property.type?.id ?? -1)
    addCriterion(hit ? 1 : 0, 13, hit ? 'Tipología pedida' : null, null, state)
  }

  if (profile.bedroomsMin != null) {
    const surplus = bedrooms - profile.bedroomsMin
    addCriterion(
      bedrooms >= profile.bedroomsMin ? 1 : 0,
      16,
      bedrooms >= profile.bedroomsMin ? `${bedrooms} dormitorio${bedrooms === 1 ? '' : 's'}` : null,
      surplus >= 2 ? 'Tiene más dormitorios de los necesarios' : null,
      state,
    )
  }

  if (profile.budgetMax != null) {
    const ratio = price == null ? Number.POSITIVE_INFINITY : price / profile.budgetMax
    const value = ratio <= 1 ? 1 : ratio <= 1.05 ? 0.82 : ratio <= 1.1 ? 0.58 : 0
    const underPct = price == null ? 0 : Math.round((1 - ratio) * 100)
    const overPct = price == null ? 0 : Math.round((ratio - 1) * 100)
    addCriterion(
      value,
      28,
      ratio <= 1 ? (underPct >= 8 ? `${underPct}% debajo de tu tope` : 'Dentro de tu presupuesto') : null,
      ratio > 1 && ratio <= 1.1 ? `Excede ${overPct}% tu presupuesto` : null,
      state,
    )
  }

  if (profile.surfaceMin != null) {
    const ratio = surface == null ? 0 : surface / profile.surfaceMin
    addCriterion(
      ratio >= 1 ? 1 : ratio >= 0.9 ? 0.65 : 0,
      10,
      ratio >= 1 ? `${Math.round(surface!)} m² o más` : null,
      ratio < 1 && ratio >= 0.9 ? `Le faltan ${Math.round(profile.surfaceMin - surface!)} m²` : null,
      state,
    )
  }

  for (const need of profile.needs) {
    const hit = matchesNeed(property, need)
    addCriterion(hit ? 1 : 0, 7, hit ? NEED_LABEL[need] : null, null, state)
  }

  if (profile.objective === 'oportunidad' || profile.objective === 'invertir') {
    const discount = property.market_discount_pct ?? null
    const starred = property.is_starred_on_web
    const value = discount != null ? Math.min(1, Math.max(0.45, discount / 35)) : starred ? 0.75 : 0.5
    addCriterion(
      value,
      profile.objective === 'oportunidad' ? 22 : 14,
      discount != null && discount >= 20 ? `${Math.round(discount)}% debajo del mercado` : starred ? 'Destacada por SI INMOBILIARIA' : null,
      null,
      state,
    )
  }

  // Si la persona solo eligió objetivo “vivir”, damos un orden útil sin fingir
  // precisión: stock destacado y datos completos suman, pero no generan razones.
  if (state.possible === 0) {
    state.possible = 10
    state.earned = property.is_starred_on_web ? 8 : 6
  }

  return {
    score: Math.max(1, Math.min(99, Math.round((state.earned / state.possible) * 100))),
    reasons: Array.from(new Set(state.reasons)).slice(0, 4),
    caveats: Array.from(new Set(state.caveats)).slice(0, 2),
  }
}

export function smartProfileLabel(profile: SmartProfile): string {
  const parts: string[] = [profile.operation === 'venta' ? 'Comprar' : 'Alquilar']
  if (profile.locations.length) {
    parts.push(profile.locations.map((location) => location === 'roldan' ? 'Roldán' : `${location[0].toUpperCase()}${location.slice(1)}`).join(' o '))
  }
  if (profile.propertyType !== 'todos') parts.push(profile.propertyType)
  if (profile.bedroomsMin != null) parts.push(`${profile.bedroomsMin}+ dorm.`)
  if (profile.budgetMax != null) parts.push(`hasta USD ${profile.budgetMax.toLocaleString('es-AR')}`)
  return parts.join(' · ') || 'criterios abiertos'
}
