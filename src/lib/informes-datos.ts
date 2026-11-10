// Los indicadores de /informes (dólar, IPC, ICL, dólar histórico) que el cron
// /api/indices/update deja en Redis (`informes:data`), leídos en el SERVER.
//
// Va por el REST de Upstash con `next.revalidate` y NO con el cliente
// `@upstash/redis`: ese cliente pide con cache 'no-store' y vuelve dinámica la
// página ("Page changed from static to dynamic at runtime"). Mismo patrón que
// cercanosGuardados en lib/cercanos.ts.

export interface DatoSerie { fecha: string; valor: number }
export interface DolarEntry { compra: number; venta: number; nombre: string; fechaActualizacion: string }
export interface InformesData {
  dolar?: { oficial?: DolarEntry; blue?: DolarEntry; mep?: DolarEntry; fetchedAt: string }
  /** ipc.datos: serie 27 BCRA — cada valor YA es la variación mensual en %. interanual: serie 28. */
  ipc?: { datos: DatoSerie[]; interanual?: DatoSerie | null; fetchedAt: string }
  /** icl.datos: serie 40 BCRA mensualizada (último valor de cada mes). */
  icl?: { datos: DatoSerie[]; ultimo?: DatoSerie | null; fetchedAt: string }
  cac?: { datos: DatoSerie[]; fetchedAt: string }
  /** dolarHistorico.datos: serie 4 BCRA (oficial minorista) mensualizada. */
  dolarHistorico?: { datos: DatoSerie[]; fetchedAt: string }
}

export interface InformesGuardados { data: InformesData; lastUpdate: string | null }

const sinComillas = (s: string) => s.replace(/^"|"$/g, '')

export async function informesGuardados(): Promise<InformesGuardados | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const leer = async (clave: string): Promise<string | null> => {
    const r = await fetch(`${url}/get/${encodeURIComponent(clave)}`, {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    })
    if (!r.ok) return null
    const { result } = (await r.json()) as { result: string | null }
    return result ?? null
  }
  try {
    const [crudo, lastUpdate] = await Promise.all([leer('informes:data'), leer('informes:lastUpdate')])
    if (!crudo) return null
    const data = (typeof crudo === 'string' ? JSON.parse(crudo) : crudo) as InformesData
    return { data, lastUpdate: lastUpdate ? sinComillas(lastUpdate) : null }
  } catch {
    return null
  }
}

/* ── Cuentas chicas, compartidas por el resumen del server ── */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "septiembre de 2026" de 'YYYY-MM-DD' (sin new Date: en UTC-3 el día 1 caía en el mes anterior). */
export function mesDe(fecha: string): string {
  const [y, m] = fecha.split('-')
  const nombre = MESES[Number(m) - 1]
  return nombre ? `${nombre} de ${y}` : fecha
}

/** Variación % entre el último valor de la serie y el de 12 meses atrás; null si la serie no llega. */
export function variacion12(datos: DatoSerie[] | undefined): number | null {
  if (!datos || datos.length < 13) return null
  const ult = datos[datos.length - 1]
  const hace12 = datos[datos.length - 13]
  if (!ult || !hace12 || !hace12.valor) return null
  return ((ult.valor - hace12.valor) / hace12.valor) * 100
}

export const pesos = (x: number) => `$ ${Math.round(x).toLocaleString('es-AR')}`
export const porcentaje = (x: number, decimales = 1) => `${x.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} %`
