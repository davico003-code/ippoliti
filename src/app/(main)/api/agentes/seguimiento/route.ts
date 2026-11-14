// /api/agentes/seguimiento — "Compartir varias" del listado para asesores con
// sesión (David, 14-nov-2026: "filtran Vida Lagoon, seleccionan 3 lotes y les
// aparece la opción de enviar en un único link"). POST { cliente?, ids } (nombre opcional) →
// { url } = el LINK DE SEGUIMIENTO del cliente, que arma HILO (un solo link por
// cliente: si ya tenía, se suman). Servidor a servidor con el secreto que ya
// comparten (HILO_INGEST_SECRET). El middleware deja pasar /api/agentes/*: la
// sesión se valida acá.
import { NextResponse } from 'next/server'
import { getAgentFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const agente = await getAgentFromCookies()
  if (!agente) return NextResponse.json({ error: 'Iniciá sesión como asesor.' }, { status: 401 })
  const secreto = process.env.HILO_INGEST_SECRET
  if (!secreto) return NextResponse.json({ error: 'Falta configurar el enlace con Hilo.' }, { status: 500 })

  const body = (await req.json().catch(() => ({}))) as { cliente?: unknown; ids?: unknown }
  const cliente = typeof body.cliente === 'string' ? body.cliente.trim() : ''
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter((x) => /^\d{1,12}$/.test(x)) : []
  if (ids.length === 0) return NextResponse.json({ error: 'Tildá al menos una propiedad.' }, { status: 400 })

  const base = (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/public/seguimiento-agente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hilo-ingest-secret': secreto },
      body: JSON.stringify({ agente: agente.name, cliente, ids }),
      cache: 'no-store',
      signal: AbortSignal.timeout(25_000),
    })
    const j = (await res.json().catch(() => null)) as { url?: string | null; error?: string; incluidas?: number; omitidas?: number; nuevo?: boolean } | null
    if (!res.ok || !j?.url) {
      return NextResponse.json({ error: j?.error ?? 'No se pudo armar el link. Probá de nuevo.' }, { status: res.ok ? 502 : res.status })
    }
    return NextResponse.json({ url: j.url, incluidas: j.incluidas ?? ids.length, omitidas: j.omitidas ?? 0, nuevo: j.nuevo !== false })
  } catch (e) {
    console.error('[agentes/seguimiento] Hilo no respondió', e)
    return NextResponse.json({ error: 'Hilo no respondió. Probá de nuevo en un momento.' }, { status: 502 })
  }
}
