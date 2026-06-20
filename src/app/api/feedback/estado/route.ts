// /api/feedback/estado
//
// Estado del feedback de ESTE visitante (por cookie si_vid). Privado al vid;
// nunca devuelve agregados públicos.
//
//  GET  ?propertyId=123  → { liked, react, valuation, objeciones }
//       Estado completo de una propiedad (usado en la ficha de detalle).
//
//  POST { propertyIds: number[] } → { liked: string[] }
//       Sólo el subconjunto de ids que el visitante likeó. Batch para el
//       listado: 1 request por lote en vez de 1 por card.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  ensureVid,
  setVidCookie,
  fbKey,
  parsePropertyId,
  REACT_CHOICES,
} from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BATCH_CAP = 300

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const propertyId = parsePropertyId(searchParams.get('propertyId'))
  const { vid, isNew } = ensureVid()

  let liked = false
  let react: string | null = null
  let valuation: number | null = null
  let objeciones: string[] = []

  if (propertyId) {
    try {
      const base = fbKey(propertyId)
      const [member, r, v, obj] = await Promise.all([
        redis.sismember(`${base}:like`, vid),
        redis.hget<string>(`${base}:reactvid`, vid),
        redis.hget<string | number>(`${base}:valuation`, vid),
        redis.hget<string>(`${base}:objectionvid`, vid),
      ])
      liked = member === 1
      react = typeof r === 'string' && REACT_CHOICES.includes(r as never) ? r : null
      valuation = v != null && v !== '' ? Number(v) : null
      if (valuation != null && !Number.isFinite(valuation)) valuation = null
      if (obj) {
        try {
          const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj
          if (Array.isArray(parsed)) objeciones = parsed.filter((x) => typeof x === 'string')
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* si Redis falla devolvemos estado vacío, no rompemos la ficha */
    }
  }

  const res = NextResponse.json({ liked, react, valuation, objeciones })
  if (isNew) setVidCookie(res, vid)
  return res
}

export async function POST(req: Request) {
  let body: { propertyIds?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const raw = Array.isArray(body.propertyIds) ? body.propertyIds : []
  const ids = raw
    .map(parsePropertyId)
    .filter((x): x is string => x !== null)
    .slice(0, BATCH_CAP)

  const { vid, isNew } = ensureVid()
  const liked: string[] = []

  if (ids.length > 0) {
    try {
      const checks = await Promise.all(
        ids.map((id) => redis.sismember(`${fbKey(id)}:like`, vid)),
      )
      ids.forEach((id, i) => {
        if (checks[i] === 1) liked.push(id)
      })
    } catch {
      /* devolvemos lo que haya (posiblemente vacío) */
    }
  }

  const res = NextResponse.json({ liked })
  if (isNew) setVidCookie(res, vid)
  return res
}
