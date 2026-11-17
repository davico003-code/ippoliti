// Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton, Funes.
// Comercializa SI INMOBILIARIA. Las unidades están cargadas en HILO como
// borrador (GAL-*), así que todavía no salen en el feed: la landing es
// estática y esta lista es la fuente.
//
// SIN PRECIO (decisión de David, 17-nov-2026): ni lista ni contado en la web.
// El que quiera el precio lo pide por WhatsApp. No volver a agregar montos acá
// sin su OK. Stock según la planilla de Fundar al 31-oct-2026.

export const GAL_BASE = '/emprendimientos/galinda'
export const GAL_URL = 'https://siinmobiliaria.com/emprendimientos/galinda'
// Emprendimiento sin captador → línea de venta (regla contactoDelAviso de HILO).
export const GAL_WA_PHONE = '5493413340916'
// Entregas que pasó Fundar (17-nov-2026): las oficinas antes que las viviendas.
export const GAL_ENTREGA_OFICINAS = 'enero de 2027'
export const GAL_ENTREGA_VIVIENDAS = 'marzo-abril de 2027'
// Forma de pago que pasó Fundar (17-nov-2026). Sin montos: la web no muestra precio.
export const GAL_FORMA_PAGO = {
  anticipo: '30 % de anticipo',
  cuotas: 'el resto en 12 o 24 cuotas',
  moneda: 'Las cuotas pueden ser en pesos, ajustadas por CAC.',
}
/** Avance de obra que publica Fundar en su ficha (fundar.com.ar, 17-nov-2026). */
export const GAL_AVANCE = 91
/** Fecha de las fotos y videos propios del showroom y la obra. */
export const GAL_FECHA_FOTOS = '17 de noviembre de 2026'

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
}

// Las 15 unidades del stock de Fundar al 31-oct-2026 (m² de sus fichas).
export const UNIDADES: UnidadGalinda[] = [
  { id: '02-04', tipo: '2d', piso: 2, frente: 'el parque', m2: 107, m2Exclusivos: '89,5' },
  { id: '02-11', tipo: '2d', piso: 2, frente: 'el parque', m2: 108, m2Exclusivos: '90,5' },
  { id: '03-11', tipo: '2d', piso: 3, frente: 'el parque', m2: 108, m2Exclusivos: '90,5' },
  { id: '02-12', tipo: '2d', piso: 2, frente: 'la plazoleta', m2: 108, m2Exclusivos: '90,5' },
  { id: '03-12', tipo: '2d', piso: 3, frente: 'la plazoleta', m2: 108, m2Exclusivos: '90,5' },
  { id: '02-14', tipo: '2d', piso: 2, frente: 'Av. Galindo', m2: 118, m2Exclusivos: '99' },
  { id: '02-15', tipo: '2d', piso: 2, frente: 'Av. Galindo', m2: 118, m2Exclusivos: '99' },
  { id: '03-15', tipo: '2d', piso: 3, frente: 'Av. Galindo', m2: 118, m2Exclusivos: '99' },
  { id: '02-07', tipo: '3d', piso: 2, frente: 'el parque', m2: 132, m2Exclusivos: '111' },
  { id: '02-27', tipo: '3d', piso: 2, frente: 'calle Picton', m2: 130, m2Exclusivos: '109' },
  { id: '03-27', tipo: '3d', piso: 3, frente: 'calle Picton', m2: 130, m2Exclusivos: '109' },
  { id: '03-21', tipo: '3d', piso: 3, frente: 'Av. Galindo', m2: 140, m2Exclusivos: '117' },
  { id: '03-02', tipo: 'of', piso: 3, frente: 'la plazoleta', m2: 51, m2Exclusivos: '42' },
  { id: '02-01', tipo: 'of', piso: 2, frente: 'la plazoleta', m2: 69, m2Exclusivos: '56,5' },
  { id: '03-09', tipo: 'of', piso: 3, frente: 'la plazoleta', m2: 74, m2Exclusivos: '60,5' },
]

export const TIPO_LABEL: Record<TipoUnidad, string> = {
  '2d': '2 dormitorios',
  '3d': '3 dormitorios',
  of: 'Oficinas',
}

export function nombreUnidad(u: UnidadGalinda) {
  return u.tipo === 'of' ? `Oficina ${u.id}` : `Unidad ${u.id}`
}

export function entregaDe(tipo: TipoUnidad) {
  return tipo === 'of' ? GAL_ENTREGA_OFICINAS : GAL_ENTREGA_VIVIENDAS
}

/** "frente al parque" / "frente a la plazoleta" (contrae a + el). */
export function frenteA(frente: string) {
  return frente.startsWith('el ') ? `frente al ${frente.slice(3)}` : `frente a ${frente}`
}

/** Rango de m² de un tipo, para los accesos rápidos ("108 a 118 m²"). */
export function rangoM2(tipo: TipoUnidad) {
  const m = UNIDADES.filter((u) => u.tipo === tipo).map((u) => u.m2)
  const min = Math.min(...m)
  const max = Math.max(...m)
  return min === max ? `${min} m²` : `${min} a ${max} m²`
}
