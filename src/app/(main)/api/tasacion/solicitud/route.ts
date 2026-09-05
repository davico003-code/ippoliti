import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'
import { esMockTasacion, TIPOS_TASACION } from '@/lib/tasacion/hilo'
import { celularArValido, fmtMiles, normalizarCelularAr, TEXTO_TIPO } from '@/lib/tasacion/formato'
import type { NivelComparables, TasacionLead, TipoTasacion, UtmTasacion } from '@/lib/tasacion/types'

// POST /api/tasacion/solicitud — el pedido de tasación de la web.
// Mismo patrón que /api/leads: rate limit por IP, respaldo best-effort en Redis
// y push server-to-server a Hilo (origen 'tasacion'). Responde ok:true SOLO si
// Hilo aceptó el lead; si no, 502 con texto humano para que la persona reintente.
export const dynamic = 'force-dynamic'

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const num = (v: unknown): number | null => {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}
const numEn = (v: unknown, min: number, max: number): number | null => {
  const n = num(v)
  return n != null && n >= min && n <= max ? n : null
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

function leerTasacion(raw: unknown): TasacionLead | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Record<string, unknown>
  const tipo = str(t.tipo, 10).toLowerCase() as TipoTasacion
  if (!TIPOS_TASACION.includes(tipo)) return null
  const barrioNombre = str(t.barrioNombre, 80)
  if (!barrioNombre) return null

  const rg = t.rangoVisto && typeof t.rangoVisto === 'object' ? (t.rangoVisto as Record<string, unknown>) : null
  const min = rg ? numEn(rg.min, 0, 1e9) : null
  const max = rg ? numEn(rg.max, 0, 1e9) : null
  const nivelNum = numEn(t.nivel, 1, 4)
  const nivel = (nivelNum ? Math.trunc(nivelNum) : 4) as NivelComparables

  const u = t.utm && typeof t.utm === 'object' ? (t.utm as Record<string, unknown>) : null
  const utm: UtmTasacion | null = u
    ? {
        source: str(u.source, 100) || null,
        medium: str(u.medium, 100) || null,
        campaign: str(u.campaign, 150) || null,
        content: str(u.content, 150) || null,
      }
    : null

  const paginaUrl = str(t.paginaUrl, 500)
  const lat = numEn(t.lat, -90, 90)
  const lng = numEn(t.lng, -180, 180)

  return {
    barrioId: str(t.barrioId, 64),
    barrioNombre,
    ciudad: str(t.ciudad, 40),
    esCerrado: typeof t.esCerrado === 'boolean' ? t.esCerrado : null,
    tipo,
    m2Cubiertos: numEn(t.m2Cubiertos, 1, 100000),
    m2Lote: numEn(t.m2Lote, 1, 10000000),
    rangoVisto: min != null && max != null && max >= min ? { min, max } : null,
    nivel,
    n: Math.max(0, Math.trunc(numEn(t.n, 0, 100000) ?? 0)),
    lat: lat != null && lng != null ? lat : null,
    lng: lat != null && lng != null ? lng : null,
    utm: utm && (utm.source || utm.medium || utm.campaign || utm.content) ? utm : null,
    paginaUrl: /^https?:\/\//.test(paginaUrl) ? paginaUrl : 'https://siinmobiliaria.com/tasaciones',
  }
}

/** Resumen corto para el inbox de Hilo (lo lee el agente de un vistazo). */
function armarBrief(t: TasacionLead): string {
  const tipo = TEXTO_TIPO[t.tipo].singular
  const Tipo = tipo[0].toUpperCase() + tipo.slice(1)
  const partes = [`Tasación web · ${Tipo} en ${t.barrioNombre}${t.ciudad ? ` (${t.ciudad})` : ''}`]
  if (t.m2Lote) partes.push(`lote ${fmtMiles(t.m2Lote)} m²`)
  if (t.m2Cubiertos) partes.push(`${fmtMiles(t.m2Cubiertos)} m² cub.`)
  if (t.rangoVisto) {
    const unidad = t.tipo === 'lote' && t.rangoVisto.max < 5000 ? '/m²' : ''
    partes.push(`vio USD ${fmtMiles(t.rangoVisto.min)}–${fmtMiles(t.rangoVisto.max)}${unidad} (nivel ${t.nivel}, ${t.n} comparables)`)
  } else {
    partes.push('sin rango (nivel 4: pocos comparables)')
  }
  if (t.utm?.source) partes.push(`origen ${t.utm.source}${t.utm.campaign ? ` / ${t.utm.campaign}` : ''}`)
  return partes.join(' · ')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'tasacion', 6, 60))) {
    return NextResponse.json(
      { error: 'Demasiados envíos seguidos. Esperá un momento y volvé a intentar.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  // Honeypot: un humano nunca ve ni completa este campo. Si viene con algo,
  // respondemos como si todo hubiera salido bien y no registramos nada.
  if (str(body.website, 200)) return NextResponse.json({ ok: true })

  const nombre = str(body.nombre, 80)
  const celular = normalizarCelularAr(str(body.whatsapp, 40))
  if (nombre.length < 2) {
    return NextResponse.json({ error: 'Contanos tu nombre para saber a quién escribirle.' }, { status: 400 })
  }
  if (!celularArValido(celular)) {
    return NextResponse.json(
      { error: 'Revisá el WhatsApp: son 10 dígitos con el código de área (341, 3476…), sin el 15.' },
      { status: 400 },
    )
  }
  const tasacion = leerTasacion(body.tasacion)
  if (!tasacion) {
    return NextResponse.json({ error: 'Falta el barrio o el tipo de propiedad. Volvé al paso 1.' }, { status: 400 })
  }

  const phone = `+549${celular}`
  const brief = armarBrief(tasacion)

  // Respaldo en Redis: si Hilo falla, el pedido no se pierde igual.
  try {
    const redis = getRedis()
    const ts = Date.now()
    const leadData = { nombre, whatsapp: phone, origen: 'tasacion', brief, tasacion, fecha: new Date(ts).toISOString() }
    await redis.set(`lead:tasacion:${ts}:${celular}`, JSON.stringify(leadData))
    await redis.lpush('leads:all', JSON.stringify(leadData))
  } catch (err) {
    console.error('[tasacion] Redis error:', err)
  }

  let aceptado = await pushLeadToHilo({
    name: nombre,
    phone,
    origen: 'tasacion',
    message: brief,
    tasacion,
  })

  // Solo en desarrollo con mock y sin secreto: simulamos la aceptación para
  // poder recorrer el flujo completo. En producción esto nunca aplica.
  if (!aceptado && esMockTasacion() && process.env.NODE_ENV !== 'production' && !process.env.HILO_INGEST_SECRET) {
    console.info('[tasacion] MOCK: solicitud simulada como aceptada —', brief)
    aceptado = true
  }

  if (!aceptado) {
    console.error('[tasacion] Hilo no aceptó el pedido', { barrio: tasacion.barrioNombre, nivel: tasacion.nivel })
    return NextResponse.json(
      { error: 'No pudimos enviar tu pedido. Probá de nuevo en unos segundos; tus datos quedan cargados.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
