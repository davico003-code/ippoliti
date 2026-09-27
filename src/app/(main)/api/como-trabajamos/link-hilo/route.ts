// /api/como-trabajamos/link-hilo — HILO pide links de la presentación.
//
// Servidor a servidor, autenticado con el secreto que HILO y la web ya
// comparten (HILO_INGEST_SECRET, header x-hilo-ingest-secret).
// POST { cliente, agente } → { url, token }. GET ?tokens=a,b → estado de cada
// link (abierto, visitas) para mostrarlo en HILO.
import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { AGENTS } from '@/lib/agents'
import { crearLink, leerLink, urlDelLink, visitasDe } from '@/lib/como-trabajamos-acceso'

export const dynamic = 'force-dynamic'

const WEB = 'https://siinmobiliaria.com'

function autorizado(req: Request): boolean {
  const esperado = process.env.HILO_INGEST_SECRET
  const recibido = req.headers.get('x-hilo-ingest-secret')
  if (!esperado || !recibido) return false
  const a = Buffer.from(esperado)
  const b = Buffer.from(recibido)
  return a.length === b.length && timingSafeEqual(a, b)
}

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** El agente de HILO en el roster de la web (por nombre), para que el link aparezca también en su panel web. */
function agenteWeb(nombre: string): { id: string; name: string } {
  const n = normalizar(nombre)
  const match =
    AGENTS.find((a) => normalizar(a.name) === n) ??
    AGENTS.find((a) => {
      const [nombreWeb, apellidoWeb] = normalizar(a.name).split(' ')
      return Boolean(apellidoWeb) && n.includes(nombreWeb) && n.includes(apellidoWeb)
    })
  return match ? { id: match.id, name: nombre } : { id: 'hilo', name: nombre }
}

export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { cliente?: string; agente?: string }
  const cliente = (body.cliente ?? '').trim()
  const agente = (body.agente ?? '').trim()
  if (cliente.length < 2 || agente.length < 2) return NextResponse.json({ error: 'Faltan el cliente o el agente' }, { status: 400 })
  try {
    const link = await crearLink(cliente, agenteWeb(agente))
    return NextResponse.json({ url: urlDelLink(WEB, link.token), token: link.token })
  } catch {
    return NextResponse.json({ error: 'No se pudo generar el link' }, { status: 503 })
  }
}

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const tokens = (new URL(req.url).searchParams.get('tokens') ?? '').split(',').filter(Boolean).slice(0, 50)
  const estados = await Promise.all(
    tokens.map(async (t) => {
      const [{ link, usado }, visitas] = await Promise.all([leerLink(t), visitasDe(t)])
      return { token: t, existe: Boolean(link), abierto: usado, usadoEn: link?.usadoEn ?? null, visitas }
    }),
  ).catch(() => [])
  return NextResponse.json({ estados })
}
