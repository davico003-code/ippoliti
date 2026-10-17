import { NextRequest, NextResponse } from 'next/server'
import { guardarQr, listarQr } from '@/lib/qr-links'

export const dynamic = 'force-dynamic'

// Mismo esquema que /api/admin/leads: la clave viaja en un header y se compara
// server-side contra el env. Nada de literales en el código.
const PASSWORD = process.env.ADMIN_PASSWORD || process.env.SI_TEAM_CODE || ''

function autorizado(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-password')
  return Boolean(PASSWORD) && auth === PASSWORD
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const links = await listarQr()
    return NextResponse.json({ links })
  } catch (err) {
    console.error('[api/admin/qr]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const slug = String(body.slug ?? '').trim().toLowerCase()
  const nombre = String(body.nombre ?? '').trim()
  const destino = String(body.destino ?? '').trim()
  try {
    await guardarQr({ slug, nombre, destino })
    const links = await listarQr()
    return NextResponse.json({ ok: true, links })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo guardar'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
