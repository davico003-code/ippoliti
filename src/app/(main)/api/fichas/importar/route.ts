// Importa una propiedad externa (Zonaprop) y la convierte en una ficha PROPIA de
// verficha.casa. Flujo automático: el agente pega la URL → acá scrapeamos vía
// Microlink (que pasa el Cloudflare de Zonaprop) y minteamos la ficha. Devuelve
// el link verficha listo.
//
// Las fotos se usan DIRECTO del CDN de Zonaprop (imgar.zonapropcdn.com) — su CDN
// no restringe hotlink y así evitamos el re-host (más rápido y se ven siempre).
// HeroGallery las renderiza unoptimized (ver isExternalCdn).
//
// Acepta overrides manuales opcionales (titulo, precioRaw, etc.) para corregir o
// para el fallback cuando el scraping no alcanza.
//
// Seguridad: SOLO agentes autenticados (cookie si_agent_token).

import { NextRequest, NextResponse } from 'next/server'
import { verifyAgentToken } from '@/lib/auth'
import { crearFichaExterna, type FichaExternaInput } from '@/lib/ficha'
import { fetchZonaprop, isZonapropUrl } from '@/lib/zonaprop'
import { fetchArgenprop, isArgenpropUrl } from '@/lib/argenprop'
import { fetchMercadolibre, isMercadolibreUrl } from '@/lib/mercadolibre'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // el scraping vía Microlink puede tardar ~30s

const MAX_FOTOS = 20

function toNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

// Coordenadas: a diferencia de toNum, acepta NEGATIVOS (Argentina está en lat/lng
// negativas) y valida el rango. Devuelve null si no es una coord plausible.
function toCoord(v: unknown, max: number): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) && n !== 0 && Math.abs(n) <= max ? n : null
}

export async function POST(req: NextRequest) {
  // ── Auth ──
  const token = req.cookies.get('si_agent_token')?.value
  const agent = token ? await verifyAgentToken(token) : null
  if (!agent) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const sourceUrl = String(body.url ?? body.sourceUrl ?? '').trim()
  if (!/^https?:\/\//i.test(sourceUrl)) {
    return NextResponse.json({ error: 'Pegá una URL válida' }, { status: 400 })
  }
  // Anti-SSRF: rechazar hosts internos/privados (no restringimos a un portal
  // específico para no romper imports de avisos de colegas).
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase()
    const isPrivate =
      host === 'localhost' || host === '0.0.0.0' || host === '[::1]' ||
      host.endsWith('.local') || host.endsWith('.internal') ||
      /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^169\.254\./.test(host)
    if (isPrivate) {
      return NextResponse.json({ error: 'URL no permitida' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  // ── Lectura automática por portal: Zonaprop (Microlink) · Argenprop (fetch
  //    directo) · MercadoLibre (API de items con token). Cada uno cae a null si
  //    no puede leer → carga manual. ──
  const scraped = isZonapropUrl(sourceUrl)
    ? await fetchZonaprop(sourceUrl)
    : isArgenpropUrl(sourceUrl)
      ? await fetchArgenprop(sourceUrl)
      : isMercadolibreUrl(sourceUrl)
        ? await fetchMercadolibre(sourceUrl)
        : null

  // Overrides manuales (corrección o fallback). Solo pisan si vienen presentes.
  const ov = (body.manual ?? {}) as Record<string, unknown>
  const has = (k: string) => ov[k] !== undefined && ov[k] !== ''
  const pick = (k: string, fb: string) =>
    has(k) ? String(ov[k]).trim() : (scraped?.[k as keyof typeof scraped] as string) ?? fb
  const pickNum = (k: string) =>
    has(k) ? toNum(ov[k]) : ((scraped?.[k as keyof typeof scraped] as number | null) ?? null)

  // La carga manual arma "una placa con foto y datos" — NO exige título: si el
  // agente no lo tipea, lo derivamos de la zona ("Propiedad en Funes"). Solo
  // frenamos si no hay NADA útil (ni scrape, ni ningún dato manual).
  const hayDatoManual = has('zona') || has('precioRaw') || (Array.isArray(ov.fotos) && ov.fotos.length > 0)
  let titulo = pick('titulo', '').slice(0, 200)
  if (!titulo && !scraped && !hayDatoManual) {
    return NextResponse.json(
      { error: 'No se pudo leer el aviso (el portal puede estar lento o bloqueando). Reintentá o cargá los datos a mano.' },
      { status: 422 },
    )
  }
  if (!titulo) {
    const zonaFb = pick('zona', '').trim()
    titulo = zonaFb ? `Propiedad en ${zonaFb}` : 'Propiedad'
  }

  // Fotos: del scraping + adicionales manuales. Se usan directo (sin re-host).
  const fotosManual = Array.isArray(ov.fotos) ? (ov.fotos as unknown[]).map(String) : []
  const fotos = [...(scraped?.fotos ?? []), ...fotosManual]
    .filter(u => /^https:\/\//i.test(u))
    .slice(0, MAX_FOTOS)

  const manual: FichaExternaInput = {
    titulo,
    descripcion: pick('descripcion', '').slice(0, 5000),
    fotos,
    operacion: pick('operacion', 'Venta').slice(0, 40),
    tipo: pick('tipo', 'Propiedad').slice(0, 60),
    precioRaw: pickNum('precioRaw') ?? 0,
    moneda: pick('moneda', 'USD').slice(0, 8),
    zona: pick('zona', '').slice(0, 120),
    m2cubiertos: pickNum('m2cubiertos'),
    m2terreno: pickNum('m2terreno'),
    ambientes: pickNum('ambientes'),
    dormitorios: pickNum('dormitorios'),
    banos: pickNum('banos'),
    cocheras: pickNum('cocheras'),
    // Coords del portal si las trae (ej. Argenprop embebe lat/lng), o del
    // override manual. Si faltan, crearFichaExterna las geocodifica desde la zona.
    lat: has('lat') ? toCoord(ov.lat, 90) : toCoord((scraped as Record<string, unknown> | null)?.lat, 90),
    lng: has('lng') ? toCoord(ov.lng, 180) : toCoord((scraped as Record<string, unknown> | null)?.lng, 180),
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  try {
    const { slug, url, snapshot } = await crearFichaExterna({
      manual,
      sourceUrl,
      ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    const card = {
      title: snapshot.tituloGenerico,
      image: snapshot.fotos[0] || null,
      location: snapshot.zonaAprox,
      price: snapshot.precio && snapshot.precio !== 'Consultar' ? snapshot.precio : null,
      rooms: snapshot.dormitorios || 0,
      baths: snapshot.banos || 0,
      area: snapshot.m2cubiertos || snapshot.m2terreno || 0,
    }

    return NextResponse.json({ slug, url, snapshot: card, fotos: snapshot.fotos.length })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear la ficha' }, { status: 500 })
  }
}
