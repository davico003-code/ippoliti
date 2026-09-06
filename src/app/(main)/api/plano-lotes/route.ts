// Datos vivos del plano de lotes de Distrito Roldán.
//
// El plano estático (public/planos/distrito-roldan.html) trae sus datos
// embebidos, pero al cargar consulta este endpoint y, si hay una versión
// publicada más nueva, se redibuja con ella. Así el panel del agente
// (/agentes/plano-distrito-roldan) impacta el sitio al instante, sin
// descargar archivos ni esperar un deploy.
//
// GET  → JSON publicado ({ cfg, lotes, guardadoEl }) o { lotes: null } si
//        nunca se publicó. Cacheado en CDN 60s: el costo por vista es cero.
// POST → guarda lo que manda el panel (solo agentes logueados).
//
// Guarda en Vercel Blob (store público del blog, BLOG_READ_WRITE_TOKEN),
// no en Redis: son ~15 KB que cambian pocas veces por semana y así no
// consume cuota de Upstash.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { put } from '@vercel/blob'
import { verifyAgentToken } from '@/lib/auth'
import { leerPlanoPublicado, PLANO_BLOB_PATH, PLANO_BLOB_TOKEN } from '@/lib/distrito-roldan/plano-publicado'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// La lectura vive en lib/distrito-roldan/plano-publicado.ts porque también
// la usa /api/distrito-roldan/consulta (06-sep-2026) para tomar los números
// del lote del plano vivo y no del navegador.
const BLOB_PATH = PLANO_BLOB_PATH
const BLOB_TOKEN = PLANO_BLOB_TOKEN

const ESTADOS = new Set(['d', 'n', 'v'])

type Lote = {
  frente: number
  fondo: number
  sup: number
  estado: string
  pm2?: number
  precio?: number
  contado?: number
}

function esNumeroValido(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
}

function validar(body: unknown): { cfg: object; lotes: Record<string, Lote> } | null {
  if (!body || typeof body !== 'object') return null
  const { cfg, lotes } = body as { cfg?: unknown; lotes?: unknown }
  if (!lotes || typeof lotes !== 'object' || Array.isArray(lotes)) return null
  const entradas = Object.entries(lotes as Record<string, unknown>)
  if (entradas.length === 0 || entradas.length > 400) return null

  const limpios: Record<string, Lote> = {}
  for (const [k, v] of entradas) {
    if (!/^\d+$/.test(k)) return null
    if (!v || typeof v !== 'object') return null
    const l = v as Record<string, unknown>
    if (!esNumeroValido(l.frente) || !esNumeroValido(l.fondo) || !esNumeroValido(l.sup)) return null
    if (typeof l.estado !== 'string' || !ESTADOS.has(l.estado)) return null
    const limpio: Lote = { frente: l.frente, fondo: l.fondo, sup: l.sup, estado: l.estado }
    for (const key of ['pm2', 'precio', 'contado'] as const) {
      if (l[key] == null) continue
      if (!esNumeroValido(l[key])) return null
      limpio[key] = l[key] as number
    }
    limpios[k] = limpio
  }

  if (cfg != null && (typeof cfg !== 'object' || Array.isArray(cfg))) return null
  return { cfg: (cfg as object) ?? {}, lotes: limpios }
}

export async function GET() {
  const vacio = { lotes: null }
  const headers = {
    'content-type': 'application/json',
    // 60s de CDN alcanzan: publicar desde el panel impacta en el próximo
    // minuto y las vistas del plano no golpean Blob una por una.
    'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
  }
  // Sin Blob (token ausente, red caída) el plano sigue con sus datos
  // embebidos: fail-open, nunca un 500 que rompa la carga.
  const data = await leerPlanoPublicado()
  return NextResponse.json(data ?? vacio, { headers })
}

export async function POST(req: Request) {
  const token = cookies().get('si_agent_token')?.value
  const agent = token ? await verifyAgentToken(token) : null
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    const text = await req.text()
    if (text.length > 200_000) return NextResponse.json({ error: 'Muy grande' }, { status: 413 })
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const datos = validar(body)
  if (!datos) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })

  try {
    await put(BLOB_PATH, JSON.stringify({ ...datos, guardadoEl: new Date().toISOString() }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token: BLOB_TOKEN,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error guardando' }, { status: 500 })
  }
}
