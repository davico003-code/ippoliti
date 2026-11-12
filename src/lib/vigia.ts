import { redis } from '@/lib/redis'

// Lo que encuentra cada chequeo diario de la web (fichas de colegas, mapas,
// Redis, Search Console) queda acá para el vigía de Hilo, que comparte este
// Redis: él decide cuándo mandar el mail (avisa lo nuevo, insiste a los 7 días,
// avisa cuando se arregla). Antes cada chequeo avisaba por un WhatsApp de
// Twilio que no llega desde mayo-2026 (sandbox) y nadie se enteraba de nada.
//
// Se reporta SIEMPRE, también sin problemas: si un chequeo deja de reportar,
// el vigía lo nota por ausencia (eso reemplaza al "latido de los lunes").
// La lectura del otro lado: src/lib/infra/web-salud.ts en Hilo.

export async function reportarAlVigia(chequeo: string, problemas: string[]): Promise<void> {
  try {
    await redis.set(`vigia:web:${chequeo}`, JSON.stringify({ problemas, at: new Date().toISOString() }), { ex: 3 * 24 * 60 * 60 })
  } catch (err) {
    console.error(`[vigia] no pude dejar el resultado de ${chequeo}:`, err)
  }
}
