import 'server-only'
import { findBarrioForProperty } from '@/lib/barrios'
import { isLand, type TokkoProperty } from '@/lib/tokko'
import { enPiloto } from './calcular'
import type { CuentaDeBarrio, CuentaLotes } from './tipos'

// "La cuenta del lote" por barrio, de Hilo, servidor a servidor (la misma
// llave que el tasador por barrio). Una hora de cache: Hilo la rearma cada 6 h.
// NUNCA tira: la ficha de un lote y la página del barrio tienen que salir
// igual aunque Hilo no responda; sin datos, la sección no aparece.

const BASE = (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')

export async function traerCuentaLotes(): Promise<CuentaLotes | null> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return null
  try {
    const res = await fetch(`${BASE}/api/public/en-red/cuenta-lote`, {
      headers: { 'x-hilo-ingest-secret': secret },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<CuentaLotes>
    if (!Array.isArray(data.barrios) || typeof data.costoObraUsdM2 !== 'number') return null
    return data as CuentaLotes
  } catch (e) {
    console.warn('[cuenta-lote] Hilo no respondió', e instanceof Error ? e.message : e)
    return null
  }
}

/** La cuenta de un barrio de la web, solo en los del piloto. */
export async function cuentaDeBarrio(slug: string): Promise<CuentaDeBarrio | null> {
  if (!enPiloto(slug)) return null
  const todas = await traerCuentaLotes()
  const barrio = todas?.barrios.find((b) => b.slug === slug)
  if (!todas || !barrio) return null
  return { barrio, dolar: todas.dolar, costoObraUsdM2: todas.costoObraUsdM2, aniosTenencia: todas.aniosTenencia ?? 5 }
}

/** Para la ficha: solo lotes, en un barrio de la web que esté en el piloto. */
export async function cuentaParaFicha(property: TokkoProperty): Promise<CuentaDeBarrio | null> {
  if (!isLand(property)) return null
  const barrio = findBarrioForProperty(property)
  return barrio ? cuentaDeBarrio(barrio.slug) : null
}
