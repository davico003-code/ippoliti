import { NextResponse } from 'next/server'

/**
 * GET siinmobiliaria.com/w/<ref> — el link que llevan los anuncios de Meta.
 *
 * Para la persona es igual que tocar un WhatsApp: pasa por acá una fracción de
 * segundo y se le abre el chat con el agente, con el mensaje ya escrito. La
 * diferencia está detrás: en vez de tener el celular de UN agente pegado al
 * anuncio, le preguntamos a Hilo a quién le toca (el captador de la propiedad;
 * si no tiene, el del equipo que menos recibió esta semana) y Hilo deja anotado
 * el toque. Reparto parejo entre agentes y fin de la pauta ciega.
 *
 * Servidor a servidor con HILO_INGEST_SECRET (el mismo de las consultas). Un
 * anuncio pago SIEMPRE tiene que aterrizar: si Hilo no contesta a tiempo, va al
 * WhatsApp central de ventas.
 */
export const dynamic = 'force-dynamic'

const CENTRAL_VENTAS = '5493413340916'
const respaldo = () =>
  `https://wa.me/${CENTRAL_VENTAS}?text=${encodeURIComponent('Hola! Vi un aviso de SI INMOBILIARIA y quiero más información.')}`

function irA(url: string) {
  return new NextResponse(null, {
    status: 302,
    headers: { Location: url, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  })
}

export async function GET(req: Request, { params }: { params: { ref: string } }) {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return irA(respaldo())

  const url = new URL(req.url)
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || null
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'

  try {
    const res = await fetch(`${base}/api/public/pauta-link`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify({
        ref: params.ref,
        ip,
        userAgent: req.headers.get('user-agent'),
        pl: url.searchParams.get('pl'),
        ad: url.searchParams.get('ad'),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) {
      console.warn('[w] Hilo no-ok:', res.status)
      return irA(respaldo())
    }
    const data = (await res.json()) as { url?: unknown }
    // Solo WhatsApp: esta ruta nunca redirige a un destino arbitrario.
    const destino = typeof data.url === 'string' && data.url.startsWith('https://wa.me/') ? data.url : respaldo()
    return irA(destino)
  } catch (err) {
    console.warn('[w] Hilo no respondió:', err)
    return irA(respaldo())
  }
}
