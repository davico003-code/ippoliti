/**
 * Puente de ESCRITURA web → Hilo. Empuja los leads del sitio (siinmobiliaria.com)
 * al inbox de Hilo (meethilo.com /api/public/leads), reemplazando el "contacto a
 * Tokko". Server-to-server con secreto compartido (HILO_INGEST_SECRET).
 *
 * Es best-effort: si falla o no está configurado, NO lanza — la web ya guardó el
 * lead en Redis (y, durante la transición, en Tokko), así que nunca se pierde un
 * lead por un problema de este push.
 */

import type { TasacionLead } from '@/lib/tasacion/types'

export type HiloLeadPayload = {
  name?: string | null
  email?: string | null
  phone?: string | null
  message?: string | null
  origen?: string | null
  /** tokko_id de la propiedad consultada (si el lead viene de una ficha). */
  tokkoPropertyId?: string | number | null
  /** Contexto del pedido de tasación (origen 'tasacion'): barrio, tipo, m²,
   *  rango que vio la persona, nivel de comparables, utm. */
  tasacion?: TasacionLead | null
}

/** Devuelve true si el lead quedó registrado en el inbox de Hilo. best-effort:
 *  nunca lanza (el caller ya lo guardó en Redis), pero ahora el caller puede
 *  saber si el push funcionó para no reportar éxito falso. */
export async function pushLeadToHilo(payload: HiloLeadPayload): Promise<boolean> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return false // sin secreto no intentamos; la web ya capturó el lead

  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/leads`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hilo-ingest-secret': secret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
    // No logueamos el body de la respuesta: puede reflejar PII del lead a los
    // logs de Vercel. Solo el status.
    if (!res.ok) console.warn('[hilo-leads] push no-ok:', res.status)
    return res.ok
  } catch (err) {
    console.warn('[hilo-leads] push error:', err)
    return false
  }
}
