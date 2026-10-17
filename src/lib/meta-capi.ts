import type { NextRequest } from 'next/server'

/**
 * Identidad de Meta de una consulta (17-oct-2026): viaja a Hilo junto con el
 * lead y Hilo la usa para mandarle a Meta, por la Conversions API, el Lead
 * (deduplicado con el píxel por `eventId`), el QualifiedLead cuando el
 * contacto demuestra calidad y el Purchase cuando compra. Con eso Meta aprende
 * a traer compradores y no clickeadores.
 *
 * Solo lectura del request: cookies _fbp/_fbc que deja el píxel, IP y
 * user-agent (Meta los pide sin hashear para matchear). Si no hay cookie _fbc,
 * Hilo la arma desde el fbclid de la página.
 */
export type MetaConsulta = {
  /** Id que generó el navegador y con el que disparó fbq('track','Lead'); null si el formulario no lo manda. */
  eventId: string | null
  fbp: string | null
  fbc: string | null
  ip: string | null
  ua: string | null
  url: string | null
}

export function metaDeLaConsulta(request: NextRequest, body: Record<string, unknown>, pageUrl: string | null): MetaConsulta | null {
  const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
  const cookie = (n: string) => str(request.cookies.get(n)?.value, 300)
  const eventId = str(body.metaEventId, 64)
  const fbp = cookie('_fbp')
  const fbc = cookie('_fbc')
  const meta: MetaConsulta = {
    eventId: eventId && /^[A-Za-z0-9_-]{8,64}$/.test(eventId) ? eventId : null,
    fbp,
    fbc,
    ip: str(request.headers.get('x-forwarded-for')?.split(',')[0], 45),
    ua: str(request.headers.get('user-agent'), 300),
    url: str(pageUrl, 500),
  }
  // Sin nada de Meta no vale la pena mandarlo (la consulta igual entra a Hilo).
  return meta.eventId || meta.fbp || meta.fbc || /[?&]fbclid=/.test(pageUrl ?? '') ? meta : null
}
