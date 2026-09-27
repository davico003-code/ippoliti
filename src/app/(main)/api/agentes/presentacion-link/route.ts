// /api/agentes/presentacion-link — links de un solo uso para /como-trabajamos.
// POST { cliente } crea uno; GET lista los últimos del agente. Solo agentes
// logueados (el middleware deja pasar /api/agentes/*, la sesión se valida acá).
import { NextResponse } from 'next/server'
import { getAgentFromCookies } from '@/lib/auth'
import { crearLink, linksDelAgente } from '@/lib/como-trabajamos-acceso'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const agente = await getAgentFromCookies()
  if (!agente) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { cliente?: string }
  const cliente = (body.cliente ?? '').trim()
  if (cliente.length < 2) return NextResponse.json({ error: 'Poné el nombre del cliente' }, { status: 400 })
  const link = await crearLink(cliente, { id: agente.id, name: agente.name })
  const url = `${new URL(req.url).origin}/como-trabajamos?k=${link.token}`
  return NextResponse.json({ url, link })
}

export async function GET(req: Request) {
  const agente = await getAgentFromCookies()
  if (!agente) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const origen = new URL(req.url).origin
  const links = await linksDelAgente(agente.id)
  return NextResponse.json({ links: links.map((l) => ({ ...l, url: `${origen}/como-trabajamos?k=${l.token}` })) })
}
