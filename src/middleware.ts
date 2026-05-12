import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_agent_token'

// Hosts neutros que sirven la ficha white-label. Se rewrite-an internamente al
// route group (neutral)/v/[slug]. Cualquier path que no matchee el patrón de
// slug se rewrite-a a /v/__nf__ que dispara not-found.tsx neutro.
const NEUTRAL_HOSTS = new Set(['verficha.casa', 'www.verficha.casa'])

// Slug = 8 chars del alfabeto sin ambiguos. NO incluye '/'.
const SLUG_RE = /^\/[A-Za-z0-9]{8}$/

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0]
  const { pathname } = request.nextUrl

  // ── verficha.casa: solo /{slug} es válido ──────────────────────────────
  if (NEUTRAL_HOSTS.has(host)) {
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
  ],
}
