// GET /api/agentes/newsletter
//
// Devuelve la lista de suscriptores del newsletter (popup "¿Encontraste lo
// que buscabas?") para la placa admin del panel /agentes. Auth: cookie JWT
// del agente con role === 'admin'.
//
// Query params:
//   ?format=csv → devuelve CSV en lugar de JSON (para descargar).
//
// Returns (JSON): { ok, items: NewsletterLead[], stats: { total, esteMes } }

import { NextResponse } from 'next/server'
import { getAgentFromCookies } from '@/lib/auth'
import { listNewsletterLeads, countNewsletterLeads } from '@/lib/leads'

export const dynamic = 'force-dynamic'

function toCsv(items: { nombre: string; email: string; whatsapp?: string; fecha: string; operation?: string; propertyType?: string; budget?: string }[]): string {
  const header = 'Nombre,Email,WhatsApp,Fecha,Operacion,Tipo,Presupuesto'
  const escape = (v: string | undefined | null): string => {
    if (v == null) return ''
    const s = String(v).replace(/"/g, '""')
    return `"${s}"`
  }
  const rows = items.map(l =>
    [l.nombre, l.email, l.whatsapp, l.fecha, l.operation, l.propertyType, l.budget]
      .map(escape)
      .join(','),
  )
  return [header, ...rows].join('\n')
}

export async function GET(req: Request) {
  const agent = await getAgentFromCookies()
  if (!agent) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (agent.role !== 'admin') {
    return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
  }

  try {
    const items = await listNewsletterLeads()
    const url = new URL(req.url)

    if (url.searchParams.get('format') === 'csv') {
      const csv = toCsv(items)
      const fecha = new Date().toISOString().slice(0, 10)
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="newsletter-${fecha}.csv"`,
        },
      })
    }

    const stats = await countNewsletterLeads()
    return NextResponse.json({ ok: true, items, stats })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error listando newsletter'
    console.error('[api/agentes/newsletter]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
