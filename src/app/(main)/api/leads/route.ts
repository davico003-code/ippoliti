import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { pushLeadToHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'

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

  const body = await request.json()
  const apiKey = process.env.TOKKO_API_KEY

  const nombre = (body.nombre || body.name || '').trim()
  const email = (body.email || '').trim()
  const whatsapp = (body.whatsapp || body.phone || '').trim()
  const origen = (body.origen || body.source || 'web').trim()

  // Validación básica
  if (!nombre || nombre.length < 3) {
    return NextResponse.json({ error: 'Nombre debe tener mínimo 3 caracteres' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  // Guardar en Redis
  try {
    const redis = getRedis()
    const ts = Date.now()
    const leadKey = `lead:${origen}:${ts}:${email}`
    const leadData = { nombre, email, whatsapp, origen, fecha: new Date().toISOString() }

    await redis.set(leadKey, JSON.stringify(leadData))
    await redis.lpush('leads:all', JSON.stringify(leadData))
  } catch (err) {
    console.error('[leads] Redis error:', err)
  }

  // Empujar el lead al inbox de Hilo (best-effort; en paralelo a Tokko durante
  // la transición). Cuando esté validado, este push reemplaza a Tokko.
  const isGuiaLead = origen === 'guia-comprador'
  await pushLeadToHilo({
    name: nombre,
    email,
    phone: whatsapp,
    origen,
    message: isGuiaLead
      ? 'Lead desde Guía del Comprador 2026 — siinmobiliaria.com'
      : `Operación: ${body.operation || 'Venta'} | Tipo: ${body.propertyType || 'Casa'} | Presupuesto: ${body.budget || 'Sin límite'}`,
  })

  // Crear contacto en Tokko CRM (best-effort)
  if (apiKey) {
    try {
      const isGuia = origen === 'guia-comprador'
      const tokkoPayload = {
        name: nombre,
        email: email,
        phone: whatsapp ? `+54${whatsapp.replace(/\D/g, '')}` : '',
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
