function getApiKey(): string {
  const key = process.env.TOKKO_API_KEY
  if (!key) throw new Error('TOKKO_API_KEY is not configured')
  return key
}
const BASE_URL = 'https://www.tokkobroker.com/api/v1'

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
  const url = `${BASE_URL}/development/?key=${getApiKey()}&lang=es&format=json&limit=20`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Tokko dev API error: ${res.status}`)
  const data: DevListResponse = await res.json()
  return data.objects ?? []
}

export async function getDevelopmentById(id: number): Promise<Development> {
  const url = `${BASE_URL}/development/${id}/?key=${getApiKey()}&lang=es&format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Tokko dev API error: ${res.status}`)
  return res.json()
}
