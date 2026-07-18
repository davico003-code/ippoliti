import { PROPERTY_SEO } from '@/lib/seoOverrides'

function getApiKey(): string {
  const key = process.env.TOKKO_API_KEY
  if (!key) throw new Error('TOKKO_API_KEY is not configured')
  return key
}
const BASE_URL = 'https://www.tokkobroker.com/api/v1'

// ── Puente HILO ──────────────────────────────────────────────────────────────
// El sitio corre con DATA_SOURCE=hilo (Tokko en desconexión). El feed público de
// HILO trae, EN CADA propiedad, el objeto `development` completo embebido y el
// development.id → podemos reconstruir emprendimientos y sus unidades sin pegarle
// nunca a la API de Tokko (que se va a caer). Reversible con el flag.
function isHiloSource(): boolean {
  return (process.env.DATA_SOURCE || '').toLowerCase() === 'hilo'
}
const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hiloFeed(): Promise<any[]> {
  const res = await fetch(`${HILO_BASE}/api/public/propiedades?limit=1000`, {
    next: { revalidate: 3600, tags: ['tokko-properties'] },
  })
  if (!res.ok) throw new Error(`Hilo feed error: ${res.status}`)
  const data = await res.json()
  return data.objects ?? []
}

// El `development` embebido en el FEED DE LISTA viene recortado (sin photos ni
// financing_details). El endpoint de UNA propiedad sí trae el development
// completo, así que para los datos ricos del emprendimiento (fotos del hero,
// financiación) leemos una unidad cualquiera de ese dev.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hiloRichDev(unitId: number): Promise<any | null> {
  try {
    const res = await fetch(`${HILO_BASE}/api/public/propiedades/${unitId}`, {
      next: { revalidate: 3600, tags: ['tokko-properties', `tokko-property-${unitId}`] },
    })
    if (!res.ok) return null
    const p = await res.json()
    return p.development ?? null
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawDev(d: any): Development {
  return {
    id: d.id,
    name: d.name ?? '',
    publication_title: d.publication_title ?? '',
    address: d.address ?? '',
    fake_address: d.fake_address ?? '',
    description: d.description ?? '',
    construction_status: d.construction_status ?? 0,
    display_on_web: d.display_on_web !== false,
    is_starred_on_web: Boolean(d.is_starred_on_web),
    photos: d.photos ?? [],
    videos: d.videos ?? [],
    tags: d.tags ?? [],
    files: d.files ?? [],
    type: d.type ?? { code: '', id: 0, name: '' },
    location: d.location ?? { id: 0, name: '', full_location: '', short_location: '' },
    geo_lat: d.geo_lat ?? null,
    geo_long: d.geo_long ?? null,
    financing_details: d.financing_details ?? '',
    web_url: d.web_url ?? '',
  }
}

// --- Types ---

export interface DevPhoto {
  description: string | null
  image: string
  is_blueprint: boolean
  is_front_cover: boolean
  order: number
  original: string
  thumb: string
}

export interface DevVideo {
  id: number
  title: string
  description: string
  url: string
  player_url: string
  provider: string
  video_id: string
  order: number
}

export interface DevTag {
  id: number
  name: string
  type: number
}

export interface DevFile {
  file: string
}

export interface DevLocation {
  id: number
  name: string
  full_location: string
  short_location: string
}

export interface Development {
  id: number
  name: string
  publication_title: string
  address: string
  fake_address: string
  description: string
  construction_status: number
  display_on_web: boolean
  is_starred_on_web: boolean
  photos: DevPhoto[]
  videos: DevVideo[]
  tags: DevTag[]
  files: DevFile[]
  type: { code: string; id: number; name: string }
  location: DevLocation
  geo_lat: number | null
  geo_long: number | null
  financing_details: string
  web_url: string
}

export interface DevListResponse {
  meta: { total_count: number; limit: number; offset: number }
  objects: Development[]
}

// --- Helpers ---

export function generateDevSlug(dev: Development): string {
  const base = dev.name || dev.publication_title || `emprendimiento-${dev.id}`
  const slugified = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${dev.id}-${slugified}`
}

export function getDevIdFromSlug(slug: string): number {
  return parseInt(slug.split('-')[0], 10)
}

export function getDevMainPhoto(dev: Development): string | null {
  if (!dev.photos || dev.photos.length === 0) return null
  const cover = dev.photos.find(p => p.is_front_cover && !p.is_blueprint)
  const first = dev.photos.find(p => !p.is_blueprint)
  return (cover || first || dev.photos[0]).image
}

export function getDevAllPhotos(dev: Development): string[] {
  if (!dev.photos || dev.photos.length === 0) return []
  return dev.photos
    .filter(p => !p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map(p => p.image)
}

const STATUS_MAP: Record<number, string> = {
  1: 'En pozo',
  2: 'En construcción',
  3: 'En construcción',
  4: 'En construcción',
  5: 'Terminado',
}

export function getConstructionStatus(status: number): string {
  return STATUS_MAP[status] ?? 'Consultar'
}

const TYPE_MAP: Record<string, string> = {
  Condominium: 'Condominio',
  'Open neighborhood': 'Barrio Abierto',
  'Closed neighborhood': 'Barrio Cerrado',
  Building: 'Edificio',
  Tower: 'Torre',
}

export function translateDevType(name: string): string {
  return TYPE_MAP[name] ?? name
}

// Re-export translateTag from tokko.ts (single source of truth)
export { translateTag } from './tokko'

// --- API ---

export async function getDevelopments(): Promise<Development[]> {
  if (isHiloSource()) {
    const objs = await hiloFeed()
    // Una unidad representativa por dev (para traer el development completo).
    const unitByDev = new Map<number, number>()
    for (const o of objs) {
      const d = o.development
      if (d?.id && d.display_on_web !== false && !unitByDev.has(d.id)) unitByDev.set(d.id, o.id)
    }
    const devs = await Promise.all(
      Array.from(unitByDev.entries()).map(async ([devId, unitId]) => {
        const rich = await hiloRichDev(unitId)
        // Fallback al dev recortado del feed si la lectura rica falla.
        return mapRawDev(rich ?? objs.find((o) => o.development?.id === devId)?.development)
      }),
    )
    return devs
  }
  const url = `${BASE_URL}/development/?key=${getApiKey()}&lang=es&format=json&limit=100`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Tokko dev API error: ${res.status}`)
  const data: DevListResponse = await res.json()
  return data.objects ?? []
}

