// Cliente mínimo de la API pública de Brickfy (plataforma del desarrollador).
// El token es el del link de compartir que VERS Arquitectos difunde a
// inmobiliarias — no requiere auth y expone solo datos comerciales públicos.
// La landing /dockgarden se alimenta de acá vía ISR: si VERS actualiza
// precios/unidades en Brickfy, nuestra página se actualiza sola.

const BRICKFY_DOCK_GARDEN_URL =
  'https://app.brickfy.com.ar/api/public/custom-links/h9EIWlvh75iqKs53/projects/DOCK_GARDEN/units?limit=100'

export interface BrickfyVideo {
  id: string
  nombre: string
  cfStreamUid: string
  thumbnailUrl: string
}

export interface BrickfyProject {
  id: string
  name: string
  location: string
  deliveryDate: string
  status: string
  activeUnits: number
  bedroomValues: number[]
  amenities: string[]
  financing: string
  descriptionHtml: string
  totalSurfaceM2: number
  coverUrl: string
  galleryImageUrls: string[]
  blueprintImageUrls: string[]
  brochureUrl: string | null
  videos: BrickfyVideo[]
}

export interface BrickfyUnit {
  id: string
  towerName: string
  floor: string
  unitNumber: string
  category: string
  typology: string
  price: number
  coveredSurfaceM2: number
  bedrooms: number
  galleryImageUrls: string[]
  blueprintImageUrls: string[]
  virtualTours360: string[]
  parkingSpots: number
  fullBathrooms: number
  toilets: number
  status: 'available' | 'reserved' | string
}

export interface DockGardenData {
  project: BrickfyProject
  units: BrickfyUnit[]
}

export async function getDockGarden(): Promise<DockGardenData | null> {
  try {
    const res = await fetch(BRICKFY_DOCK_GARDEN_URL, {
      headers: { Accept: 'application/json' },
      // 1h: los precios de desarrollador cambian poco; ante error de
      // revalidación Next sigue sirviendo la versión anterior (stale).
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    const units: BrickfyUnit[] = data?.units?.items ?? []
    if (!data?.project || units.length === 0) return null
    return { project: data.project, units }
  } catch {
    return null
  }
}

/** "Torre 2 · Piso 4+5 Dúplex · Unidad 3" */
export function unitLabel(u: BrickfyUnit): string {
  return `${u.towerName} · Piso ${u.floor} · Unidad ${u.unitNumber}`
}
