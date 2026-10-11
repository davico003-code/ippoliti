import 'server-only'
import type { Tasador, ZonaMercado } from './tipos'

// Los números del tasador por barrio, de Hilo, servidor a servidor. Una hora de cache (Hilo los rearma cada 6 h). Si no llegan, TIRA:
// las landings /tasar y /vender son ISR y así queda la última versión buena en vez de
// congelar una página sin números (la web no tiene Sentry: el vigía de Hilo
// salud-canales mira que /tasar/casa-funes muestre precios).
// En la misma respuesta viene lo que se pide hoy en cada zona (`zonas`): las
// landings de vender lo muestran. Es opcional: si no viene, no se muestra.

const BASE = (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')

export async function traerMercadoHilo(): Promise<{ tasador: Tasador; mercado: ZonaMercado[]; leido: Date | null }> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) throw new Error('Falta HILO_INGEST_SECRET')
  const res = await fetch(`${BASE}/api/public/en-red/mercado`, {
    headers: { 'x-hilo-ingest-secret': secret },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`Hilo /mercado: HTTP ${res.status}`)
  const data = (await res.json()) as { tasador?: Tasador | null; zonas?: ZonaMercado[] | null }
  const t = data.tasador
  if (!t || !Array.isArray(t.zonas) || !t.modelo) throw new Error('Hilo no mandó los números del tasador')
  // Cuándo respondió Hilo de verdad: el encabezado Date viaja con la respuesta
  // guardada en cache, así que si Hilo deja de responder la fecha NO avanza sola
  // (la página no dice "actualizado hoy" con números de la semana pasada).
  const fecha = Date.parse(res.headers.get('date') ?? '')
  return { tasador: t, mercado: Array.isArray(data.zonas) ? data.zonas : [], leido: Number.isNaN(fecha) ? null : new Date(fecha) }
}
