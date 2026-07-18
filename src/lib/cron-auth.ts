import { timingSafeEqual } from 'crypto'

// Auth de crons/endpoints server-to-server. FAIL-CLOSED: si CRON_SECRET no está
// configurada, NO se autoriza a nadie (antes `Bearer ${process.env.CRON_SECRET}`
// con la env faltante daba "Bearer undefined", que un atacante podía mandar tal
// cual para pasar). Comparación en tiempo constante.
export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron-auth] CRON_SECRET no configurada — denegando por defecto')
    return false
  }
  const auth = req.headers.get('authorization') || ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(auth)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
