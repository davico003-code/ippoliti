import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { Redis } from '@upstash/redis'

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

// Cache en memoria (~60s) del mapa de notas borradas (blog:redirects).
let _redirCache: { map: Record<string, string>; ts: number } | null = null
const REDIR_TTL_MS = 60_000

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
    // - /api/image-proxy        → fotos de avisos externos (Argenprop bloquea el
    //                             hotlink; HeroGallery/OG las piden por acá). Sin
    //                             esta excepción caían en not-found y la ficha
    //                             compartida al cliente se veía sin fotos.
    // El resto de /api sigue cayendo en not-found para no exponer APIs branded de SI.
    if (
      pathname === '/api/audio/check' ||
      pathname === '/api/colega/feedback' ||
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
