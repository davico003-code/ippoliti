import type { CuentaDeBarrio, Tenencia } from './tipos'

// La cuenta del lote puntual (ficha): la misma fórmula que Hilo aplica al lote
// típico del barrio, con el precio y la expensa de ESTE lote. Y el formato de
// los números tal como se leen en la tarjeta. Sin React ni servidor: se prueba
// con node --test src/lib/cuenta-lote/calcular.test.mjs.

/** Barrios donde la tarjeta ya se muestra (piloto, David 8-nov-2026). Agregar acá para extender. */
export const BARRIOS_PILOTO: readonly string[] = ['funes-lakes', 'vida-lagoon']
export const enPiloto = (slug: string | null | undefined): boolean => !!slug && BARRIOS_PILOTO.includes(slug)

const redondear = (x: number, decimales = 0): number => {
  const f = 10 ** decimales
  return Math.round(x * f) / f
}

/** Gemela de `tenencia` en Hilo (si-crm: src/lib/cuenta-lote/calcular.ts). Si una cambia, cambiar la otra. */
export function tenenciaDeLote(e: { expensasArs: number | null; dolar: number | null; precioUsd: number | null; anios: number }): Tenencia | null {
  if (!e.expensasArs || e.expensasArs <= 0 || !e.dolar || e.dolar <= 0 || !e.precioUsd || e.precioUsd <= 0 || e.anios <= 0) return null
  const mensual = e.expensasArs / e.dolar
  const total = mensual * 12 * e.anios
  return {
    mensualUsd: Math.round(mensual),
    anualPct: redondear(((mensual * 12) / e.precioUsd) * 100, 1),
    cincoAniosUsd: Math.round(total / 100) * 100,
    cincoAniosPct: redondear((total / e.precioUsd) * 100, 1),
  }
}

export type CuentaDelLote = {
  tenencia: Tenencia | null
  /** De dónde salió la expensa: la cargada en este lote, o la del barrio. */
  expensasOrigen: 'lote' | 'barrio' | null
  /** Sobre qué precio se midió el %: el de este lote, o el lote típico del barrio (lote sin precio público). */
  base: 'lote' | 'tipico' | null
}

/**
 * Para un lote concreto: su expensa si alguien la cargó, si no la del barrio;
 * su precio si es público, si no el lote típico del barrio (y se dice).
 */
export function cuentaDelLote(cuenta: CuentaDeBarrio, lote: { precioUsd: number | null; expensasArs: number | null }): CuentaDelLote {
  const expensasArs = lote.expensasArs && lote.expensasArs > 0 ? lote.expensasArs : cuenta.barrio.expensas.loteArs
  const expensasOrigen = lote.expensasArs && lote.expensasArs > 0 ? 'lote' : expensasArs ? 'barrio' : null
  const precioUsd = lote.precioUsd && lote.precioUsd > 0 ? lote.precioUsd : cuenta.barrio.lote.tipicoUsd
  const base = lote.precioUsd && lote.precioUsd > 0 ? 'lote' : precioUsd ? 'tipico' : null
  const tenencia = tenenciaDeLote({ expensasArs, dolar: cuenta.dolar?.valor ?? null, precioUsd, anios: cuenta.aniosTenencia })
  return { tenencia, expensasOrigen: tenencia ? expensasOrigen : null, base: tenencia ? base : null }
}

const ENTERO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const UN_DECIMAL = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })
const DIA_MES = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })

export const usd = (n: number): string => `USD ${ENTERO.format(n)}`
export const m2 = (n: number): string => `${ENTERO.format(n)} m²`

/** "−17 %", "+10 %", "0 %": el signo siempre, para que se lea como diferencia. */
export function pct(n: number, decimales: 0 | 1 = 0): string {
  const v = redondear(n, decimales)
  const texto = decimales ? UN_DECIMAL.format(Math.abs(v)) : ENTERO.format(Math.abs(v))
  return v > 0 ? `+${texto} %` : v < 0 ? `−${texto} %` : '0 %'
}

/** "30 de septiembre" de una fecha ISO "2026-09-30". */
export function diaMes(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return Number.isNaN(d.getTime()) ? iso : DIA_MES.format(d)
}
