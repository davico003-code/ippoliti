import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { Redis } from '@upstash/redis'
import { destinoDeBaja, type DatosBaja } from '@/lib/propiedad-baja'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET || '')
const COOKIE_NAME = 'si_agent_token'

// Cliente Upstash directo: mismo SDK y env vars que @/lib/redis, pero sin
// importar ese módulo para no arrastrar nanoid al bundle edge del middleware.
// Leer con hgetall (mismo SDK que el hset de la escritura) garantiza
// serialización idéntica, sin riesgo de comillas JSON en el destino.
const redisEdge = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Cache en memoria del mapa de notas borradas (blog:redirects). 10 min: los
// soft-deletes del blog son eventos raros, y cada expiración es un comando
// Redis por instancia edge — con el tráfico de crawlers sobre /blog/* el TTL
// de 60s comía cuota de Upstash (límite mensual agotado el 25-ago-2026).
let _redirCache: { map: Record<string, string>; ts: number } | null = null
const REDIR_TTL_MS = 600_000

async function getBlogRedirects(): Promise<Record<string, string>> {
  if (_redirCache && Date.now() - _redirCache.ts < REDIR_TTL_MS) return _redirCache.map
  try {
    const map = (await redisEdge.hgetall<Record<string, string>>('blog:redirects')) ?? {}
    _redirCache = { map, ts: Date.now() }
    return map
  } catch {
    return _redirCache?.map ?? {}
  }
}

// ── Fichas de propiedades dadas de baja ─────────────────────────────────
// /propiedades/{id}-{slug} de una propiedad que ya no está publicada respondía
// 200 con "Propiedad no encontrada" (el notFound() de esa ruta no llega a
// cambiar el estado). Acá, antes de renderizar: 301 al listado más parecido
// (misma operación + tipo + localidad) o 410 si no hay con qué armarlo.
// NUNCA se redirige por sospecha: solo cuando la propiedad no está en el
// listado publicado Y Hilo responde 404 por ESA propiedad. Si falta cualquiera
// de las dos señales (Hilo caído, lista vacía), la ficha sigue de largo.
const FICHA_RE = /^\/propiedades\/([^/]+)$/
const HILO_BASE = (process.env.HILO_FEED_URL || 'https://meethilo.com').replace(/\/$/, '')
const IDS_TTL_MS = 300_000
const IDS_MAX_MS = 3_600_000
const FICHA_TTL_MS = 300_000

let _ids: { set: Set<number>; ts: number } | null = null
let _idsIntento = 0
// Lo que Hilo dijo de cada id que no está en la lista: publicada, o dada de baja (con sus datos, si los manda).
const _fichas = new Map<number, { viva: boolean; baja: DatosBaja | null; ts: number }>()

/**
 * Los ids publicados hoy, o null si no hay una lista sana (no se pudo pedir, o
 * vino vacía, y la última buena tiene más de una hora). Sin lista NO se
 * redirige nada: hacen falta las dos señales —no está en el listado Y Hilo
 * responde 404 por ella— para dar de baja una URL.
 */
async function idsPublicados(origin: string): Promise<Set<number> | null> {
  const ahora = Date.now()
  if (_ids && ahora - _ids.ts < IDS_TTL_MS) return _ids.set
  // Un intento por minuto como mucho, aunque falle.
  if (ahora - _idsIntento > 60_000) {
    _idsIntento = ahora
    try {
      const res = await fetch(`${origin}/api/propiedades/ids`, { signal: AbortSignal.timeout(2500) })
      const data = res.ok ? ((await res.json()) as { ids?: number[] }) : null
      if (Array.isArray(data?.ids) && data.ids.length > 0) _ids = { set: new Set(data.ids), ts: ahora }
    } catch {
      // se sigue con la última lista buena, si no es vieja
    }
  }
  return _ids && ahora - _ids.ts < IDS_MAX_MS ? _ids.set : null
}

