// POST /api/admin/revalidate-propiedades
//
// Fuerza el refresh del cache de propiedades de todas las capas (Next data
// cache, Vercel edge, Redis). La lógica vive en @/lib/tokko-revalidate y la
// comparte con /api/agentes/revalidate-tokko.
//
// Auth: header x-team-code contra SI_TEAM_CODE.
//
// Ejemplo de uso:
//   curl -X POST 'https://siinmobiliaria.com/api/admin/revalidate-propiedades' \
//     -H 'x-team-code: <SI_TEAM_CODE>'
//
// Devuelve { ok, redisKeysDeleted, tagsRevalidated, pathsRevalidated, errors, timestamp }.

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { revalidarPropiedades } from '@/lib/tokko-revalidate'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const result = await revalidarPropiedades()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
