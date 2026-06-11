export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}
  const timestamp = new Date().toISOString()

  // 1. DÓLAR
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares', { cache: 'no-store' })
    const data = await res.json()
    results.dolar = {
      oficial: data.find((d: { casa: string }) => d.casa === 'oficial'),
      blue: data.find((d: { casa: string }) => d.casa === 'blue'),
      mep: data.find((d: { casa: string }) => d.casa === 'bolsa'),
      fetchedAt: timestamp,
    }
  } catch (e) {
    console.error('Dolar API error:', e)
  }

  // BCRA Estadísticas v4.0. La v4 vieja (/v4/monetarias/principales-variables)
  // devuelve 404 desde la migración del BCRA — por eso IPC/ICL/CAC quedaron
  // "Sin datos". IDs fijos del catálogo v4.0 (GET /estadisticas/v4.0/monetarias):
  //   27 → Variación mensual del índice de precios al consumidor
  //   40 → Índice para Contratos de Locación (base 30.6.20=1)
  // Shape v4.0: { results: [{ idVariable, detalle: [{fecha, valor}, ...] }] }
  // con detalle ordenado DESC (más nuevo primero).
  const fetchSerieBCRA = async (id: number, take: number) => {
    const res = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/${id}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`BCRA v4.0 serie ${id}: HTTP ${res.status}`)
    const json = await res.json()
    const detalle: { fecha: string; valor: number }[] = json.results?.[0]?.detalle || []
    // DESC → tomamos los `take` más recientes y los devolvemos ASC,
    // que es el orden que espera InformesDashboard (datos.at(-1) = último).
    return detalle.slice(0, take).reverse()
  }

  // 2. IPC INFLACIÓN — variación mensual, últimos 13 meses
  try {
    const datos = await fetchSerieBCRA(27, 13)
    results.ipc = { serieId: 27, descripcion: 'Variación mensual del índice de precios al consumidor', datos, fetchedAt: timestamp }
  } catch (e) {
    console.error('IPC API error:', e)
  }

  // 3. ICL — ÍNDICE CONTRATOS DE LOCACIÓN (serie diaria; últimos 13 valores,
  // el dashboard solo usa el más reciente y el de ~12 meses atrás vía slice)
  try {
    const datos = await fetchSerieBCRA(40, 13)
    results.icl = { datos, fetchedAt: timestamp }
  } catch (e) {
    console.error('ICL API error:', e)
  }

  // 4. CAC — COSTO DE CONSTRUCCIÓN: sin fuente pública automatizable hoy.
  // El BCRA nunca publicó el índice CAC (la búsqueda anterior por descripción
  // no matcheaba nada), y el ICC de INDEC en datos.gob.ar está discontinuado
  // (último dato 2015). Hasta definir fuente (carga manual vía admin o
  // Reporte Inmobiliario), results.cac no se escribe y el dashboard muestra
  // "Sin datos" solo en esa sección.

  // GUARDAR EN REDIS
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
    await redis.set('informes:data', JSON.stringify(results))
    await redis.set('informes:lastUpdate', timestamp)
  } catch (e) {
    console.error('Redis error:', e)
    return Response.json({ error: 'Redis save failed' }, { status: 500 })
  }

  return Response.json({ success: true, timestamp, keys: Object.keys(results) })
}
