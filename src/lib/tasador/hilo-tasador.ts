import 'server-only'
import type { ZonaHogar } from '@/lib/feed-en-red'
import type { Tasador } from './tipos'

// Los números del tasador por barrio y el catálogo de zonas, de Hilo, servidor
// a servidor. Una hora de cache (Hilo los rearma cada 6 h). Si no llegan, TIRA:
// las landings /tasar son ISR y así queda la última versión buena en vez de
// congelar una página sin números (la web no tiene Sentry: el vigía de Hilo
// salud-canales mira que /tasar/casa-funes muestre precios).

const BASE = (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')

export async function traerTasadorHilo(): Promise<Tasador> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) throw new Error('Falta HILO_INGEST_SECRET')
  const res = await fetch(`${BASE}/api/public/en-red/mercado`, {
    headers: { 'x-hilo-ingest-secret': secret },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`Hilo /mercado: HTTP ${res.status}`)
  const data = (await res.json()) as { tasador?: Tasador | null }
  const t = data.tasador
  if (!t || !Array.isArray(t.zonas) || !t.modelo) throw new Error('Hilo no mandó los números del tasador')
  return t
}

export async function traerZonasHilo(): Promise<ZonaHogar[]> {
  const res = await fetch(`${BASE}/api/public/en-red/zonas`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(15_000) })
  if (!res.ok) throw new Error(`Hilo /zonas: HTTP ${res.status}`)
  const data = (await res.json()) as { zonas?: ZonaHogar[] }
  const zonas = (data.zonas ?? []).filter((z) => z && typeof z.nombre === 'string')
  if (!zonas.length) throw new Error('Hilo devolvió el catálogo de zonas vacío')
  return zonas
}
