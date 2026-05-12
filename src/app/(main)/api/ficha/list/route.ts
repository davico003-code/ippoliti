// GET /api/ficha/list → lista TODAS las fichas activas con stats y días
//                       restantes para el panel /fichas. Requiere X-Team-Code.
//
// Devuelve un payload "delgado" optimizado para tabla — sin notas internas
// (que sí están en la key Redis pero no son útiles en el listado), pero sí con
// generadoDesde para auditoría visual rápida.

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'
import { listFichas } from '@/lib/ficha'

function diasRestantes(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export async function GET(req: Request) {
  const block = requireTeamCode(req)
  if (block) return block

  try {
    const fichas = await listFichas()
    const items = fichas.map(f => ({
      slug: f.slug,
      propertyId: f.propertyId,
      colega: f.colega,
      notas: f.notas,
      createdAt: f.createdAt,
      expiresAt: f.expiresAt,
      revokedAt: f.revokedAt,
      diasRestantes: diasRestantes(f.expiresAt),
      generadoDesde: f.generadoDesde,
      stats: f.stats,
      // Datos del snapshot que el panel usa para el thumbnail/título de fila
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
