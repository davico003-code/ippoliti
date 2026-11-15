// Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton, Funes.
// Comercializa SI INMOBILIARIA. Las unidades están cargadas en HILO como
// borrador (GAL-*), así que todavía no salen en el feed: la landing es
// estática y esta lista es la fuente. Precios de LISTA (financiado) del stock
// de Fundar al 31-oct-2026; el contado es la lista con 25 % de descuento
// ("precio especial" de la misma planilla). Assets en public/emprendimientos/galinda.

export const GAL_BASE = '/emprendimientos/galinda'
export const GAL_URL = 'https://siinmobiliaria.com/emprendimientos/galinda'
// Emprendimiento sin captador → línea de venta (regla contactoDelAviso de HILO).
export const GAL_WA_PHONE = '5493413340916'
export const GAL_DESCUENTO_CONTADO = 0.25
export const GAL_ENTREGA = 'marzo de 2027'

export function galWhatsappUrl(text: string) {
  return `https://wa.me/${GAL_WA_PHONE}?text=${encodeURIComponent(text)}`
}

export type TipoUnidad = '2d' | '3d' | 'of'

export interface UnidadGalinda {
  id: string
  tipo: TipoUnidad
  piso: number
  frente: string
  /** m² totales (exclusivos + comunes), como los informa Fundar. */
  m2: number
  m2Exclusivos: string
  /** Precio de lista en USD (financiado). */
  lista: number
  /** Precio de contado en USD: el "precio especial −25 %" tal cual la planilla de Fundar. */
  contado: number
}

export const UNIDADES: UnidadGalinda[] = [
  { id: '02-11', tipo: '2d', piso: 2, frente: 'el parque', m2: 108, m2Exclusivos: '90,5', lista: 366131, contado: 274598 },
  { id: '03-12', tipo: '2d', piso: 3, frente: 'la plazoleta', m2: 108, m2Exclusivos: '90,5', lista: 290851, contado: 218138 },
  { id: '02-15', tipo: '2d', piso: 2, frente: 'Av. Galindo', m2: 118, m2Exclusivos: '99', lista: 319510, contado: 239632 },
  { id: '02-07', tipo: '3d', piso: 2, frente: 'el parque', m2: 132, m2Exclusivos: '111', lista: 410252, contado: 307689 },
  { id: '03-27', tipo: '3d', piso: 3, frente: 'calle Picton', m2: 130, m2Exclusivos: '109', lista: 391347, contado: 293510 },
  { id: '03-21', tipo: '3d', piso: 3, frente: 'Av. Galindo', m2: 140, m2Exclusivos: '117', lista: 399208, contado: 299406 },
  { id: '02-01', tipo: 'of', piso: 2, frente: 'la plazoleta', m2: 69, m2Exclusivos: '56,5', lista: 217944, contado: 163458 },
  { id: '03-02', tipo: 'of', piso: 3, frente: 'la plazoleta', m2: 51, m2Exclusivos: '42', lista: 161761, contado: 121321 },
  { id: '03-09', tipo: 'of', piso: 3, frente: 'la plazoleta', m2: 74, m2Exclusivos: '60,5', lista: 243041, contado: 182281 },
]

export const TIPO_LABEL: Record<TipoUnidad, string> = {
  '2d': '2 dormitorios',
  '3d': '3 dormitorios',
  of: 'Oficinas',
}

/** Contado de la unidad (dato de Fundar, ≈ lista − 25 %). */
export function precioContado(u: UnidadGalinda) {
  return u.contado
}

export function usd(n: number) {
  return `USD ${n.toLocaleString('es-AR')}`
}

export function nombreUnidad(u: UnidadGalinda) {
  return u.tipo === 'of' ? `Oficina ${u.id}` : `Unidad ${u.id}`
}

export function contadoDesde(tipo: TipoUnidad) {
  return Math.min(...UNIDADES.filter((u) => u.tipo === tipo).map((u) => precioContado(u)))
}
