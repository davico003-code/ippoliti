// API admin para un carrusel específico.
//
//   GET    → devuelve CarruselPublicado desde Redis
//   POST   → dispatch de acciones: { action: 'approve' | 'regenerate' }
//
// Auth: header x-admin-password validado contra el env (SI_TEAM_CODE /
// ADMIN_PASSWORD). Mismo patrón que /admin/leads. Sin literal en el repo.

import { NextResponse } from 'next/server'
import {
  ejecutarOrquestador,
  leerRegistro,
  marcarAprobado,
} from '@/agents/placas/lib/orquestador'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SI_TEAM_CODE || ''

function unauthorized(req: Request): boolean {
  const pwd = req.headers.get('x-admin-password')
  return !ADMIN_PASSWORD || pwd !== ADMIN_PASSWORD
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const registro = await leerRegistro(params.slug)
  if (!registro) {
    return NextResponse.json(
      { error: `no hay placas registradas para slug "${params.slug}"` },
      { status: 404 },
    )
  }
  return NextResponse.json({ registro })
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json-body' }, { status: 400 })
  }

  if (body.action === 'approve') {
    const ok = await marcarAprobado(params.slug)
    if (!ok) {
      return NextResponse.json(
        { error: 'no existe registro para ese slug' },
        { status: 404 },
      )
    }
    return NextResponse.json({ ok: true, accion: 'approve', slug: params.slug })
  }

  if (body.action === 'regenerate') {
    const result = await ejecutarOrquestador({ slug: params.slug })
    return NextResponse.json(result, { status: result.ok ? 200 : 500 })
  }

  return NextResponse.json(
    { error: `action desconocida: ${body.action ?? '(ninguna)'}` },
    { status: 400 },
  )
}