/** null = dejar pasar la ficha. */
async function fichaDadaDeBaja(request: NextRequest, slug: string): Promise<NextResponse | null> {
  if ((process.env.DATA_SOURCE || '').toLowerCase() !== 'hilo') return null
  // El mismo criterio que getIdFromSlug: el número del principio.
  const id = parseInt(slug.split('-')[0], 10)
  if (Number.isNaN(id)) return noEncontrada(request)
  const publicados = await idsPublicados(request.nextUrl.origin)
  if (!publicados || publicados.has(id)) return null

  let ficha = _fichas.get(id)
  if (!ficha || Date.now() - ficha.ts > FICHA_TTL_MS) {
    try {
      const res = await fetch(`${HILO_BASE}/api/public/propiedades/${id}`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        // Publicada (y todavía no está en la lista): se recuerda para no preguntar en cada visita.
        ficha = { viva: true, baja: null, ts: Date.now() }
      } else if (res.status === 404) {
        const data = (await res.json().catch(() => null)) as { baja?: DatosBaja | null } | null
        ficha = { viva: false, baja: data?.baja ?? null, ts: Date.now() }
      } else {
        return null
      }
    } catch {
      return null
    }
    if (_fichas.size > 2000) _fichas.clear()
    _fichas.set(id, ficha)
  }
  if (ficha.viva) return null
  const destino = destinoDeBaja(ficha.baja, slug)
  if (!destino) return yaNoEsta(request)
  // max-age corto: si la propiedad vuelve a publicarse, el navegador no se queda con el redirect.
  return NextResponse.redirect(new URL(destino, request.url), { status: 301, headers: { 'Cache-Control': 'public, max-age=3600' } })
}

// Página que solo hace notFound(): el "no encontrada" del sitio ("Esta página
// no existe · la propiedad puede haber sido vendida", con el link al listado).
const RUTA_NO_ENCONTRADA = '/no-encontrada'

/** 404 con la página "no encontrada" del sitio. */
function noEncontrada(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = RUTA_NO_ENCONTRADA
  url.search = ''
  return NextResponse.rewrite(url)
}

/**
 * 410 (Gone) con la misma página. Un rewrite no deja cambiar el estado (sale
 * 404), así que se pide la página y se devuelve con 410. Si no se puede pedir
 * (un preview protegido), va un HTML mínimo: el estado es lo que importa.
 */
async function yaNoEsta(request: NextRequest): Promise<NextResponse> {
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=0, must-revalidate' }
  try {
    const res = await fetch(new URL(RUTA_NO_ENCONTRADA, request.url), { signal: AbortSignal.timeout(3000) })
    if (res.status === 404 && (res.headers.get('content-type') ?? '').includes('text/html')) {
      return new NextResponse(res.body, { status: 410, headers })
    }
  } catch {
    // sigue al HTML mínimo
  }
  return new NextResponse(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Esta propiedad ya no está disponible | SI INMOBILIARIA</title></head>' +
      '<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:18vh auto;padding:0 24px;text-align:center;color:#121A15"><h1 style="font-size:1.6rem">Esta propiedad ya no está disponible</h1>' +
      '<p style="color:#5B6B62">Puede haber sido vendida o alquilada.</p><p><a href="/propiedades" style="color:#17613C;font-weight:700">Ver las propiedades disponibles</a></p></body></html>',
    { status: 410, headers },
  )
}

// Hosts neutros que sirven la ficha white-label. Se rewrite-an internamente al
// route group (neutral)/v/[slug]. Cualquier path que no matchee el patrón de
// slug se rewrite-a a /v/__nf__ que dispara not-found.tsx neutro.
const NEUTRAL_HOSTS = new Set(['verficha.casa', 'www.verficha.casa'])

// Slug = 8 chars del alfabeto sin ambiguos. NO incluye '/'.
const SLUG_RE = /^\/[A-Za-z0-9]{8}$/

