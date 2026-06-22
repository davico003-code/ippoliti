// POST /api/agendar-visita — endpoint público para crear lead de visita desde
// la ficha de propiedad. Persiste en Redis (visita:{id} con TTL 180d) y
// notifica al admin por WhatsApp (best-effort, no bloquea la respuesta).
//
// NO requiere team-code (es público — disparado por el cliente final desde
// el VisitWidget en la ficha de propiedad).

import { NextResponse } from 'next/server'
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'
import { crearVisita, type VisitaSource, type VisitaTipo } from '@/lib/visitas'
import { pushLeadToHilo } from '@/lib/hilo-leads'

export const dynamic = 'force-dynamic'

const TIPOS: VisitaTipo[] = ['venta', 'alquiler', 'temporario']
const SOURCES: VisitaSource[] = ['mobile-sticky', 'desktop-sidebar', 'emprendimiento', 'otro']

function getClientIp(req: Request): string | undefined {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || undefined
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const telefono = typeof body.telefono === 'string' ? body.telefono.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const fecha_preferida = typeof body.fecha_preferida === 'string' ? body.fecha_preferida : ''
  const horario = typeof body.horario === 'string' ? body.horario : ''
  const propiedad_id = Number(body.propiedad_id)
  const propiedad_titulo =
    typeof body.propiedad_titulo === 'string' ? body.propiedad_titulo : 'Propiedad sin título'
  const propiedad_url =
    typeof body.propiedad_url === 'string' && body.propiedad_url.length > 0
      ? body.propiedad_url
      : undefined

  const tipoRaw = typeof body.tipo === 'string' ? body.tipo : 'venta'
  const tipo: VisitaTipo = (TIPOS as readonly string[]).includes(tipoRaw)
    ? (tipoRaw as VisitaTipo)
    : 'venta'

  const sourceRaw = typeof body.source === 'string' ? body.source : 'otro'
  const source: VisitaSource = (SOURCES as readonly string[]).includes(sourceRaw)
    ? (sourceRaw as VisitaSource)
    : 'otro'

  if (!nombre || !telefono || !fecha_preferida || !horario || !Number.isFinite(propiedad_id)) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const ip = getClientIp(request)
  const user_agent = request.headers.get('user-agent') || undefined

  let visita
  try {
    visita = await crearVisita({
      propiedad_id,
      propiedad_titulo,
      propiedad_url,
      nombre,
      telefono,
      email: email || undefined,
      fecha_preferida,
      horario,
      tipo,
      source,
      ip,
      user_agent,
    })
  } catch (e) {
    console.error('[agendar-visita] Error persistiendo en Redis:', e)
    return NextResponse.json({ error: 'No se pudo guardar el lead' }, { status: 500 })
  }

  // Empujar al inbox de Hilo (best-effort): lead caliente con propiedad + fecha.
  // tokkoPropertyId → Hilo resuelve la ficha y lo asigna al captador.
  await pushLeadToHilo({
    name: nombre,
    phone: telefono,
    email: email || null,
    origen: `visita-${source}`,
    tokkoPropertyId: propiedad_id,
    message: `Agendó visita a "${propiedad_titulo}" para ${fecha_preferida} ${horario}.${
      propiedad_url ? ` ${propiedad_url}` : ''
    }`,
  })

  // Notificar al admin por WhatsApp (best-effort, no bloquea respuesta)
  const mensaje = [
    `🔔 *Nueva consulta de ${tipo}*`,
    '',
    `👤 ${nombre}`,
    `📱 ${telefono}`,
    email ? `📧 ${email}` : null,
    '',
    `🏠 ${propiedad_titulo}`,
    propiedad_url ? `🔗 ${propiedad_url}` : null,
    `ID propiedad: ${propiedad_id}`,
    '',
    `📅 ${fecha_preferida} · ${horario}`,
    '',
    `Lead ID: ${visita.id}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    await enviarWhatsAppAdmin(mensaje)
  } catch (err) {
    console.error('[agendar-visita] Error enviando WhatsApp admin:', err)
    // No rompemos la respuesta al cliente por un fallo de notificación
  }

  return NextResponse.json({ ok: true, id: visita.id })
}
