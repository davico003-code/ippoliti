// Helpers puros (sirven en cliente y servidor) para la página de tasación:
// textos por tipo, formato de números, presets de m², teléfono AR.

import type { BarrioTasacion, ComparablesResponse, TipoTasacion } from './types'

export const TEXTO_TIPO: Record<
  TipoTasacion,
  { singular: string; plural: string; comoLaTuya: string; tuCasa: string; articulo: string }
> = {
  casa: { singular: 'casa', plural: 'casas', comoLaTuya: 'como la tuya', tuCasa: 'tu casa', articulo: 'una casa' },
  lote: { singular: 'lote', plural: 'lotes', comoLaTuya: 'como el tuyo', tuCasa: 'tu lote', articulo: 'un lote' },
  depto: { singular: 'depto', plural: 'deptos', comoLaTuya: 'como el tuyo', tuCasa: 'tu depto', articulo: 'un depto' },
}

export function parseTipo(v: string | null | undefined): TipoTasacion | null {
  const s = (v ?? '').trim().toLowerCase()
  if (s === 'casa') return 'casa'
  if (s === 'lote' || s === 'terreno') return 'lote'
  if (s === 'depto' || s === 'departamento') return 'depto'
  return null
}

/** 350000 → "350.000" (sin depender del locale del runtime). */
export function fmtMiles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Cuántos comparables tiene el barrio para ese tipo (boolean → 1/0). */
export function cuentaTipo(b: BarrioTasacion, tipo: TipoTasacion): number {
  const v = tipo === 'casa' ? b.tiene.casas : tipo === 'lote' ? b.tiene.lotes : b.tiene.deptos
  return typeof v === 'boolean' ? (v ? 1 : 0) : v
}

/** Redondeo "lindo" para presets: de a 10 hasta 300 m², de a 50 después. */
function redondeoLindo(n: number): number {
  const paso = n < 300 ? 10 : 50
  return Math.max(paso, Math.round(n / paso) * paso)
}

/** Tres valores rápidos alrededor del típico del barrio (0.75× · 1× · 1.25×). */
export function presetsM2(tipico: number | null, fallback: number): number[] {
  const t = tipico && tipico > 0 ? tipico : fallback
  const set = [redondeoLindo(t * 0.75), redondeoLindo(t), redondeoLindo(t * 1.25)]
  return Array.from(new Set(set)).sort((a, b) => a - b)
}

export const M2_FALLBACK = { lote: 600, cubiertos: 150 }

/** Distancia en km entre dos coordenadas (haversine). */
export function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function barrioMasCercano(barrios: BarrioTasacion[], p: { lat: number; lng: number }): BarrioTasacion | null {
  let mejor: BarrioTasacion | null = null
  let dist = Infinity
  for (const b of barrios) {
    if (!b.centroide) continue
    const d = distanciaKm(b.centroide, p)
    if (d < dist) {
      dist = d
      mejor = b
    }
  }
  // Más de 25 km del barrio más cercano: no está en nuestra zona; no forzamos.
  return dist <= 25 ? mejor : null
}

/** Título del paso 2 según nivel/ámbito. */
export function tituloComparables(r: ComparablesResponse, tipo: TipoTasacion, barrio: BarrioTasacion): string {
  const t = TEXTO_TIPO[tipo]
  const Plural = t.plural[0].toUpperCase() + t.plural.slice(1)
  if (r.nivel === 4) return `${t.tuCasa[0].toUpperCase() + t.tuCasa.slice(1)} en ${barrio.nombre}`
  if (r.nivel === 2 || r.ambito === 'zona') return `${Plural} ${t.comoLaTuya} cerca de ${barrio.nombre}`
  if (r.nivel === 3 || r.ambito === 'ciudad') {
    const cerrado = r.barrio?.esCerrado ?? barrio.esCerrado
    return cerrado == null
      ? `${Plural} ${t.comoLaTuya} en ${barrio.ciudad}`
      : `${Plural} ${t.comoLaTuya} en barrios ${cerrado ? 'cerrados' : 'abiertos'} de ${barrio.ciudad}`
  }
  return `${Plural} ${t.comoLaTuya} en ${barrio.nombre}`
}

// ── Teléfono AR (celular, sin +54 9) ────────────────────────────────────────

/** Deja los 10 dígitos que van después de +54 9: código de área + número.
 *  Tolera "+54 9 341…", "0341 15…", "341 15…", "3415551234". */
export function normalizarCelularAr(raw: string): string {
  let d = (raw || '').replace(/\D/g, '')
  if (d.startsWith('549')) d = d.slice(3)
  else if (d.startsWith('54') && d.length > 10) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  // El "15" del celular solo se saca si sobran exactamente 2 dígitos (12 en
  // total): "341 15 5551234" → "3415551234". Con 10 dígitos no se toca, porque
  // "3415551234" también matchearía como área "34" + "15" + resto.
  const m = d.length === 12 ? d.match(/^(\d{2,4})15(\d{6,8})$/) : null
  if (m) d = m[1] + m[2]
  return d
}

/** 10 dígitos, primer dígito de área 1-3 (11 CABA, 2xx/3xx interior: 341, 3476, 3402…). */
export function celularArValido(digitos: string): boolean {
  return /^[1-3]\d{9}$/.test(digitos)
}
