import { NextResponse } from 'next/server'
import { celularDeCookie } from '@/lib/cookie-whatsapp'

/**
 * GET siinmobiliaria.com/w/ficha/<id>?text=… — el botón de WhatsApp de una
 * ficha que ROTA (lib/tokko.ts → rotaPorTurno: las de David y las sin captador).
 *
 * Antes esas fichas abrían el WhatsApp de David (la línea central de ventas) y
 * él tenía que pasarle la consulta a alguien. Ahora le preguntamos a Hilo a
 * quién le toca (la misma persona vuelve con su agente; si no, el de turno de la
 * sucursal de la propiedad; antes que nada, si dejó su celular en la web y ya
 * habla con un agente, ese agente) y se abre el chat con él, con el texto de la
 * ficha. Hilo deja anotado el toque. Mismo camino que los anuncios (/w/<ref>).
 *
 * Servidor a servidor con HILO_INGEST_SECRET. Si Hilo no contesta a tiempo, va
 * al WhatsApp central de ventas (como antes): el botón nunca queda muerto.
 */
export const dynamic = 'force-dynamic'

const CENTRAL_VENTAS = '5493413340916'

function irA(url: string) {
  return new NextResponse(null, {
    status: 302,
    headers: { Location: url, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url)
  const texto = (url.searchParams.get('text') ?? '').slice(0, 1000) || 'Hola {agente}, te escribo por una propiedad de la web.'
  const respaldo = () => `https://wa.me/${CENTRAL_VENTAS}?text=${encodeURIComponent(texto.replaceAll('{agente}', 'SI INMOBILIARIA'))}`

  const id = Number(params.id)
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret || !Number.isInteger(id) || id <= 0) return irA(respaldo())

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || null
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'

  try {
    const res = await fetch(`${base}/api/public/pauta-link`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify({
        propiedad: id,
        mensaje: texto,
        ip,
        userAgent: req.headers.get('user-agent'),
        // Si ya dejó su celular en la web y habla con un agente, Hilo lo manda con ese.
        celular: celularDeCookie(req.headers.get('cookie')),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) {
      console.warn('[w/ficha] Hilo no-ok:', res.status)
      return irA(respaldo())
    }
    const data = (await res.json()) as { url?: unknown }
    // Solo WhatsApp: esta ruta nunca redirige a un destino arbitrario.
    const destino = typeof data.url === 'string' && data.url.startsWith('https://wa.me/') ? data.url : respaldo()
    return irA(destino)
  } catch (err) {
    console.warn('[w/ficha] Hilo no respondió:', err)
    return irA(respaldo())
  }
}
