// GET /api/ficha/list → lista TODAS las fichas activas con stats y días
//                       restantes para el panel /fichas. Requiere x-team-code
//                       (antes filtraba todas las fichas + IPs sin auth).

import { NextResponse } from 'next/server'
import { listFichas } from '@/lib/ficha'
import { assertTeamCode } from '@/lib/team-auth'

function diasRestantes(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export async function GET(req: Request) {
  const denied = assertTeamCode(req)
  if (denied) return denied
  try {
    const fichas = await listFichas()
    const items = fichas.map(f => ({
      slug: f.slug,
      propertyId: f.propertyId,
      notas: f.notas,
      createdAt: f.createdAt,
      expiresAt: f.expiresAt,
      revokedAt: f.revokedAt,
      diasRestantes: diasRestantes(f.expiresAt),
      generadoDesde: f.generadoDesde,
      stats: f.stats,
      preview: {
        titulo: f.snapshot.tituloGenerico,
        precio: f.snapshot.precio,
        thumb: f.snapshot.fotos[0] || f.snapshot.ogImage || null,
        zonaAprox: f.snapshot.zonaAprox,
        operacion: f.snapshot.operacion,
      },
    }))
    return NextResponse.json({ ok: true, fichas: items })
  } catch {
    return NextResponse.json({ error: 'Error listando fichas' }, { status: 500 })
  }
}
