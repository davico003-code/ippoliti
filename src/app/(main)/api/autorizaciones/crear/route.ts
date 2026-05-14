// POST /api/autorizaciones/crear → crea una autorización de venta digital.
// Auth: header x-team-code (SI_TEAM_CODE).
// Body: payload completo según CrearInput de @/lib/autorizaciones.

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import {
  crearAutorizacion,
  type CrearInput,
  type TipoAutorizacion,
  type TipoPropiedad,
  type Servicios,
} from '@/lib/autorizaciones'

const TIPOS: TipoAutorizacion[] = ['exclusiva', 'no_exclusiva']
const TIPOS_PROPIEDAD: TipoPropiedad[] = [
  'casa', 'depto', 'ph', 'local', 'terreno', 'galpon', 'oficina', 'otro',
]

function getBaseUrl(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

function validateBody(body: unknown): { ok: true; data: CrearInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body inválido' }
  const b = body as Record<string, unknown>

  const tipo = b.tipo as TipoAutorizacion
  if (!TIPOS.includes(tipo)) return { ok: false, error: 'tipo inválido' }

  const plazo_dias = Number(b.plazo_dias)
  if (!Number.isFinite(plazo_dias) || plazo_dias < 30 || plazo_dias > 365) {
    return { ok: false, error: 'plazo_dias debe estar entre 30 y 365' }
  }

  const renovacion_automatica = Boolean(b.renovacion_automatica)

  const direccion = typeof b.direccion === 'string' ? b.direccion.trim() : ''
  if (direccion.length < 3) return { ok: false, error: 'direccion requerida' }

  const tipo_propiedad = b.tipo_propiedad as TipoPropiedad
  if (!TIPOS_PROPIEDAD.includes(tipo_propiedad)) {
    return { ok: false, error: 'tipo_propiedad inválido' }
  }

  const sRaw = (b.servicios || {}) as Record<string, unknown>
  const servicios: Servicios = {
    luz: Boolean(sRaw.luz),
    agua: Boolean(sRaw.agua),
    gas: Boolean(sRaw.gas),
    pavimento: Boolean(sRaw.pavimento),
    cloacas: Boolean(sRaw.cloacas),
  }

  const tiene_expensas = Boolean(b.tiene_expensas)
  let expensas_monto_ars: number | undefined
  if (tiene_expensas) {
    const n = Number(b.expensas_monto_ars)
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: 'expensas_monto_ars debe ser un número positivo' }
    }
    expensas_monto_ars = Math.round(n)
  }

  const parsePosNum = (v: unknown): number | undefined => {
    if (v == null || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : undefined
  }
  const precio_venta_usd = parsePosNum(b.precio_venta_usd)
  const precio_publicacion_usd = parsePosNum(b.precio_publicacion_usd)

  const cp = (b.cliente_precarga || {}) as Record<string, unknown>
  const cleanStr = (v: unknown): string | undefined => {
    if (typeof v !== 'string') return undefined
    const t = v.trim()
    return t.length > 0 ? t : undefined
  }

  return {
    ok: true,
    data: {
      tipo,
      plazo_dias: Math.round(plazo_dias),
      renovacion_automatica,
      direccion,
      tipo_propiedad,
      servicios,
      tiene_expensas,
      expensas_monto_ars,
      precio_venta_usd,
      precio_publicacion_usd,
      cliente_precarga: {
        nombre: cleanStr(cp.nombre),
        dni: cleanStr(cp.dni),
        email: cleanStr(cp.email),
      },
    },
  }
}

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const v = validateBody(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  try {
    const auth = await crearAutorizacion(v.data)
    const base = getBaseUrl(req)
    return NextResponse.json(
      {
        ok: true,
        slug: auth.slug,
        url: `${base}/autorizacion/${auth.slug}`,
        expires_at: auth.expires_at,
      },
      { status: 201 },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error creando autorización'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
