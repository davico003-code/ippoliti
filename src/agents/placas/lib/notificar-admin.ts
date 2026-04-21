// Mensaje WhatsApp al admin cuando el cron termina un carrusel.
// Reusa enviarWhatsAppAdmin del agente blog (stub si no hay creds Twilio).

import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'

const BASE_URL = 'https://siinmobiliaria.com'

export interface NotificarExitoInput {
  slug: string
  titulo: string
  total: number
  ms_total: number
  intentos_extractor: number
}

export async function notificarCarruselListo(
  input: NotificarExitoInput,
): Promise<void> {
  const segundos = Math.round(input.ms_total / 1000)
  const mensaje = [
    `📸 Placas listas — ${input.titulo}`,
    ``,
    `${input.total} placas generadas en ${segundos}s` +
      (input.intentos_extractor > 1
        ? ` (${input.intentos_extractor} intentos del extractor)`
        : ''),
    ``,
    `Revisar y aprobar:`,
    `${BASE_URL}/admin/placas/${input.slug}`,
  ].join('\n')

  try {
    await enviarWhatsAppAdmin(mensaje)
  } catch (err) {
    // No fallamos el cron por un error de notificación
    console.error('[placas/notificar-admin] error enviando:', err)
  }
}

export async function notificarCarruselFallido(
  slug: string | undefined,
  error: string,
): Promise<void> {
  const mensaje = [
    `⚠️ Placas — falló la generación`,
    ``,
    slug ? `Nota: ${slug}` : `(sin slug)`,
    `Error: ${error}`,
    ``,
    `Revisar logs en Vercel.`,
  ].join('\n')

  try {
    await enviarWhatsAppAdmin(mensaje)
  } catch (err) {
    console.error('[placas/notificar-admin] error enviando fallido:', err)
  }
}
