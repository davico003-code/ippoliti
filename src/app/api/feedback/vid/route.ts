// GET /api/feedback/vid
//
// Bootstrap de identidad anónima: garantiza que el visitante tenga la cookie
// `si_vid`. El cliente lo puede llamar al montar, aunque el resto de los
// handlers también setean la cookie en su primer contacto.

import { NextResponse } from 'next/server'
import { ensureVid, setVidCookie } from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const { isNew, vid } = ensureVid()
  const res = NextResponse.json({ ok: true })
  if (isNew) setVidCookie(res, vid)
  return res
}
