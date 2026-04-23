import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { updateSession } from '@/lib/supabase/middleware'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_agent_token'

export async function middleware(request: NextRequest) {
  // 1. Refresh de sesión Supabase (toda ruta matcheada).
  //    Devuelve un response listo con cookies actualizadas. Lo usamos como base
  //    si la legacy auth no necesita redirigir.
  const supabaseResponse = await updateSession(request)

  const { pathname } = request.nextUrl

  // 2. Auth legacy JWT — solo /agentes/* (panel viejo SI INMOBILIARIA).
  //    Es independiente de Supabase y se mantiene mientras esa sección
  //    no se migre al nuevo esquema multi-tenant.
  if (pathname.startsWith('/agentes')
      && pathname !== '/agentes/login'
      && !pathname.startsWith('/api/agentes/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/agentes/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, SECRET)
      // Propagamos los headers sobre el response que ya trae las cookies de Supabase
      supabaseResponse.headers.set('x-agent-id', payload.id as string)
      supabaseResponse.headers.set('x-agent-name', payload.name as string)
      supabaseResponse.headers.set('x-agent-role', payload.role as string)
    } catch {
      return NextResponse.redirect(new URL('/agentes/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  // Matcher amplio — necesario para que Supabase pueda refrescar sesión en
  // cualquier ruta. Excluye assets de Next y archivos estáticos comunes.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css)$).*)',
  ],
}
