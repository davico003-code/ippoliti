import { isMonoambiente, type TokkoProperty } from '@/lib/tokko'

export type SmartObjective = 'vivir' | 'invertir' | 'oportunidad'
export type SmartPropertyType = 'todos' | 'casa' | 'departamento' | 'terreno'
/**
 * Solo dos, y es a propósito.
 *
 * El listado que alimenta esta pantalla trae los datos duros de cada propiedad
 * (ambientes, superficie, cochera, ubicación) pero NO la descripción ni las
 * etiquetas del CRM. Filtrar "pileta" o "jardín" obligaba a adivinar leyendo el
 * título, y ahí el filtro juega en contra: encontraba 32 propiedades con pileta
 * y 6 con jardín sobre 253, escondiendo todas las que la tienen pero no la
 * nombran en el título. Un filtro que oculta lo que sí servía es peor que no
 * tenerlo.
 *
 * Quedan los dos que se pueden responder con datos ciertos:
 *   cochera   → parking_lot_amount / covered_parking_lot del CRM
 *   seguridad → el nombre del barrio, que viene en la ubicación
 *
 * Si algún día el listado empieza a traer las etiquetas, se reponen las otras.
 */
export type SmartLifestyleNeed = 'cochera' | 'seguridad'

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
  budgetStretchPct: 0 | 5 | 10 | 15 | null
}

export type SmartSelection = {
  properties: TokkoProperty[]
  exactBudgetCount: number
  maxBudgetStretchPct: 0 | 5 | 10 | 15 | null
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
  cochera: 'Cochera',
  seguridad: 'Barrio cerrado',
}

