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

  // 2. IPC INFLACIÓN — BCRA v4
  try {
    const variablesRes = await fetch('https://api.bcra.gob.ar/estadisticas/v4/monetarias/principales-variables', { cache: 'no-store' })
    const variables = await variablesRes.json()
    const ipcVar = variables.results?.find((v: { descripcion?: string }) =>
      v.descripcion?.toLowerCase().includes('índice de precios al consumidor') ||
      v.descripcion?.toLowerCase().includes('ipc nivel general')
    )
    if (ipcVar) {
      const desde = new Date()
      desde.setMonth(desde.getMonth() - 13)
      const serieRes = await fetch(
        `https://api.bcra.gob.ar/estadisticas/v4/monetarias/principales-variables/${ipcVar.idVariable}/datos?desde=${desde.toISOString().split('T')[0]}&hasta=${new Date().toISOString().split('T')[0]}`,
        { cache: 'no-store' }
      )
      const serie = await serieRes.json()
      results.ipc = { serieId: ipcVar.idVariable, descripcion: ipcVar.descripcion, datos: serie.results?.slice(-13) || [], fetchedAt: timestamp }
    }
  } catch (e) {
    console.error('IPC API error:', e)
  }

  // 3. ICL — ÍNDICE CONTRATOS DE LOCACIÓN (serie 7988)
  try {
    const desde = new Date()
    desde.setMonth(desde.getMonth() - 13)
    const iclRes = await fetch(
      `https://api.bcra.gob.ar/estadisticas/v4/monetarias/principales-variables/7988/datos?desde=${desde.toISOString().split('T')[0]}&hasta=${new Date().toISOString().split('T')[0]}`,
      { cache: 'no-store' }
    )
    const iclData = await iclRes.json()
    results.icl = { datos: iclData.results?.slice(-13) || [], fetchedAt: timestamp }
  } catch (e) {
    console.error('ICL API error:', e)
  }

  // 4. CAC — COSTO DE CONSTRUCCIÓN
  try {
    const variablesRes = await fetch('https://api.bcra.gob.ar/estadisticas/v4/monetarias/principales-variables', { cache: 'no-store' })
    const variables = await variablesRes.json()
    const cacVar = variables.results?.find((v: { descripcion?: string }) =>
      v.descripcion?.toLowerCase().includes('cac') ||
      v.descripcion?.toLowerCase().includes('cámara argentina de la construcción') ||
      v.descripcion?.toLowerCase().includes('costo de la construcción')
    )
    if (cacVar) {
      const desde = new Date()
      desde.setMonth(desde.getMonth() - 13)
      const serieRes = await fetch(
        `https://api.bcra.gob.ar/estadisticas/v4/monetarias/principales-variables/${cacVar.idVariable}/datos?desde=${desde.toISOString().split('T')[0]}&hasta=${new Date().toISOString().split('T')[0]}`,
        { cache: 'no-store' }
      )
      const serie = await serieRes.json()
      results.cac = { serieId: cacVar.idVariable, descripcion: cacVar.descripcion, datos: serie.results?.slice(-13) || [], fetchedAt: timestamp }
    }
  } catch (e) {
    console.error('CAC API error:', e)
  }

  // GUARDAR EN REDIS
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.set('informes:data', JSON.stringify(results))
    await redis.set('informes:lastUpdate', timestamp)
  } catch (e) {
    console.error('Redis error:', e)
    return Response.json({ error: 'Redis save failed' }, { status: 500 })
  }

  return Response.json({ success: true, timestamp, keys: Object.keys(results) })
}
