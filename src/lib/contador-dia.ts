import { redis } from '@/lib/redis'

// Contadores por día en el Redis compartido (los lee Hilo). Hoy los usan el
// Tinder ('tinder') y el WhatsApp con datos de la ficha ('wcd'):
//   <prefijo>:dia:<YYYY-MM-DD>                  hash  evento → veces · "evento|origen" → veces
//   <prefijo>:uv:<YYYY-MM-DD>:<evento>          HyperLogLog de personas (v = id por navegador)
//   <prefijo>:uv:<YYYY-MM-DD>:<evento>|<origen> ídem por origen
// Día de Argentina. Mismo contrato que si-crm src/lib/tinder/metricas-logic.ts.

const DIAS_GUARDADO = 400

export async function sumarEventoDelDia(prefijo: string, evento: string, origen: string, v: string): Promise<void> {
  const dia = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  const kDia = `${prefijo}:dia:${dia}`
  const kUv = `${prefijo}:uv:${dia}:${evento}`
  const kUvOrigen = `${kUv}|${origen}`
  const p = redis.pipeline()
  p.hincrby(kDia, evento, 1)
  p.hincrby(kDia, `${evento}|${origen}`, 1)
  p.pfadd(kUv, v)
  p.pfadd(kUvOrigen, v)
  p.expire(kDia, DIAS_GUARDADO * 86_400)
  p.expire(kUv, DIAS_GUARDADO * 86_400)
  p.expire(kUvOrigen, DIAS_GUARDADO * 86_400)
  await p.exec()
}
