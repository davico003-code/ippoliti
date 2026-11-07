import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { enviarLeadAHilo } from '@/lib/hilo-leads'
import { attributionDeUrl } from '@/lib/pauta-visita'
import { rateLimit } from '@/lib/feedback'
import { normalizeArWhatsapp } from '@/lib/phone'
import { metaDeLaConsulta } from '@/lib/meta-capi'
import { celularArValido, normalizarCelularAr } from '@/lib/tasacion/formato'

const MAX = 400 // tope de largo por campo antes de persistir/reenviar
// leads:all es el panel de respaldo (api/admin/leads lee los últimos 500 y el de
// newsletter los últimos 1000): con tope, la lista no crece para siempre.
const TOPE_LEADS_ALL = 4999
// Tokko está desconectado (julio 2026): el POST legacy no puede colgar la
// consulta. Con tope corto y en paralelo con Hilo, no suma espera.
const TOKKO_TIMEOUT_MS = 3000

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

  // Honeypot (mismo campo que el pedido de tasación): un humano nunca ve ni
  // completa `website`. Si viene con algo, ok y no registramos nada (ni Redis,
  // ni Hilo, que se lo mandaría a Meta como Lead).
  if (str(body.website)) return NextResponse.json({ ok: true })

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
  // "Pedí que te contactemos" de la ficha (4-oct-2026): nombre + WhatsApp de una propiedad.
  const esPedirContacto = origen === 'pedir_contacto'
  // "WhatsApp con datos" de la ficha (16-oct-2026): el que viene de la pauta deja
  // nombre + celular antes de que se le abra el chat; la respuesta trae el
  // WhatsApp del agente que Hilo le asignó.
  const esWhatsappFicha = origen === 'whatsapp_ficha'
  const esDePropiedad = esConsultaCalificada || esPedirContacto || esWhatsappFicha

  // Teléfono normalizado en el servidor, igual que el pedido de tasación
  // (+549 + 10 dígitos): a Hilo le llega UN formato, venga del form que venga.
  // Solo se rechaza en los formularios cuya pantalla ya pide un celular
  // argentino y muestra el error (consulta calificada y "Pedí que te
  // contactemos"). El resto (landings con compradores de afuera, popups, el
  // WhatsApp de la ficha, que abre el chat igual aunque esto falle) pasa con el
  // número como vino: perder un lead es peor que un teléfono feo.
  const cel = whatsapp ? normalizarCelularAr(whatsapp) : ''
  const celValido = celularArValido(cel)
  if (whatsapp && !celValido && (esConsultaCalificada || esPedirContacto)) {
    return NextResponse.json(
      { error: 'Revisá el WhatsApp: son 10 dígitos con el código de área (341, 3476…), sin el 15.' },
      { status: 400 },
    )
  }
  const telefono = celValido ? `+549${cel}` : whatsapp
  // En los alquileres la consulta calificada pregunta garantía y mudanza en vez
  // de forma de pago y plazo (mismos campos pago/plazo, otra etiqueta).
  const esAlquiler = str(body.operacion).toLowerCase().startsWith('alquiler')
  // El id del feed tal cual: Hilo resuelve el tokko_id y también el 9000000xx
  // de las cargadas directo en Hilo (public_numeric_id, desde el 4-oct-2026).
  const propertyIdNum = Number(body.propertyId)
  const tokkoPropertyId = Number.isFinite(propertyIdNum) && propertyIdNum > 0 ? String(propertyIdNum) : null
  const hiloPropertyId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str(body.hiloPropertyId)) ? str(body.hiloPropertyId) : null
  const pageUrl = str(body.pageUrl)
  const utm = attributionDeUrl(pageUrl)

  // Guardar en Redis (destino de respaldo — nunca debería perderse un lead)
  let savedRedis = false
  try {
    const redis = getRedis()
    const ts = Date.now()
    const leadKey = `lead:${origen}:${ts}:${email || whatsapp}`
    const leadData = { nombre, email, whatsapp: telefono, origen, fecha: new Date().toISOString(), ...(esDePropiedad ? { propertyId: str(body.propertyId) } : {}), ...(esConsultaCalificada ? { pago: str(body.pago), plazo: str(body.plazo), ...(esAlquiler ? { operacion: 'alquiler' } : {}) } : {}) }

    await redis.set(leadKey, JSON.stringify(leadData))
    await redis.lpush('leads:all', JSON.stringify(leadData))
    await redis.ltrim('leads:all', 0, TOPE_LEADS_ALL)
    savedRedis = true
  } catch (err) {
    console.error('[leads] Redis error:', err)
  }

  // Empujar el lead al inbox de Hilo (destino principal desde la migración).
  const isGuiaLead = origen === 'guia-comprador'
  // Mensaje genérico con todo lo que mandó el form (landings de cluster mandan
  // mensaje libre, zona y rango de presupuesto; antes se perdían y la
  // operación llegaba como "Sale"/"Rent").
  const OPERACIONES: Record<string, string> = { Sale: 'Venta', Rent: 'Alquiler' }
  const mensajeGenerico = (() => {
    const op = str(body.operation)
    const zonas = Array.isArray(body.preferredZones)
      ? body.preferredZones.map(str).filter(Boolean).join(', ')
      : ''
    const min = Number(body.budgetMin) || 0
    const max = Number(body.budgetMax) || 0
    const usd = (n: number) => `USD ${n.toLocaleString('es-AR')}`
    const presupuesto = str(body.budget) || (min && max ? `${usd(min)} a ${usd(max)}` : max ? `hasta ${usd(max)}` : min ? `desde ${usd(min)}` : 'Sin límite')
    return [
      `Operación: ${OPERACIONES[op] ?? (op || 'Venta')}`,
      `Tipo: ${str(body.propertyType) || 'Casa'}`,
      zonas ? `Zona: ${zonas}` : '',
      `Presupuesto: ${presupuesto}`,
      str(body.mensaje) ? `Mensaje: ${str(body.mensaje)}` : '',
    ].filter(Boolean).join(' | ')
  })()
  // Crear contacto en Tokko CRM (LEGACY best-effort; Tokko en desconexión).
  // El WhatsApp de la ficha no lo manda: la persona está esperando que se le
  // abra el chat. Arranca en paralelo con Hilo y con tope de 3 s: antes se
  // esperaba DESPUÉS de Hilo y sin timeout, y si Tokko colgaba la conexión el
  // formulario quedaba en "Enviando…" y la persona reintentaba (lead duplicado).
  const tokko = apiKey && !esWhatsappFicha
    ? (() => {
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
        return fetch(`https://www.tokkobroker.com/api/v1/contact/?key=${apiKey}&format=json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokkoPayload),
          signal: AbortSignal.timeout(TOKKO_TIMEOUT_MS),
        }).then(
          () => undefined,
          (err) => console.warn('[leads] Tokko CRM error:', err),
        )
      })()
    : null

  const hilo = await enviarLeadAHilo({
    name: nombre,
    email: email || null,
    phone: telefono,
    origen,
    message: isGuiaLead
      ? 'Lead desde Guía del Comprador 2026 — siinmobiliaria.com'
      : esConsultaCalificada
        ? `Consultó por ${str(body.propertyTitle) || 'una propiedad'} (${str(body.propertyPrice) || 'precio a consultar'}) desde la web · ${esAlquiler ? 'Garantía' : 'Paga'}: ${str(body.pago) || 'no dijo'} · ${esAlquiler ? 'Mudanza' : 'Plazo'}: ${str(body.plazo) || 'no dijo'}`
        : esPedirContacto
          ? `Pidió que lo contacten por WhatsApp por ${str(body.propertyTitle) || 'una propiedad'} (${str(body.propertyPrice) || 'precio a consultar'}) desde la ficha de la web`
          : esWhatsappFicha
            ? `Consultó por WhatsApp desde la ficha de ${str(body.propertyTitle) || 'una propiedad'} (${str(body.propertyPrice) || 'precio a consultar'}): se le abrió el chat con el agente asignado y la charla sigue por WhatsApp.`
            : mensajeGenerico,
    ...(esDePropiedad
      ? { tokkoPropertyId, hiloPropertyId, sourceUrl: pageUrl || null, attribution: utm }
      : pageUrl ? { sourceUrl: pageUrl, attribution: utm } : {}),
    // Identidad de Meta de la consulta → Hilo la manda por CAPI (Lead deduplicado con el píxel).
    meta: metaDeLaConsulta(request, body, pageUrl || null),
  })

  // Tokko ya va en paralelo y tiene tope: se espera acá para que la función no
  // se corte antes de mandarlo (como mucho 3 s desde que arrancó).
  if (tokko) await tokko

  // Si el lead NO quedó en NINGÚN destino durable, es una pérdida real: avisar al
  // usuario para que reintente en vez de devolver un ok:true mentiroso.
  const savedHilo = hilo.ok
  if (!savedRedis && !savedHilo) {
    console.error('[leads] LEAD PERDIDO: falló Redis y Hilo', { origen, email })
    return NextResponse.json(
      { error: 'No pudimos registrar tu consulta en este momento. Reintentá en unos segundos o escribinos por WhatsApp.' },
      { status: 502 },
    )
  }

  // El WhatsApp del agente, la consulta (para pedir un turno de visita después,
  // 17-oct-2026) y los turnos que ofrece Hilo solo los pide el botón de la ficha.
  // metaEventId: con ese id dispara el píxel (si Hilo ya tenía la consulta, es el primero).
  return NextResponse.json({
    ok: true,
    ...(esWhatsappFicha ? { agente: hilo.agente, conversationId: hilo.conversationId, turnos: hilo.turnos } : {}),
    ...(hilo.metaEventId ? { metaEventId: hilo.metaEventId } : {}),
  })
}