// Paths well-known de icono a neutralizar en hosts white-label. /favicon.ico
// (.svg, -96x96.png) se sirve estático desde public/ = logo SI; WhatsApp hace
// fallback a ese path ignorando el <link> de la página. Reescribimos al icono neutro.
const NEUTRAL_ICON_RE = /^\/(favicon\.ico|favicon\.svg|favicon-96x96\.png|apple-touch-icon\.png|icon\.png)$/

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0]
  const { pathname } = request.nextUrl

  // ── verficha.casa: solo /{slug} es válido ──────────────────────────────
  if (NEUTRAL_HOSTS.has(host)) {
    // Favicon neutro: nunca servir branding SI ni en el well-known path.
    if (NEUTRAL_ICON_RE.test(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/verficha-icon.svg'
      return NextResponse.rewrite(url)
    }
    // Endpoints API permitidos en el dominio neutro (ficha white-label):
    // - /api/audio/check        → el AudioPlayer consulta si hay audio cacheado
    // - /api/colega/feedback    → feedback anónimo de colegas
    // - /api/colega/compartida  → cuenta los toques en "Compartir" de la ficha
    // - /api/image-proxy        → fotos de avisos externos (Argenprop bloquea el
    //                             hotlink; HeroGallery/OG las piden por acá). Sin
    //                             esta excepción caían en not-found y la ficha
    //                             compartida al cliente se veía sin fotos.
    // El resto de /api sigue cayendo en not-found para no exponer APIs branded de SI.
    if (
      pathname === '/api/audio/check' ||
      pathname === '/api/colega/feedback' ||
      pathname === '/api/colega/compartida' ||
      pathname === '/api/image-proxy'
    ) {
      return NextResponse.next()
    }
    if (SLUG_RE.test(pathname)) {
      const slug = pathname.slice(1)
      const url = request.nextUrl.clone()
      url.pathname = `/v/${slug}`
      return NextResponse.rewrite(url)
    }
    // Cualquier otro path bajo el host neutro → not-found neutro.
    // __nf__ no matchea el alfabeto del slug real, así getFicha() devolverá
    // null y page.tsx llamará notFound() en el commit B; mientras tanto el
    // stub muestra el placeholder, lo cual es aceptable durante el move.
    const url = request.nextUrl.clone()
    url.pathname = '/v/__nf__'
    return NextResponse.rewrite(url)
  }

  // ── Blog: 301 de notas borradas (soft-delete vía blog:redirects) ───────
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.slice('/blog/'.length)
    if (slug && !slug.includes('/')) {
      const destino = (await getBlogRedirects())[slug]
      if (destino) {
        const target = destino.startsWith('http')
          ? destino
          : new URL(destino, request.url).toString()
        return NextResponse.redirect(target, 301)
      }
    }
  }

  // ── Fichas de propiedades dadas de baja: 301 al listado parecido o 410 ──
  const ficha = FICHA_RE.exec(pathname)
  if (ficha) {
    const respuesta = await fichaDadaDeBaja(request, ficha[1])
    if (respuesta) return respuesta
  }

  // ── siinmobiliaria.com: lógica original de protección /agentes/* ───────
  if (!pathname.startsWith('/agentes')) return NextResponse.next()
  if (pathname === '/agentes/login') return NextResponse.next()
  if (pathname.startsWith('/api/agentes/')) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/agentes/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const response = NextResponse.next()
    response.headers.set('x-agent-id', payload.id as string)
    response.headers.set('x-agent-name', payload.name as string)
    response.headers.set('x-agent-role', payload.role as string)
    return response
  } catch {
    return NextResponse.redirect(new URL('/agentes/login', request.url))
  }
}

// Matcher amplio: corre en TODO menos assets estáticos. Necesario porque
// debemos detectar el host neutro en cualquier path, no solo bajo /agentes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif|woff2?|map|txt|xml)$).*)',
    '/favicon.ico',
    '/favicon.svg',
    '/favicon-96x96.png',
    '/apple-touch-icon.png',
  ],
}
