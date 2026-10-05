import { NextRequest, NextResponse } from 'next/server'
import { getProperties, priorizarOperacion, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import {
  type FeedEnRed,
  type ItemFeed,
  TIPOS_HOGAR,
  barrioHogarValido,
  dormMinValido,
  enZonaBuscada,
  entraEnBarrio,
  entraEnDorm,
  esBarrioConNombre,
  entraEnTope,
  esTipoHogar,
  itemDeEnRed,
} from '@/lib/feed-en-red'
import { itemDeNuestra } from '@/lib/mazo-items'
import { rateLimit } from '@/lib/feedback'

// "Conocé tu próximo hogar" (home, David 3-oct-2026): el mazo de una búsqueda
// — dónde, qué y hasta cuánto — sin ficha de referencia. Primero las nuestras
// de esa zona (sello verde) y después las "En red" que elige Hilo (mismo
// barrio o misma ciudad, las más vistas primero). Solo venta en dólares.
// GET ?zona=Funes%20Lakes&tipo=house&tope=200000&dorm=3 → { zona, items }
// (`dorm` = dormitorios o más, opcional; en lotes no filtra)
// `&barrio=cerrado|abierto` (opcional; sin él, me da igual; solo al buscar una ciudad)

/** Cuántas nuestras como mucho (así también entran las En red). */
const MAX_NUESTRAS = 8

type Respuesta = { zona: string; items: ItemFeed[] }

async function enRedDeHilo(zona: string, tipo: string, tope: number | null, dorm: number | null, barrio: string | null): Promise<FeedEnRed> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return { barrio: zona, tarjetas: [] }
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  const p = new URLSearchParams({ zona, tipo })
  if (tope) p.set('tope', String(tope))
  if (dorm) p.set('dorm', String(dorm))
  if (barrio) p.set('barrio', barrio)
  try {
    const res = await fetch(`${base}/api/public/en-red?${p.toString()}`, {
      headers: { 'x-hilo-ingest-secret': secret },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as FeedEnRed
    return Array.isArray(data?.tarjetas) ? data : { barrio: zona, tarjetas: [] }
  } catch (e) {
    console.warn('[hogar] en-red', e instanceof Error ? e.message : e)
    // Sin En red el mazo sigue con las nuestras.
    return { barrio: zona, tarjetas: [] }
  }
}

/** Precio de venta en dólares (una propiedad puede estar en venta y alquiler). */
function precioVentaUsd(p: TokkoProperty): number | null {
  const venta = (p.operations ?? []).find((o) => o.operation_type === 'Sale')
  const precio = venta?.prices?.find((x) => x.currency === 'USD' && x.price > 0)
  return precio?.price ?? null
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const zona = (sp.get('zona') ?? '').trim().slice(0, 80)
  const tipo = sp.get('tipo') ?? 'house'
  const topeNum = Number(sp.get('tope'))
  const tope = Number.isFinite(topeNum) && topeNum > 0 ? Math.round(topeNum) : null
  const dorm = tipo === 'lot' ? null : dormMinValido(sp.get('dorm'))
  // Si eligió un barrio con nombre, el barrio ya dice si es cerrado.
  const barrio = esBarrioConNombre(zona) ? null : barrioHogarValido(sp.get('barrio'))
  if (!zona || !esTipoHogar(tipo)) return NextResponse.json({ error: 'zona y tipo requeridos' }, { status: 400 })
  // Público y con el secreto de Hilo detrás: el CDN sirve lo repetido; esto frena
  // a quien pruebe zonas al azar para saltear el cache.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'hogar', 40, 60))) {
    return NextResponse.json({ error: 'Demasiadas búsquedas seguidas' }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
  }
  const ids = new Set(TIPOS_HOGAR.find((t) => t.id === tipo)!.tokkoIds)

  const [todas, red] = await Promise.all([
    getProperties()
      .then((d) => (d.objects ?? []).map(sanitizeProperty))
      .catch(() => [] as TokkoProperty[]),
    enRedDeHilo(zona, tipo, tope, dorm, barrio),
  ])

  const nuestras = todas
    .filter((p) => ids.has(p.type?.id ?? -1))
    .map((p) => ({ p, precio: precioVentaUsd(p) }))
    .filter(
      ({ p, precio }) =>
        entraEnTope(precio, tope) &&
        // Mismo dato que muestra la tarjeta del mazo (itemDeNuestra).
        entraEnDorm(p.suite_amount || p.room_amount || null, dorm) &&
        entraEnBarrio(p.barrio_cerrado, barrio) &&
        enZonaBuscada(zona, { nombre: p.location?.name, completa: p.location?.full_location }),
    )
    // Destacadas primero; con tope, lo mejor que le alcanza (más cerca del tope).
    .sort((a, b) => Number(b.p.is_starred_on_web) - Number(a.p.is_starred_on_web) || (tope ? b.precio! - a.precio! : 0))
    .map(({ p }) => itemDeNuestra(priorizarOperacion(p, 'Sale')))
    .filter((i) => i.fotos.length > 0)
    .slice(0, MAX_NUESTRAS)

  // Hilo ya filtra por dormitorios; esto cubre el rato en que todavía no lo hace.
  const enRed = red.tarjetas.filter((t) => entraEnDorm(t.dormitorios, dorm)).map(itemDeEnRed)
  const body: Respuesta = { zona, items: [...nuestras, ...enRed] }
  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${body.items.length ? 900 : 120}, stale-while-revalidate=86400` },
  })
}
