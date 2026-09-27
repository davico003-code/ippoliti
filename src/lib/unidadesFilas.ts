// Normaliza las unidades de un emprendimiento a filas de la lista de precios
// (DevUnitsSection). Vive fuera del componente porque se llama desde el server.

import type { DevUnit } from '@/lib/developments'
import type { BrickfyUnit } from '@/lib/brickfy'

export interface UnidadFila {
  id: string
  /** Lo que identifica a la unidad: "Torre 2 · Piso 1 · Unidad 4" o el título corto. */
  etiqueta: string
  /** Tipología o specs ("3D + Cochera Doble", "2 baños · 1 coch."). */
  detalle?: string
  m2: number
  dorms: number
  precio: number
  moneda: string
  planos: string[]
  /** Ficha propia de la unidad, si existe. */
  href?: string
  reservada?: boolean
  /** Precio especial de SI (lista del desarrollador → PRECIOS_PREFERENCIALES). */
  preferencial?: boolean
}

const TYPE_MAP: Record<string, string> = {
  'Apartment': 'Departamento',
  'House': 'Casa',
  'Land': 'Terreno',
  'Bussiness Premises': 'Local comercial',
  'Business Premises': 'Local comercial',
  'Garage': 'Cochera',
  'Office': 'Oficina',
  'PH': 'PH',
  'Duplex': 'Dúplex',
  'Local': 'Local comercial',
  // Completado con el resto de tipos del feed para no mostrar inglés crudo.
  'Warehouse': 'Galpón',
  'Condo': 'Condominio',
  'Countryside': 'Campo / Chacra',
  'Country House': 'Casa de campo',
  'Farm': 'Campo',
  'Building': 'Edificio',
  'Store': 'Local comercial',
}

function getUnitTitle(u: DevUnit): string {
  // Prefer publication_title or address over reference_code
  if (u.publication_title && !u.publication_title.match(/^[A-Z]{2,4}\d{5,}/)) return u.publication_title
  if (u.address && u.address.trim()) return u.address
  if (u.publication_title) return u.publication_title
  return TYPE_MAP[u.type?.name || ''] || u.type?.name || 'Unidad'
}

/** Unidades del CRM → filas. `contexto` = nombre + zona del emprendimiento: si el
 *  título termina en "en <emprendimiento/zona>" se recorta (la página ya lo dice). */
export function filasDesdeCrm(units: DevUnit[], contexto: string): UnidadFila[] {
  const ctx = contexto.toLowerCase()
  return units.map(u => {
    let etiqueta = getUnitTitle(u)
    const m = etiqueta.match(/^(.*\S)\s+en\s+(.+)$/i)
    if (m && m[2].toLowerCase().split(/[\s,]+/).some(w => w.length > 3 && ctx.includes(w))) etiqueta = m[1]
    const precio = u.operations?.[0]?.prices?.[0]
    const detalle = [
      u.bathroom_amount > 0 ? `${u.bathroom_amount} baño${u.bathroom_amount > 1 ? 's' : ''}` : null,
      u.parking_lot_amount > 0 ? `${u.parking_lot_amount} coch.` : null,
    ].filter(Boolean).join(' · ')
    return {
      id: String(u.id),
      etiqueta,
      detalle: detalle || undefined,
      m2: parseFloat(u.roofed_surface || u.total_surface || u.surface || '0') || 0,
      dorms: u.suite_amount || u.room_amount || 0,
      precio: precio?.price || 0,
      moneda: precio?.currency || 'USD',
      planos: (u.photos || []).filter(p => p.is_blueprint).map(p => p.image),
      href: `/propiedades/${u.id}-unidad`,
      reservada: u.status === 2,
    }
  })
}

/** Lista viva del desarrollador (Brickfy) → filas. Las vendidas no se listan. */
export function filasDesdeBrickfy(units: BrickfyUnit[]): UnidadFila[] {
  return units
    .filter(u => u.status === 'available' || u.status === 'reserved')
    .map(u => ({
      id: u.id,
      etiqueta: `${u.towerName} · Piso ${u.floor} · Unidad ${u.unitNumber}`,
      detalle: u.typology || undefined,
      m2: u.coveredSurfaceM2 || 0,
      dorms: u.bedrooms || 0,
      precio: u.price || 0,
      moneda: 'USD',
      planos: u.blueprintImageUrls || [],
      reservada: u.status === 'reserved',
      preferencial: u.preferencial,
    }))
}
