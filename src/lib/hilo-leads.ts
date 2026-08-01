/**
 * Puente de ESCRITURA web → Hilo. Empuja los leads del sitio (siinmobiliaria.com)
 * al inbox de Hilo (meethilo.com /api/public/leads), reemplazando el "contacto a
 * Tokko". Server-to-server con secreto compartido (HILO_INGEST_SECRET).
 *
 * Es best-effort: si falla o no está configurado, NO lanza — la web ya guardó el
 * lead en Redis (y, durante la transición, en Tokko), así que nunca se pierde un
 * lead por un problema de este push.
 */

export type HiloLeadPayload = {
  name?: string | null
  email?: string | null
  phone?: string | null
  message?: string | null
  origen?: string | null
  /** tokko_id de la propiedad consultada (si el lead viene de una ficha). */
  tokkoPropertyId?: string | number | null
  /** UUID de oportunidad externa verificada, para atribución comercial. */
  marketOpportunityId?: string | null
  intent?: string | null
  propertyTypes?: string[]
  preferredZones?: string[]
  budgetMin?: number | null
  budgetMax?: number | null
}

export async function pushLeadToHilo(payload: HiloLeadPayload): Promise<void> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return // sin secreto no intentamos; la web ya capturó el lead

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
    if (!res.ok) {
      console.warn('[hilo-leads] push no-ok:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.warn('[hilo-leads] push error:', err)
  }
}
