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
  masCercanas,
  puntoCercaValido,
  type PuntoCerca,
} from '@/lib/feed-en-red'
import { distanceToProperty } from '@/lib/geo'
import { itemDeNuestra } from '@/lib/mazo-items'
import { resolverUbicacion } from '@/lib/ubicacion'
import { rateLimit } from '@/lib/feedback'

// "Conocé tu próximo hogar" (home, David 3-oct-2026): el mazo de una búsqueda
// — dónde, qué y qué precio — sin ficha de referencia. Primero las nuestras
// de esa zona (sello verde) y después las "En red" que elige Hilo (mismo
// barrio o misma ciudad, las más vistas primero). Solo venta en dólares.
// GET ?zona=Funes%20Lakes&tipo=house&tope=200000&dorm=3 → { zona, items }
// (`tope` = el precio elegido: entra ±20 %, 250 mil → 200 a 300 mil — David 5-oct)
// (`dorm` = dormitorios o más, opcional; en lotes no filtra)
// `&barrio=cerrado|abierto` (opcional; sin él, me da igual; solo al buscar una ciudad)
// "Cerca mío" (David 5-oct): `?cerca=<lat>,<lng>` en vez de `zona` → las 40 más
// cercanas hasta 15 km, nuestras y de colegas mezcladas, cada una con
// `distanciaM`; `zona` de la respuesta = la ciudad de la más cercana (la
// consulta y el mail la usan como su zona). Sin cache: cada punto es distinto,
// y el punto no se guarda ni se loguea.

/** Cuántas nuestras como mucho. Sin tope chico (David 5-oct: "no sé por qué tiene tope de 24"). */
const MAX_NUESTRAS = 40

type Respuesta = { zona: string; items: ItemFeed[] }

/** `fallo`: Hilo no respondió (no es lo mismo que "no hay de colegas"). */
type EnRed = FeedEnRed & { fallo?: boolean }

async function enRedDeHilo(
  donde: { zona: string } | { cerca: PuntoCerca },
  tipo: string,
  tope: number | null,
  dorm: number | null,
  barrio: string | null,
): Promise<EnRed> {
  const zona = 'zona' in donde ? donde.zona : null
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return { barrio: zona, tarjetas: [] }
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  const p = new URLSearchParams('zona' in donde ? { zona: donde.zona, tipo } : { cerca: `${donde.cerca.lat},${donde.cerca.lng}`, tipo })
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
    return { barrio: zona, tarjetas: [], fallo: true }
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
  const cerca = puntoCercaValido(sp.get('cerca'))
  const tipo = sp.get('tipo') ?? 'house'
  const topeNum = Number(sp.get('tope'))
  const tope = Number.isFinite(topeNum) && topeNum > 0 ? Math.round(topeNum) : null
  const dorm = tipo === 'lot' ? null : dormMinValido(sp.get('dorm'))
  // Si eligió un barrio con nombre, el barrio ya dice si es cerrado.
  const barrio = !cerca && esBarrioConNombre(zona) ? null : barrioHogarValido(sp.get('barrio'))
  if ((!zona && !cerca) || !esTipoHogar(tipo)) return NextResponse.json({ error: 'zona (o cerca) y tipo requeridos' }, { status: 400 })
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
    enRedDeHilo(cerca ? { cerca } : { zona }, tipo, tope, dorm, barrio),
  ])

  const candidatas = todas
    .filter((p) => ids.has(p.type?.id ?? -1))
    .map((p) => ({ p, precio: precioVentaUsd(p) }))
    .filter(
      ({ p, precio }) =>
        entraEnTope(precio, tope) &&
        // Mismo dato que muestra la tarjeta del mazo (itemDeNuestra).
        entraEnDorm(p.suite_amount || p.room_amount || null, dorm) &&
        entraEnBarrio(p.barrio_cerrado, barrio),
    )
  // Hilo ya filtra por dormitorios; esto cubre el rato en que todavía no lo hace.
  const tarjetasRed = red.tarjetas.filter((t) => entraEnDorm(t.dormitorios, dorm))

  if (cerca) {
    const ciudadDe = new Map<string, string | null>()
    const nuestrasCerca = candidatas.map(({ p }) => {
      const item = itemDeNuestra(priorizarOperacion(p, 'Sale'))
      ciudadDe.set(item.key, resolverUbicacion(p).ciudad)
      const km = distanceToProperty(p, cerca.lat, cerca.lng)
      return { ...item, distanciaM: km == null ? null : Math.round(km * 1000) }
    })
    for (const t of tarjetasRed) ciudadDe.set(t.id, t.ciudad ?? null)
    const items = masCercanas([...nuestrasCerca, ...tarjetasRed.map(itemDeEnRed)].filter((i) => i.fotos.length > 0))
    // Sin nuestras cerca y Hilo caído: es un fallo (la pantalla ofrece Reintentar), no "no hay casas a 15 km".
    if (items.length === 0 && red.fallo) return NextResponse.json({ error: 'No se pudo buscar' }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
    const body: Respuesta = { zona: (items[0] && ciudadDe.get(items[0].key)) || '', items }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
  }

  const nuestras = candidatas
    .filter(({ p }) => enZonaBuscada(zona, { nombre: p.location?.name, completa: p.location?.full_location }))
    // Destacadas primero; con precio, la más parecida al que eligió (entra ±20 %).
    .sort(
      (a, b) =>
        Number(b.p.is_starred_on_web) - Number(a.p.is_starred_on_web) ||
        (tope ? Math.abs(Math.log(a.precio! / tope)) - Math.abs(Math.log(b.precio! / tope)) : 0),
    )
    .map(({ p }) => itemDeNuestra(priorizarOperacion(p, 'Sale')))
    .filter((i) => i.fotos.length > 0)
    .slice(0, MAX_NUESTRAS)

  const enRed = tarjetasRed.map(itemDeEnRed)
  const body: Respuesta = { zona, items: [...nuestras, ...enRed] }
  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${body.items.length ? 900 : 120}, stale-while-revalidate=86400` },
  })
}
