import { NextResponse } from 'next/server'

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

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
