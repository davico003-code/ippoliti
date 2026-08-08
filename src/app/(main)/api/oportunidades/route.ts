// API del popup de Oportunidades.
//
//   GET    → público: lista para el popup (datos ya snapshoteados, sin PII).
//   POST   → admin: agrega { propertyId, hook } (resuelve la propiedad en
//            Tokko/Hilo y snapshotea título/foto/precio/slug).
//   DELETE → admin: ?id=<propertyId> saca una oportunidad de la lista.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import {
  listOportunidades,
  saveOportunidades,
  HOOKS,
  MAX_OPORTUNIDADES,
  type Hook,
  type Oportunidad,
} from '@/lib/oportunidades'
import {
  getPropertyById,
  sanitizeProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  esOportunidadConsultanos,
} from '@/lib/tokko'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function isAdmin(): Promise<boolean> {
  const token = cookies().get('si_agent_token')?.value
  if (!token) return false
  const agent = await verifyAgentToken(token)
  return agent?.role === 'admin'
}

// Las fotos snapshoteadas pueden ser URLs firmadas de Supabase Storage que
// vencen a los ~7 días (JWT en ?token=). Para que el popup no quede con
// imágenes rotas, el GET re-resuelve el snapshot cuando la firma está por
// vencer (o ya venció) y lo persiste de vuelta en Redis.
const REFRESH_MARGIN_MS = 24 * 60 * 60 * 1000

function fotoExpira(foto: string | null): number | null {
  if (!foto) return null
  try {
    const token = new URL(foto).searchParams.get('token')
    if (!token) return null // URL pública (Tokko CDN): no vence
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

async function refrescarSnapshot(item: Oportunidad): Promise<Oportunidad | null> {
  try {
    const prop = sanitizeProperty(await getPropertyById(item.propertyId))
    let pctBaja = item.pctBaja
    if (item.precioAnterior) {
      const anterior = Number(item.precioAnterior.replace(/[^\d]/g, ''))
      const actual = Number(prop.operations?.[0]?.prices?.[0]?.price)
      if (Number.isFinite(anterior) && anterior > 0 && Number.isFinite(actual) && actual > 0 && anterior > actual) {
        pctBaja = Math.round(((anterior - actual) / anterior) * 1000) / 10
      }
    }
    return {
      ...item,
      titulo: prop.publication_title || prop.fake_address || prop.address || item.titulo,
      foto: getMainPhoto(prop),
      precio: formatPrice(prop),
      ...(item.precioAnterior ? { pctBaja } : {}),
      href: `/propiedades/${generatePropertySlug(prop)}`,
    }
  } catch {
    return null
  }
}

export async function GET() {
  const items = await listOportunidades()

  let cambio = false
  const frescos = await Promise.all(
    items.map(async (item) => {
      const exp = fotoExpira(item.foto)
      if (exp === null || exp - Date.now() > REFRESH_MARGIN_MS) return item
      const nuevo = await refrescarSnapshot(item)
      if (nuevo) {
        cambio = true
        return nuevo
      }
      // No se pudo re-resolver: si la firma ya venció, mejor sin foto que rota.
      return exp < Date.now() ? { ...item, foto: null } : item
    }),
  )
  if (cambio) {
    try { await saveOportunidades(frescos) } catch {}
  }

  // Las oportunidades "Consultanos" no publican monto tampoco acá: el snapshot
  // puede tener el precio viejo guardado, así que se enmascara en la respuesta.
  const publicos = frescos.map((item) =>
    esOportunidadConsultanos(item.propertyId)
      ? { ...item, precio: 'Consultanos', precioAnterior: undefined, pctBaja: undefined }
      : item,
  )

  return NextResponse.json(
    { items: publicos },
    { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const propertyId = Number(body?.propertyId)
  const hook = body?.hook as Hook
  if (!Number.isFinite(propertyId) || propertyId <= 0 || !HOOKS.includes(hook)) {
    return NextResponse.json({ error: 'propertyId y hook válidos requeridos' }, { status: 400 })
  }

  const items = await listOportunidades()
  if (items.some((i) => i.propertyId === propertyId)) {
    return NextResponse.json({ error: 'Esa propiedad ya está en la lista' }, { status: 409 })
  }
  if (items.length >= MAX_OPORTUNIDADES) {
    return NextResponse.json(
      { error: `Máximo ${MAX_OPORTUNIDADES} oportunidades — borrá una primero` },
      { status: 409 },
    )
  }

  let prop
  try {
    prop = sanitizeProperty(await getPropertyById(propertyId))
  } catch {
    return NextResponse.json({ error: 'No se encontró esa propiedad' }, { status: 404 })
  }

  // "Bajó el precio" necesita el precio anterior (numérico) para tacharlo y
  // calcular el % de baja contra el precio publicado actual.
  let precioAnterior: string | undefined
  let pctBaja: number | undefined
  if (hook === 'bajo-precio') {
    const anterior = Number(body?.precioAnterior)
    const actualOp = prop.operations?.[0]?.prices?.[0]
    const actual = Number(actualOp?.price)
    if (!Number.isFinite(anterior) || anterior <= 0) {
      return NextResponse.json({ error: 'Ingresá el precio anterior (número) para "Bajó el precio"' }, { status: 400 })
    }
    if (!Number.isFinite(actual) || actual <= 0 || anterior <= actual) {
      return NextResponse.json({ error: 'El precio anterior tiene que ser mayor al publicado actual' }, { status: 400 })
    }
    const currency = actualOp?.currency || 'USD'
    precioAnterior = `${currency} ${anterior.toLocaleString('es-AR')}`
    pctBaja = Math.round(((anterior - actual) / anterior) * 1000) / 10
  }

  const nueva = {
    propertyId,
    hook,
    titulo: prop.publication_title || prop.fake_address || prop.address || `Propiedad ${propertyId}`,
    foto: getMainPhoto(prop),
    precio: formatPrice(prop),
    ...(precioAnterior ? { precioAnterior, pctBaja } : {}),
    href: `/propiedades/${generatePropertySlug(prop)}`,
    createdAt: Date.now(),
  }
  await saveOportunidades([...items, nueva])
  return NextResponse.json({ ok: true, item: nueva })
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = Number(new URL(req.url).searchParams.get('id'))
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const items = await listOportunidades()
  await saveOportunidades(items.filter((i) => i.propertyId !== id))
  return NextResponse.json({ ok: true })
}