// Solo para "seguridad": los barrios cerrados de la zona, que aparecen en la
// ubicación que manda el CRM. "cochera" no usa texto, se resuelve con el número
// de cocheras de la propiedad.
const NEED_TERMS: Record<SmartLifestyleNeed, string[]> = {
  cochera: ['cochera', 'garage', 'garaje', 'estacionamiento'],
  seguridad: [
    'barrio cerrado',
    'barrio privado',
    'country',
    'club de campo',
    'funes hills',
    'kentucky',
    'san sebastian',
    // Nombres completos, nunca sueltos: "vida" a secas también matcheaba
    // "conectividad" y marcaba como barrio cerrado a cualquier aviso que usara
    // esa palabra.
    'vida club de campo',
    'vida crystal lagoon',
    'vida lagoon',
    'tierra de sueños',
    'los aromos',
    'don mateo',
    'el molino',
    'aldea fisherton',
  ],
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

/**
 * Moneda en la que se piensa el presupuesto de cada operación.
 *
 * Las ventas se publican en dólares (las 225 del catálogo) y los alquileres
 * casi siempre en pesos (24 de 30). Comparar todo contra dólares hacía que los
 * alquileres en pesos no tuvieran "precio" y se cayeran del resultado: poner un
 * presupuesto en alquiler escondía 24 de las 30 propiedades.
 */
export function monedaDeOperacion(operation: 'venta' | 'alquiler'): 'USD' | 'ARS' {
  return operation === 'alquiler' ? 'ARS' : 'USD'
}

/**
 * Precio de la propiedad en la moneda que corresponde a la búsqueda.
 *
 * Devuelve null cuando la propiedad no publica precio en esa moneda. Ojo: eso
 * NO significa "no entra en el presupuesto", significa "no se puede comparar".
 * Quien llama tiene que dejarla pasar, no descartarla.
 */
function propertyPrice(
  property: TokkoProperty,
  moneda: 'USD' | 'ARS',
): number | null {
  if (property.web_price === false) return null
  const price = property.operations
    ?.flatMap((operation) => operation.prices ?? [])
    .find((candidate) => candidate.currency === moneda && Number(candidate.price) > 0)?.price
  return price != null && Number.isFinite(Number(price)) ? Number(price) : null
}

function propertyBedrooms(property: TokkoProperty): number {
  // Un monoambiente tiene CERO dormitorios. Sin este chequeo, `suite_amount ||
  // room_amount` caía al ambiente único y lo contaba como 1: la card decía
  // "Monoambiente" y el motivo de abajo "1 dormitorio", contradiciéndose.
  if (isMonoambiente(property)) return 0
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

function budgetStretchPct(property: TokkoProperty, profile: SmartProfile): 0 | 5 | 10 | 15 | null {
  if (profile.budgetMax == null) return 0
  const price = propertyPrice(property, monedaDeOperacion(profile.operation))
  // Sin precio comparable (la propiedad publica en otra moneda, o no publica
  // precio) la tratamos como "entra": mejor mostrarla y que la persona decida,
  // que esconderle una propiedad que quizás le servía.
  if (price == null) return 0
  const ratio = price / profile.budgetMax
  if (ratio <= 1) return 0
  if (ratio <= 1.05) return 5
  if (ratio <= 1.1) return 10
  if (ratio <= 1.15) return 15
  return null
}

/**
 * Obligatorios no monetarios. El presupuesto se resuelve después sobre el
 * conjunto completo para poder abrir escalones solo cuando faltan opciones.
 */
function isCoreRelevantForProfile(property: TokkoProperty, profile: SmartProfile): boolean {
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

  const surface = propertySurface(property)
  if (profile.surfaceMin != null) {
    if (surface == null) return false
    const floor = profile.surfaceMin * (profile.flexible ? 0.9 : 1)
    if (surface < floor) return false
  }

  return true
}

/**
 * Compuerta de relevancia: evita el “catálogo infinito”. Los obligatorios se
 * cumplen; la flexibilidad solo admite una concesión chica y explícita.
 */
export function isRelevantForProfile(property: TokkoProperty, profile: SmartProfile): boolean {
  if (!isCoreRelevantForProfile(property, profile)) return false
  if (profile.budgetMax == null) return true
  const stretch = budgetStretchPct(property, profile)
  return stretch != null && (stretch === 0 || profile.flexible)
}

/**
 * Búsqueda progresiva: empieza en el presupuesto exacto y solo abre +5%,
 * +10% o +15% si todavía no reunió un conjunto corto y útil. Una búsqueda
 * estricta nunca abre el presupuesto. La escala elegida se muestra en UI.
 */
export function selectAdaptiveProperties(
  properties: TokkoProperty[],
  profile: SmartProfile,
  minimumUsefulResults = 6,
): SmartSelection {
  const core = properties.filter((property) => isCoreRelevantForProfile(property, profile))
  if (profile.budgetMax == null) {
    return { properties: core, exactBudgetCount: core.length, maxBudgetStretchPct: null }
  }

  const withTier = core.flatMap((property) => {
    const stretch = budgetStretchPct(property, profile)
    return stretch == null ? [] : [{ property, stretch }]
  })
  const exactBudgetCount = withTier.filter((item) => item.stretch === 0).length
  const tiers: Array<0 | 5 | 10 | 15> = profile.flexible ? [0, 5, 10, 15] : [0]
  const selectedTier = tiers.find((tier) => (
    withTier.filter((item) => item.stretch <= tier).length >= minimumUsefulResults
  )) ?? tiers.reduce((highestPresent, tier) => (
    withTier.some((item) => item.stretch === tier) ? tier : highestPresent
  ), 0 as 0 | 5 | 10 | 15)

  return {
    properties: withTier.filter((item) => item.stretch <= selectedTier).map((item) => item.property),
    exactBudgetCount,
    maxBudgetStretchPct: selectedTier,
  }
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
  const price = propertyPrice(property, monedaDeOperacion(profile.operation))
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
    const value = ratio <= 1 ? 1 : ratio <= 1.05 ? 0.82 : ratio <= 1.1 ? 0.64 : ratio <= 1.15 ? 0.45 : 0
    const underPct = price == null ? 0 : Math.round((1 - ratio) * 100)
    const overPct = price == null ? 0 : Math.round((ratio - 1) * 100)
    addCriterion(
      value,
      28,
      ratio <= 1 ? (underPct >= 8 ? `${underPct}% debajo de tu tope` : 'Dentro de tu presupuesto') : null,
      ratio > 1 && ratio <= 1.15 ? `Excede ${overPct}% tu presupuesto` : null,
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
    // Acá la versión original leía un "% debajo del mercado" que venía del
    // catálogo de propiedades de terceros. Ese catálogo no existe: nadie
    // calcula ese número hoy, así que la etiqueta habría salido siempre vacía
    // o, peor, inventada. Ordenamos por lo único cierto que tenemos: si la
    // propiedad está destacada.
    const starred = property.is_starred_on_web
    addCriterion(
      starred ? 0.72 : 0.15,
      profile.objective === 'oportunidad' ? 22 : 14,
      starred ? 'Destacada por SI INMOBILIARIA' : null,
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
    budgetStretchPct: profile.budgetMax == null ? null : budgetStretchPct(property, profile),
  }
}

export function smartProfileLabel(profile: SmartProfile): string {
  const parts: string[] = [profile.operation === 'venta' ? 'Comprar' : 'Alquilar']
  if (profile.locations.length) {
    parts.push(profile.locations.map((location) => location === 'roldan' ? 'Roldán' : `${location[0].toUpperCase()}${location.slice(1)}`).join(' o '))
  }
  if (profile.propertyType !== 'todos') parts.push(profile.propertyType)
  if (profile.bedroomsMin != null) parts.push(`${profile.bedroomsMin}+ dorm.`)
  if (profile.budgetMax != null) {
    // La misma moneda con la que se compara: dólares en venta, pesos por mes en
    // alquiler. Decir "hasta USD 800.000" en un alquiler no tenía sentido.
    parts.push(
      profile.operation === 'alquiler'
        ? `hasta $${profile.budgetMax.toLocaleString('es-AR')}/mes`
        : `hasta USD ${profile.budgetMax.toLocaleString('es-AR')}`,
    )
  }
  return parts.join(' · ') || 'criterios abiertos'
}
