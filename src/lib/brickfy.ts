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
  /** Precio pisado por SI con valor preferencial (ver PRECIOS_PREFERENCIALES). */
  preferencial?: boolean
}

// Precios que SI comercializa a valor preferencial, distinto del que publica
// VERS en Brickfy. Pisan el precio de la API y marcan la unidad. Si una unidad
// deja de ser preferencial, borrarla de acá y vuelve al precio de Brickfy.
const PRECIOS_PREFERENCIALES: Record<string, number> = {
  'DOCK_GARDEN-2-4-3': 375000, // Torre 2 · Piso 4+5 Dúplex · Unidad 3 (3D)
  'DOCK_GARDEN-2-1-1': 340000, // Torre 2 · Piso 1 · Unidad 1 (3D)
}

// Las fotos de Brickfy traen el sello DOCKGARDEN estampado. Cada una tiene su
// versión limpia (Codex: sello reconstruido, color corregido y escalada), clave =
// nombre del archivo en Brickfy. Una foto nueva que suba VERS pasa tal cual.
const FOTOS_LIMPIAS: Record<string, string> = {
  '11ce9efc-b316-4392-b810-67c4668db0f6': '1d-cocina',
  '758ade8a-4bfb-4afa-a375-1371caa078e4': '1d-cocina',
  '94ee38f8-6741-44d3-8e3c-beeef2bd2178': '1d-cocina',
  '74254bf9-6145-4aea-8811-ea2f18430ced': '1d-dormitorio',
  '7a5afc24-966b-4d0c-9611-2ac40ca5eaeb': '1d-dormitorio',
  '0f479657-1d47-4838-90ea-6e4e960958df': '1d-living',
  '764fad29-0b12-400f-9be1-02d52677b557': '1d-living',
  '33dec90d-bec0-45b4-8882-638ebe0603d1': '3d-punta-cocina',
  '7bacafd1-703e-47dc-899f-5981f472d5d9': '3d-punta-cocina',
  '86db987a-4255-41d0-9589-f166c1cc71fc': '3d-punta-cocina',
  '6aa6d94a-704f-4542-93f4-6f1db17648f7': '3d-punta-comedor',
  'da008801-50f3-4d33-bc30-a93d8e3e1700': '3d-punta-comedor',
  'efc9aadd-f1c8-48f2-9ed4-c338cfb335ce': '3d-punta-comedor',
  '41f068f8-bca4-4551-a48b-1392eb828f7e': '3d-punta-dormitorio',
  '7a759a4d-02c5-42aa-b957-3043756a30ca': '3d-punta-dormitorio',
  'da2b04b0-be7f-4aeb-821f-5b89df65e8e1': '3d-punta-dormitorio',
  '02eadd17-072a-4a7b-a98a-0d5d5f3b0592': '3d-punta-living',
  '9112a291-24bd-4e9b-9ac5-26c7b5d5976c': '3d-punta-living',
  'f54d76c1-1bdf-4516-93e6-9de418dcf0fc': '3d-punta-living',
  '95e5cdac-d2e7-460b-9055-60ed9a315d8d': '3d-punta-living-2',
  'b1460a67-1805-474b-9da9-0fcb881de4e1': '3d-punta-living-2',
  'f5a5140f-3395-405c-88c1-27340909672d': '3d-punta-living-2',
  '03521c19-3fa5-4949-8329-f8fee81fe5e3': 'duplex-comedor',
  '0e79a709-b29b-4794-a931-89eee85ef8be': 'duplex-comedor',
  '462484d8-3818-4f7d-bd46-c942231af6d4': 'duplex-dormitorio',
  'dbdf9e99-edd6-499a-9b98-f8624a34b037': 'duplex-dormitorio',
  '7f25a6e1-d509-494e-bf31-27eb82bfc1fe': 'duplex-terraza',
  'a168b785-0a4a-4992-922a-6caa461c0a1d': 'duplex-terraza',
}
function fotoLimpia(url: string): string {
  const nombre = url.split('/').pop()?.split('.')[0] ?? ''
  return FOTOS_LIMPIAS[nombre] ? `/images/dockgarden/renders/${FOTOS_LIMPIAS[nombre]}.webp` : url
}

/** Versión liviana (900 px) de una foto limpia, para las tarjetas. */
export function fotoTarjeta(url: string): string {
  return url.startsWith('/images/dockgarden/renders/') ? url.replace(/\.webp$/, '-900.webp') : url
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
    const units: BrickfyUnit[] = (data?.units?.items ?? []).map((u: BrickfyUnit) => {
      const limpia = { ...u, galleryImageUrls: (u.galleryImageUrls ?? []).map(fotoLimpia) }
      return u.id in PRECIOS_PREFERENCIALES ? { ...limpia, price: PRECIOS_PREFERENCIALES[u.id], preferencial: true } : limpia
    })
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
