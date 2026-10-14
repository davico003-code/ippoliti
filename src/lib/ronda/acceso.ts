// Ronda Funes Roldán — la clave de acceso.
//
// David (13-oct-2026): "ponele clave de acceso a la ronda". Una sola clave que
// se pasa a los colegas. Sin ella el servidor no entrega nada: ni la grilla, ni
// la lista de inmobiliarias, ni deja publicar. Quien la escribe bien recibe un
// pase firmado que queda en su teléfono; al cambiar la clave, todos los pases
// anteriores dejan de servir.
//
// En la base no queda la clave: queda su huella (sha-256 con sal). La pone
// scripts/ronda-clave.mjs. Sin clave configurada, la Ronda queda CERRADA.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const EN_PRODUCCION = process.env.VERCEL_ENV === 'production' && process.env.NODE_ENV === 'production'
const CLAVE_REDIS = `${EN_PRODUCCION ? 'ronda' : 'ronda-prueba'}:acceso`
const TTL_MS = 30_000

interface RegistroAcceso {
  sal: string
  huella: string
  /** Cambia con cada clave nueva: invalida los pases viejos. */
  version: number
}

let _registro: { r: RegistroAcceso | null; ts: number } | null = null

async function registro(fresco = false): Promise<RegistroAcceso | null> {
  if (!fresco && _registro && Date.now() - _registro.ts < TTL_MS) return _registro.r
  const crudo = await redis.get<RegistroAcceso | string>(CLAVE_REDIS)
  let r: RegistroAcceso | null = null
  try {
    r = typeof crudo === 'string' ? (JSON.parse(crudo) as RegistroAcceso) : crudo
  } catch {
    r = null
  }
  if (!r?.sal || !r.huella || !r.version) r = null
  _registro = { r, ts: Date.now() }
  return r
}

/** "  Colegas 4827 " → "colegas4827": se escribe en un teléfono, no importan mayúsculas ni espacios. */
export function normalizarClave(v: unknown): string {
  return String(v ?? '').toLowerCase().replace(/\s+/g, '').slice(0, 80)
}

export function huellaDeClave(clave: string, sal: string): string {
  return createHash('sha256').update(`${sal}:${normalizarClave(clave)}`).digest('hex')
}

function firma(version: number): string {
  const base = process.env.KV_REST_API_TOKEN || process.env.AGENT_JWT_SECRET || ''
  if (!base) throw new Error('Ronda: falta el secreto para firmar el pase')
  const llave = createHmac('sha256', base).update('ronda-acceso-v1').digest()
  return createHmac('sha256', llave).update(String(version)).digest('base64url')
}

const iguales = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** El pase si la clave es la correcta; null si no. `sinClave` = todavía no se configuró ninguna. */
export async function pasePara(clave: unknown): Promise<{ pase: string | null; sinClave: boolean }> {
  const r = await registro(true)
  if (!r) return { pase: null, sinClave: true }
  const ok = iguales(huellaDeClave(String(clave ?? ''), r.sal), r.huella)
  return { pase: ok ? `${r.version}.${firma(r.version)}` : null, sinClave: false }
}

export async function tieneAcceso(req: Request): Promise<boolean> {
  const [version, sello, ...resto] = (req.headers.get('x-ronda-acceso') || '').split('.')
  if (!version || !sello || resto.length > 0) return false
  try {
    const r = await registro()
    return Boolean(r) && String(r?.version) === version && iguales(sello, firma(Number(version)))
  } catch {
    return false
  }
}

/** La respuesta para quien no trae el pase (o trae uno de una clave vieja); null si puede pasar. */
export async function sinAcceso(req: Request): Promise<NextResponse | null> {
  if (await tieneAcceso(req)) return null
  return NextResponse.json(
    { error: 'Ingresá la clave de acceso de la ronda.', acceso: true },
    { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
  )
}
