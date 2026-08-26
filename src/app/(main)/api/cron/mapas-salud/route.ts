// Cron diario de salud de los mapas del sitio.
//
// Nació del 26-ago-2026: Carto empezó a exigir API key y los 7 mapas del
// sitio estuvieron en producción con un watermark "API KEY REQUIRED" hasta
// que alguien lo vio de casualidad. Este centinela chequea a diario, como lo
// vería un visitante, que las tres fuentes de tiles están sanas:
//
//  1. Carto CON key (mapa de calles): responde 200 image/* y sus bytes
//     difieren del mismo tile SIN key. Si Carto invalida la key vuelve a
//     servir el tile watermarkeado — idéntico al sin-key — y eso dispara la
//     alerta aunque el status siga siendo 200.
//  2. Esri World_Imagery (vista satelital de /propiedades): 200 image/*.
//  3. OSM estándar (fallback de emergencia de map-tiles.ts): 200 image/*,
//     para saber que la red de contención está sana antes de necesitarla.
//
// Si algo falla, avisa por WhatsApp al admin. Los lunes manda un resumen OK
// como latido (si el cron dejara de correr, se nota por ausencia).
//
// Se puede disparar a mano: GET /api/cron/mapas-salud con Bearer CRON_SECRET.
// ?dry=1 → solo reporta, no notifica.

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

// Tile de Funes centro (z16) — el mismo encuadre que ve un visitante típico.
const TILE_CARTO = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/16/21692/39117@2x.png'
const TILE_ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/39117/21692'
const TILE_OSM = 'https://tile.openstreetmap.org/16/21692/39117.png'

async function fetchTile(url: string): Promise<{ ok: boolean; status: number; bytes: ArrayBuffer | null }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SI-mapas-salud/1.0', Accept: 'image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim()
    const bytes = res.ok ? await res.arrayBuffer() : null
    return { ok: res.ok && ct.startsWith('image/'), status: res.status, bytes }
  } catch {
    return { ok: false, status: 0, bytes: null }
  }
}

function iguales(a: ArrayBuffer | null, b: ArrayBuffer | null): boolean {
  if (!a || !b || a.byteLength !== b.byteLength) return false
  const va = new Uint8Array(a)
  const vb = new Uint8Array(b)
  for (let i = 0; i < va.length; i++) if (va[i] !== vb[i]) return false
  return true
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dry = req.nextUrl.searchParams.get('dry') === '1'
  const key = process.env.NEXT_PUBLIC_CARTO_KEY

  const problemas: string[] = []

  if (!key) {
    problemas.push('NEXT_PUBLIC_CARTO_KEY no está configurada (los mapas están cayendo al fallback OSM)')
  }

  const [cartoConKey, cartoSinKey, esri, osm] = await Promise.all([
    key ? fetchTile(`${TILE_CARTO}?key=${key}`) : Promise.resolve(null),
    fetchTile(TILE_CARTO),
    fetchTile(TILE_ESRI),
    fetchTile(TILE_OSM),
  ])

  if (key && cartoConKey) {
    if (!cartoConKey.ok) {
      problemas.push(`Carto con key no responde tiles (HTTP ${cartoConKey.status}) — los mapas de calles pueden estar rotos`)
    } else if (cartoSinKey.ok && iguales(cartoConKey.bytes, cartoSinKey.bytes)) {
      // Mismo tile con y sin key → la key no está teniendo efecto. Hoy eso
      // significa watermark en prod; si Carto liberó los tiles, falsa alarma
      // que se resuelve mirando el mapa una vez.
      problemas.push('El tile de Carto con key es IDÉNTICO al sin key — posible key invalidada / watermark en prod. Revisar siinmobiliaria.com/propiedades')
    }
  }
  if (!esri.ok) {
    problemas.push(`Esri satelital no responde (HTTP ${esri.status}) — la vista satélite de /propiedades puede estar rota`)
  }
  if (!osm.ok) {
    problemas.push(`OSM (fallback) no responde (HTTP ${osm.status}) — sin red de contención si Carto falla`)
  }

  const esLunes = new Date().getUTCDay() === 1
  if (!dry && (problemas.length > 0 || esLunes)) {
    try {
      const { enviarWhatsAppAdmin } = await import('@/agents/blog/lib/whatsapp')
      const msg = problemas.length > 0
        ? `🗺️ *Mapas del sitio: problema detectado*\n\n${problemas.map(p => `• ${p}`).join('\n')}`
        : '🗺️ Mapas del sitio: todo OK (Carto con key, Esri satelital y fallback OSM responden). Latido semanal.'
      await enviarWhatsAppAdmin(msg)
    } catch (err) {
      console.error('[mapas-salud] no se pudo notificar:', err)
    }
  }

  return NextResponse.json({
    ok: problemas.length === 0,
    problemas,
    chequeos: {
      cartoConKey: cartoConKey ? cartoConKey.status : 'sin key',
      cartoSinKey: cartoSinKey.status,
      esri: esri.status,
      osm: osm.status,
    },
  })
}
