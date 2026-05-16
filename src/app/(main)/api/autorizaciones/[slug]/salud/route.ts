// PATCH /api/autorizaciones/[slug]/salud
//
// Reemplaza el objeto salud completo del acuerdo (interno). Auth: header
// x-team-code. Setea actualizada_en + actualizada_por automáticamente:
//   - actualizada_por usa auth.agente_creador si existe, sino "Equipo SI"
//
// Validaciones:
//   - escritura/boleto/planos: solo 'si' | 'no' | null
//   - mensura: solo 'si' | 'no' | 'na' | null
//   - planos_notas: string, recortado a 1000 chars
//   - extras: 4 booleanos (impuestos, servicios, reglamento, libre_deuda)

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import {
  actualizarSalud,
  getAutorizacion,
  type Salud,
  type SaludRespuestaSiNo,
  type SaludRespuestaSiNoNa,
} from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]{10}$/

function isSiNo(v: unknown): v is SaludRespuestaSiNo {
  return v === 'si' || v === 'no' || v === null || v === undefined
}

function isSiNoNa(v: unknown): v is SaludRespuestaSiNoNa {
  return v === 'si' || v === 'no' || v === 'na' || v === null || v === undefined
}

function normalizeSiNo(v: unknown): SaludRespuestaSiNo {
  if (v === 'si' || v === 'no') return v
  return null
}

function normalizeSiNoNa(v: unknown): SaludRespuestaSiNoNa {
  if (v === 'si' || v === 'no' || v === 'na') return v
  return null
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = params.slug
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
  }

  const auth = await getAutorizacion(slug)
  if (!auth) {
    return NextResponse.json({ error: 'Acuerdo no encontrado' }, { status: 404 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Validar shape estricto (rechaza valores inválidos en lugar de coercer silente)
  if (!isSiNo(body.escritura)) return NextResponse.json({ error: 'escritura inválida' }, { status: 400 })
  if (!isSiNo(body.boleto)) return NextResponse.json({ error: 'boleto inválido' }, { status: 400 })
  if (!isSiNo(body.planos)) return NextResponse.json({ error: 'planos inválido' }, { status: 400 })
  if (!isSiNoNa(body.mensura)) return NextResponse.json({ error: 'mensura inválida' }, { status: 400 })

  const notasRaw = typeof body.planos_notas === 'string' ? body.planos_notas : ''
  const extras = (body.extras || {}) as Record<string, unknown>

  const salud: Salud = {
    escritura: normalizeSiNo(body.escritura),
    boleto: normalizeSiNo(body.boleto),
    planos: normalizeSiNo(body.planos),
    planos_notas: notasRaw.slice(0, 1000),
    mensura: normalizeSiNoNa(body.mensura),
    extras: {
      impuestos: !!extras.impuestos,
      servicios: !!extras.servicios,
      reglamento: !!extras.reglamento,
      libre_deuda: !!extras.libre_deuda,
    },
    actualizada_en: new Date().toISOString(),
    actualizada_por: auth.agente_creador ?? 'Equipo SI',
  }

  try {
    const updated = await actualizarSalud(slug, salud)
    if (!updated) {
      return NextResponse.json({ error: 'No encontrado tras la escritura' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, salud })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error guardando salud'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
