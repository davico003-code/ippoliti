// Sesión de un agente de la Ronda: un pase firmado que queda en su teléfono.
//
// No hay cuentas ni claves (decisión de David: el colega elige su inmobiliaria
// y carga su WhatsApp, nada más). El pase dice quién publica; con él se puede
// publicar y dar de baja lo propio. La firma usa una clave DERIVADA: un pase de
// la Ronda no sirve como token de agente de SI (/agentes) ni al revés.

import { createHmac, timingSafeEqual } from 'node:crypto'

export interface SesionRonda {
  /** id del agente */
  aid: string
  /** id de su inmobiliaria */
  iid: string
  nombre: string
  whatsapp: string
}

function clave(): Buffer {
  const base = process.env.KV_REST_API_TOKEN || ''
  if (!base) throw new Error('Ronda: falta KV_REST_API_TOKEN')
  return createHmac('sha256', base).update('ronda-agente-v1').digest()
}

function firma(cuerpo: string): Buffer {
  return createHmac('sha256', clave()).update(cuerpo).digest()
}

export function firmarSesion(s: SesionRonda): string {
  const cuerpo = Buffer.from(JSON.stringify(s), 'utf8').toString('base64url')
  return `${cuerpo}.${firma(cuerpo).toString('base64url')}`
}

export function leerSesion(token: string | null | undefined): SesionRonda | null {
  const [cuerpo, sello, ...resto] = String(token ?? '').split('.')
  if (!cuerpo || !sello || resto.length > 0) return null
  try {
    const esperado = firma(cuerpo)
    const recibido = Buffer.from(sello, 'base64url')
    if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return null
    const s = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8')) as Partial<SesionRonda>
    if (!s.aid || !s.iid || !s.nombre || !s.whatsapp) return null
    return { aid: String(s.aid), iid: String(s.iid), nombre: String(s.nombre), whatsapp: String(s.whatsapp) }
  } catch {
    return null
  }
}

/** La sesión que viene en "Authorization: Bearer <pase>", o null. */
export function sesionDe(req: Request): SesionRonda | null {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') || '')
  return m ? leerSesion(m[1].trim()) : null
}

export function ipDe(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}
