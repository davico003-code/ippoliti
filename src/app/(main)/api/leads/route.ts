import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'
import { normalizeArWhatsapp } from '@/lib/phone'

const MAX = 400 // tope de largo por campo antes de persistir/reenviar

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

export async function POST(request: NextRequest) {
  // Rate-limit anti-flood por IP (fail-open: si Redis falla, NO bloquea leads reales).
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'leads', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const apiKey = process.env.TOKKO_API_KEY

  const str = (v: unknown) => String(v ?? '').trim().slice(0, MAX)
  const nombre = str(body.nombre || body.name)
  const email = str(body.email)
  const whatsapp = str(body.whatsapp || body.phone)
  const origen = str(body.origen || body.source || 'web')

  // Validación básica. Alcanza UN dato de contacto: la consulta calificada de
  // una propiedad pide WhatsApp y no email (15-sep-2026).
  if (!nombre || nombre.length < 2) {
    return NextResponse.json({ error: 'Contanos tu nombre.' }, { status: 400 })
  }
  if (!email && !whatsapp) {
    return NextResponse.json({ error: 'Dejanos un WhatsApp o un email.' }, { status: 400 })
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  // Consulta calificada de una propiedad (/consulta/[slug]): qué propiedad, cómo
  // paga y para cuándo. El id del feed es el tokko_id salvo los 9000000xx, que
  // son propiedades cargadas directo en Hilo y viajan por su uuid.
  const esConsultaCalificada = origen === 'consulta_calificada'
  const propertyIdNum = Number(body.propertyId)
  const tokkoPropertyId = Number.isFinite(propertyIdNum) && propertyIdNum > 0 && propertyIdNum < 900_000_000 ? String(propertyIdNum) : null
  const hiloPropertyId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str(body.hiloPropertyId)) ? str(body.hiloPropertyId) : null
  const pageUrl = str(body.pageUrl)
  const utm = (() => {
    try {
      const p = new URL(pageUrl).searchParams
      const g = (k: string) => p.get(`utm_${k}`) || undefined
      const u = { utm_source: g('source'), utm_medium: g('medium'), utm_campaign: g('campaign'), utm_content: g('content') }
      return Object.values(u).some(Boolean) ? { ...u, captured_at: new Date().toISOString() } : null
    } catch {
      return null
    }
  })()

  // Guardar en Redis (destino de respaldo — nunca debería perderse un lead)
  let savedRedis = false
  try {
    const redis = getRedis()
    const ts = Date.now()
    const leadKey = `lead:${origen}:${ts}:${email || whatsapp}`
    const leadData = { nombre, email, whatsapp, origen, fecha: new Date().toISOString(), ...(esConsultaCalificada ? { propertyId: str(body.propertyId), pago: str(body.pago), plazo: str(body.plazo) } : {}) }

    await redis.set(leadKey, JSON.stringify(leadData))
    await redis.lpush('leads:all', JSON.stringify(leadData))
    savedRedis = true
  } catch (err) {
    console.error('[leads] Redis error:', err)
  }

  // Empujar el lead al inbox de Hilo (destino principal desde la migración).
  const isGuiaLead = origen === 'guia-comprador'
  const savedHilo = await pushLeadToHilo({
    name: nombre,
    email: email || null,
    phone: whatsapp,
    origen,
    message: isGuiaLead
      ? 'Lead desde Guía del Comprador 2026 — siinmobiliaria.com'
      : esConsultaCalificada
        ? `Consultó por ${str(body.propertyTitle) || 'una propiedad'} (${str(body.propertyPrice) || 'precio a consultar'}) desde la web · Paga: ${str(body.pago) || 'no dijo'} · Plazo: ${str(body.plazo) || 'no dijo'}`
        : `Operación: ${str(body.operation) || 'Venta'} | Tipo: ${str(body.propertyType) || 'Casa'} | Presupuesto: ${str(body.budget) || 'Sin límite'}`,
    ...(esConsultaCalificada ? { tokkoPropertyId, hiloPropertyId, sourceUrl: pageUrl || null, attribution: utm } : {}),
  })

  // Si el lead NO quedó en NINGÚN destino durable, es una pérdida real: avisar al
  // usuario para que reintente en vez de devolver un ok:true mentiroso.
  if (!savedRedis && !savedHilo) {
    console.error('[leads] LEAD PERDIDO: falló Redis y Hilo', { origen, email })
    return NextResponse.json(
      { error: 'No pudimos registrar tu consulta en este momento. Reintentá en unos segundos o escribinos por WhatsApp.' },
      { status: 502 },
    )
  }

  // Crear contacto en Tokko CRM (LEGACY best-effort; Tokko en desconexión)
  if (apiKey) {
    try {
      const isGuia = origen === 'guia-comprador'
      const tokkoPayload = {
        name: nombre,
        email: email,
        phone: whatsapp ? `+${normalizeArWhatsapp(whatsapp)}` : '',
        message: isGuia
          ? 'Lead desde Guía del Comprador 2026 — siinmobiliaria.com'
          : `Operación: ${body.operation || 'Venta'} | Tipo: ${body.propertyType || 'Casa'} | Presupuesto: ${body.budget || 'Sin límite'} | Fuente: Web siinmobiliaria.com`,
        source: isGuia ? 'Guia Comprador 2026' : 'Web',
        tags: isGuia ? ['guia-2026'] : [body.operation || 'Venta', body.propertyType || 'Casa'],
      }

      await fetch(
        `https://www.tokkobroker.com/api/v1/contact/?key=${apiKey}&format=json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokkoPayload),
        }
      )
    } catch (err) {
      console.warn('[leads] Tokko CRM error:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
