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
  //   27 → Variación MENSUAL del IPC (ya es %, no índice)
  //   28 → Variación INTERANUAL del IPC (ya es %)
  //   40 → Índice para Contratos de Locación (base 30.6.20=1) — serie DIARIA
  // Shape v4.0: { results: [{ idVariable, detalle: [{fecha, valor}, ...] }] }
  // con detalle ordenado DESC (más nuevo primero). Acepta ?desde=&hasta=.
  const fetchSerieBCRA = async (id: number, desdeMeses: number) => {
    const desde = new Date()
    desde.setMonth(desde.getMonth() - desdeMeses)
    // hasta 31 días adelante: el ICL se publica con fechas futuras (se conoce
    // por anticipado); sin el margen perderíamos los valores más nuevos.
    const hasta = new Date()
    hasta.setDate(hasta.getDate() + 31)
    const url = `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/${id}?desde=${desde.toISOString().split('T')[0]}&hasta=${hasta.toISOString().split('T')[0]}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`BCRA v4.0 serie ${id}: HTTP ${res.status}`)
    const json = await res.json()
    const detalle: { fecha: string; valor: number }[] = json.results?.[0]?.detalle || []
    // DESC → ASC, que es el orden que espera InformesDashboard (at(-1) = último)
    return detalle.reverse()
  }

  // Serie diaria → un valor por mes (el último disponible de cada mes), para
  // que los gráficos y tablas mensuales del dashboard tengan sentido.
  const mensualizar = (datos: { fecha: string; valor: number }[]) => {
    const porMes = new Map<string, { fecha: string; valor: number }>()
    for (const d of datos) porMes.set(d.fecha.slice(0, 7), d) // ASC → queda el último del mes
    return Array.from(porMes.values())
  }

  // 2. IPC INFLACIÓN — serie 27 ya viene como variación mensual en % (el
  //    dashboard la grafica directo, sin recalcular sobre el valor). La 28
  //    aporta la interanual oficial para el titular "acumulada 12 meses".
  try {
    const datos = (await fetchSerieBCRA(27, 14)).slice(-13)
    const interanualSerie = await fetchSerieBCRA(28, 3)
    results.ipc = {
      serieId: 27,
      descripcion: 'Variación mensual del índice de precios al consumidor',
      tipo: 'variacion_mensual_pct',
      datos,
      interanual: interanualSerie.at(-1) ?? null,
      fetchedAt: timestamp,
    }
  } catch (e) {
    console.error('IPC API error:', e)
  }

  // 3. ICL — serie diaria 40, mensualizada a los últimos 13 cierres de mes
  //    (el dashboard compara at(-1) contra at(-13) para la variación anual).
  //    `ultimo` conserva el valor diario más reciente.
  try {
    const diarios = await fetchSerieBCRA(40, 14)
    const datos = mensualizar(diarios).slice(-13)
    results.icl = { datos, ultimo: diarios.at(-1) ?? null, fetchedAt: timestamp }
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
