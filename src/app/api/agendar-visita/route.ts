import { NextResponse } from 'next/server'
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, telefono, email, fecha_preferida, horario, propiedad_id, propiedad_titulo, tipo } = body

    if (!nombre || !telefono || !fecha_preferida || !horario || !propiedad_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Store lead in memory (could be extended to database/CRM)
    console.log('[VISITA]', {
      nombre,
      telefono,
      email,
      fecha_preferida,
      horario,
      propiedad_id,
      propiedad_titulo,
      tipo,
      timestamp: new Date().toISOString(),
    })

    // Notificar al admin por WhatsApp (best-effort, no bloquea la respuesta)
    const mensaje = [
      `🔔 *Nueva consulta de ${tipo ?? 'visita'}*`,
      '',
      `👤 ${nombre}`,
      `📱 ${telefono}`,
      email ? `📧 ${email}` : null,
      '',
      `🏠 ${propiedad_titulo ?? 'Propiedad sin título'}`,
      `ID: ${propiedad_id}`,
      '',
      `📅 ${fecha_preferida} · ${horario}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await enviarWhatsAppAdmin(mensaje)
    } catch (err) {
      console.error('[agendar-visita] Error enviando WhatsApp admin:', err)
      // No rompemos la respuesta al cliente por un fallo de notificación
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
