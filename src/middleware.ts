import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_agent_token'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /agentes routes (except login and auth API)
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

export const config = {
  matcher: ['/agentes/:path*'],
}
