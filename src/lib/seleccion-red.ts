// La selección del cliente le pide a HILO lo que es de la Red (Propia / MELI):
// la ficha neutra para verla adentro y sumarla a su link cuando le gusta.
// Servidor a servidor con el mismo secreto que las consultas de la web.

const RED_ID = /^(?:propia:[1-9]\d{0,9}|meli:MLA\d{6,14})$/

/** `red:propia:123` → `propia:123`; null si no es de la Red. */
export function redIdDe(propertyId: string): string | null {
  const id = propertyId.startsWith('red:') ? propertyId.slice(4) : propertyId
  return RED_ID.test(id) ? id : null
}

export async function pedirAHilo(
  token: string,
  redId: string,
  accion: 'ficha' | 'sumar',
): Promise<{ ok: boolean; status: number; url?: string }> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return { ok: false, status: 503 }
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/seleccion-red`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify({ token, id: redId, accion }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string }
    return {
      ok: res.ok && (accion === 'ficha' ? !!data.url : data.ok !== false),
      status: res.status,
      url: data.url,
    }
  } catch {
    return { ok: false, status: 504 }
  }
}
