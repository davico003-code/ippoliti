// Lectura de los datos vivos del plano de Distrito Roldán (lo último que
// publicó el panel de agentes en Vercel Blob). Lo usan dos rutas:
//   - GET /api/plano-lotes: el plano se redibuja con esto al cargar.
//   - POST /api/distrito-roldan/consulta (06-sep-2026): antes de mandar el
//     pedido a Hilo, los números del lote (precio, contado, medidas, estado)
//     se toman de acá y no de lo que mandó el navegador. Regla de David:
//     nunca inventar números, todo sale del plano vivo.
//
// Fail-open: sin Blob (token ausente, red caída) devuelve null y cada caller
// decide su fallback (el plano usa los datos embebidos; la consulta, los del
// cliente acotados).

import { list } from '@vercel/blob'

export const PLANO_BLOB_PATH = 'plano-lotes/distrito-roldan.json'
// El store por defecto (BLOB_READ_WRITE_TOKEN) es privado; el del blog es
// el público y es el que ya usan capacitaciones y las notas.
export const PLANO_BLOB_TOKEN = process.env.BLOG_READ_WRITE_TOKEN

export type EstadoLote = 'd' | 'n' | 'v'

export type LotePublicado = {
  frente: number
  fondo: number
  sup: number
  estado: EstadoLote
  pm2?: number
  precio?: number
  contado?: number
}

export type FinanciacionTipo = { anticipoPct: number; cuotas: number; contadoTxt?: string }

export type PlanoPublicado = {
  cfg: {
    whatsapp?: string
    proyecto?: string
    actualizado?: string
    financiacion?: { residencial?: FinanciacionTipo; comercial?: FinanciacionTipo }
  } & Record<string, unknown>
  lotes: Record<string, LotePublicado>
  guardadoEl?: string
}

/** Mismos valores que el CFG embebido en public/planos/distrito-roldan.html.
 *  Se usan solo si el Blob no publicó una financiación. */
export const FINANCIACION_DEFAULT: Record<'residencial' | 'comercial', FinanciacionTipo> = {
  residencial: { anticipoPct: 30, cuotas: 24 },
  comercial: { anticipoPct: 50, cuotas: 12 },
}

export async function leerPlanoPublicado(): Promise<PlanoPublicado | null> {
  try {
    const result = await list({ prefix: PLANO_BLOB_PATH, token: PLANO_BLOB_TOKEN })
    const match = result.blobs.find((b) => b.pathname === PLANO_BLOB_PATH)
    if (!match) return null
    const res = await fetch(match.url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<PlanoPublicado> | null
    if (!data || !data.lotes || typeof data.lotes !== 'object') return null
    return { cfg: (data.cfg ?? {}) as PlanoPublicado['cfg'], lotes: data.lotes, guardadoEl: data.guardadoEl }
  } catch {
    return null
  }
}
