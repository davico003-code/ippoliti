// Ronda Funes Roldán — lo que se guarda, se guarda cifrado.
//
// David (13-oct-2026): "los datos de la operación que son clave tienen que
// estar más encriptados". En la base queda cada registro (publicación, agente,
// inmobiliaria) como un texto cifrado con AES-256-GCM: quien llegue a la base
// sin pasar por la Ronda ve letras sueltas, no la condición del propietario ni
// el WhatsApp de un colega. La llave NO sale de las credenciales de la base:
// con el acceso a Redis solo, no se puede leer nada.

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'

const MARCA = 'c1'

function llave(): Buffer {
  const base = process.env.AGENT_JWT_SECRET || process.env.CRON_SECRET || process.env.KV_REST_API_TOKEN || ''
  if (!base) throw new Error('Ronda: falta el secreto para cifrar')
  return createHmac('sha256', base).update('ronda-datos-v1').digest()
}

export function cifrar(dato: unknown): string {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', llave(), iv)
  const cuerpo = Buffer.concat([c.update(JSON.stringify(dato), 'utf8'), c.final()])
  return [MARCA, iv.toString('base64url'), c.getAuthTag().toString('base64url'), cuerpo.toString('base64url')].join('.')
}

export function estaCifrado(v: unknown): v is string {
  return typeof v === 'string' && v.startsWith(`${MARCA}.`)
}

/** null si el texto no se puede abrir (otra llave, o alguien lo tocó). */
export function descifrar<T>(texto: string): T | null {
  const [marca, iv, sello, cuerpo, ...resto] = texto.split('.')
  if (marca !== MARCA || !iv || !sello || !cuerpo || resto.length > 0) return null
  try {
    const d = createDecipheriv('aes-256-gcm', llave(), Buffer.from(iv, 'base64url'))
    d.setAuthTag(Buffer.from(sello, 'base64url'))
    return JSON.parse(Buffer.concat([d.update(Buffer.from(cuerpo, 'base64url')), d.final()]).toString('utf8')) as T
  } catch {
    return null
  }
}
