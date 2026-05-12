import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_guia_token'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = match?.[1]

  if (!token) {
    return NextResponse.json({ acceso: false }, { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return NextResponse.json({
      acceso: true,
      nombre: payload.nombre,
      email: payload.email,
    })
  } catch {
    return NextResponse.json({ acceso: false }, { status: 401 })
  }
}
