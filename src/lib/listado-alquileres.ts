// Listado de alquileres — proyección, agrupado y formato compartidos entre
// la hoja imprimible del panel (/agentes/lista-alquileres) y el PDF
// descargable desde /propiedades. Fuente única: las dos salidas muestran
// exactamente lo mismo.

import {
  formatLocation,
  getMainPhoto,
  getTotalSurface,
  type TokkoProperty,
} from './tokko'

export interface AlquilerItem {
  id: number
  direccion: string
  ubicacion: string
  tipoId: number | null
  foto: string | null
  /** null → "Consultar" (web_price false o sin monto cargado) */
  precio: number | null
  moneda: string | null
  dormitorios: number
  banos: number
  superficie: number | null
  cocheras: number
  referencia: string
}

// Precio de la operación de ALQUILER específicamente — no operacionPrincipal,
// que en una propiedad publicada en venta Y alquiler puede elegir la venta.
export function proyectarAlquiler(p: TokkoProperty): AlquilerItem | null {
  const op = (p.operations ?? []).find((o) => o.operation_type === 'Rent')
  if (!op) return null
  const pr = op.prices?.[0]
  const conPrecio = p.web_price !== false && !!pr?.price
  return {
    id: p.id,
    direccion: p.address || p.publication_title,
    ubicacion: formatLocation(p),
    tipoId: p.type?.id ?? null,
    foto: getMainPhoto(p),
    precio: conPrecio ? pr.price : null,
    moneda: conPrecio ? pr.currency : null,
    dormitorios: Number(p.suite_amount) || 0,
    banos: Number(p.bathroom_amount) || 0,
    superficie: getTotalSurface(p),
    cocheras: (Number(p.parking_lot_amount) || 0) + (Number(p.covered_parking_lot) || 0),
    referencia: p.reference_code || String(p.id),
  }
}

// Grupos por type.id de Tokko (ver PROPERTY_TYPE_LABELS / TYPE_FILTER_GROUPS
// en lib/tokko.ts — agrupar por id, nunca por substring del nombre).
const GRUPOS: { label: string; ids: number[] }[] = [
  { label: 'Casas', ids: [3, 4, 13] },
  { label: 'Departamentos', ids: [2] },
  { label: 'Locales y oficinas', ids: [5, 7] },
  { label: 'Galpones y depósitos', ids: [12, 14, 24] },
  { label: 'Cocheras', ids: [10] },
  { label: 'Terrenos y campos', ids: [1, 9] },
]

const ES_VIVIENDA = new Set([2, 3, 4, 13])

// Dentro de cada grupo: ARS primero (más chico a más grande), después USD,
// y al final las que van sin precio publicado ("Consultar").
function ordenPrecio(a: AlquilerItem, b: AlquilerItem): number {
  const rank = (i: AlquilerItem) => (i.precio ? (i.moneda === 'USD' ? 1 : 0) : 2)
  return rank(a) - rank(b) || (a.precio ?? Infinity) - (b.precio ?? Infinity)
}

export function agruparAlquileres(
  items: AlquilerItem[],
): { label: string; items: AlquilerItem[] }[] {
  const usados = new Set<number>()
  const secciones: { label: string; items: AlquilerItem[] }[] = []
  for (const g of GRUPOS) {
    const grupo = items.filter((i) => g.ids.includes(i.tipoId ?? -1))
    grupo.forEach((i) => usados.add(i.id))
    if (grupo.length) secciones.push({ label: g.label, items: grupo.sort(ordenPrecio) })
  }
  const otros = items.filter((i) => !usados.has(i.id))
  if (otros.length) secciones.push({ label: 'Otros', items: otros.sort(ordenPrecio) })
  return secciones
}

export function precioListado(item: AlquilerItem): { main: string; sub: string } {
  if (!item.precio) return { main: 'Consultar', sub: '' }
  const n = item.precio.toLocaleString('es-AR')
  return item.moneda === 'USD'
    ? { main: `USD ${n}`, sub: 'por mes' }
    : { main: `$ ${n}`, sub: 'por mes' }
}

export function caracteristicasListado(item: AlquilerItem): string {
  const out: string[] = []
  if (ES_VIVIENDA.has(item.tipoId ?? -1)) {
    if (item.tipoId === 2 && item.dormitorios === 0) out.push('Monoambiente')
    else if (item.dormitorios > 0) out.push(`${item.dormitorios} dorm.`)
  }
  if (item.banos > 0) out.push(`${item.banos} baño${item.banos > 1 ? 's' : ''}`)
  if (item.superficie) out.push(`${Math.round(item.superficie).toLocaleString('es-AR')} m²`)
  if (item.cocheras > 0) out.push('cochera')
  return out.join('  ·  ')
}

export function fechaListadoAR(): string {
  return new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  })
}

// "Agosto 2026" — para el label del botón de descarga y el filename del PDF.
export function mesAnioAR(): string {
  const s = new Date().toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  })
  const limpio = s.replace(' de ', ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}