export async function getDevelopmentById(id: number): Promise<Development> {
  if (isHiloSource()) {
    const objs = await hiloFeed()
    const hit = objs.find((o) => o.development?.id === id)
    if (!hit) throw new Error(`Development ${id} not found`)
    // Traer el development COMPLETO (con fotos/financiación) desde la unidad.
    const rich = await hiloRichDev(hit.id)
    return mapRawDev(rich ?? hit.development)
  }
  const url = `${BASE_URL}/development/${id}/?key=${getApiKey()}&lang=es&format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Tokko dev API error: ${res.status}`)
  return res.json()
}

export interface DevUnit {
  id: number
  publication_title: string
  address: string
  type: { name: string } | null
  status: number // 1=available, 2=reserved, 3=sold
  roofed_surface: string
  total_surface: string
  surface: string
  suite_amount: number
  room_amount: number
  bathroom_amount: number
  parking_lot_amount: number
  operations: { prices: { price: number; currency: string }[] }[]
  reference_code: string
  photos: { image: string; thumb: string; is_front_cover: boolean; is_blueprint: boolean }[]
}

export async function getDevUnits(developmentId: number): Promise<DevUnit[]> {
  // El título pasa por el override de SEO (corrige dormitorios/typos del CRM en
  // las cards de la landing; el link usa solo el ID, no cambia nada más).
  const applySeo = (u: DevUnit): DevUnit => {
    const seo = PROPERTY_SEO[u.id]
    return seo ? { ...u, publication_title: seo.title } : u
  }
  try {
    if (isHiloSource()) {
      const objs = await hiloFeed()
      return objs
        .filter((u) => u.development?.id === developmentId && u.status !== 3)
        .map((u) => applySeo(u as DevUnit))
    }
    const url = `${BASE_URL}/property/?key=${getApiKey()}&development=${developmentId}&format=json&limit=100&lang=es`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    // Filter by development ID (safety) and exclude sold (status 3).
    return (data.objects || [])
      .filter((u: DevUnit & { development?: { id: number } | null }) =>
        u.status !== 3 && (!u.development || u.development.id === developmentId)
      )
      .map((u: DevUnit) => applySeo(u))
  } catch {
    return []
  }
}
