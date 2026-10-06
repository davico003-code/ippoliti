// /conoce-tu-hogar — "Conocé tu próximo hogar": dónde busca, qué y hasta
// cuánto, y el mazo tipo Tinder (nuestras + "En red"). Se llega desde el link
// debajo del buscador de la home (celu). Query params: ?zona=<nombre>&tipo=house|lot|apartment&tope=<usd>&dorm=<1-5>&barrio=cerrado|abierto
// 5-oct (David): `s=<token>` = el link que le mandó su asesor (♥ y ★ van a su
// selección; `vista=asesor` = vista previa, no manda nada); `abrir=1` abre el
// mazo apenas cuenta (links de la pauta); `utm_medium=pauta|paid|cpc` u
// `origen=pauta` = vino de un anuncio (el contador lo separa).
//
// Dónde se puede buscar lo dice Hilo (barrios y ciudades con algo en venta,
// nuestras o de la red): se carga en el servidor, así las sugerencias salen
// al tipear sin esperar.

import type { Metadata } from 'next'
import ConoceTuHogar from '@/components/hogar/ConoceTuHogar'
import { type ZonaHogar, barrioHogarValido, dormMinValido, esTipoHogar } from '@/lib/feed-en-red'
import { getSeleccion } from '@/lib/redis'
import { ZONAS } from '@/lib/zonas'

export const metadata: Metadata = {
  title: 'Conocé tu próximo hogar | SI INMOBILIARIA',
  description: 'Contanos dónde buscás y deslizá las casas de la zona: guardá con ♥ las que te gusten y un asesor te coordina las visitas.',
  alternates: { canonical: '/conoce-tu-hogar' },
}

/** Sin Hilo: las zonas fijas de la web (sin cantidades). */
const zonasFijas = (): ZonaHogar[] =>
  ZONAS.map((z) => ({ nombre: z.nombre, ciudad: z.ciudad, esCiudad: z.tipo === 'zona' && z.nombre === z.ciudad, casas: 0, lotes: 0, deptos: 0 }))

async function catalogo(): Promise<ZonaHogar[]> {
  const base = (process.env.HILO_LEADS_URL || 'https://meethilo.com').replace(/\/$/, '')
  try {
    // Con tope de espera: si Hilo no contesta, la página sale igual con las zonas fijas.
    const res = await fetch(`${base}/api/public/en-red/zonas`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { zonas?: ZonaHogar[] }
    const zonas = (data.zonas ?? []).filter((z) => z && typeof z.nombre === 'string')
    return zonas.length ? zonas : zonasFijas()
  } catch (e) {
    console.warn('[conoce-tu-hogar] zonas', e instanceof Error ? e.message : e)
    return zonasFijas()
  }
}

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** "Martina Gómez" → "Martina"; el "vos" que pone Hilo cuando no hay nombre no cuenta. */
const primerNombre = (s: unknown) => {
  const n = typeof s === 'string' ? s.trim().split(/\s+/)[0] : ''
  return n && n.toLowerCase() !== 'vos' ? n : null
}

/** Su link de seguimiento, si existe (el token lo arma Hilo). */
async function clienteDelLink(token: string | undefined, vista: string | undefined) {
  if (!token || !/^[A-Za-z0-9_-]{4,64}$/.test(token)) return null
  const sel = await getSeleccion(token).catch(() => null)
  if (!sel) return null
  return { token, nombre: primerNombre(sel.clientName), asesor: primerNombre(sel.agentName), soloMirar: vista === 'asesor' }
}

export default async function ConoceTuHogarPage({ searchParams }: { searchParams: SP }) {
  const tipo = first(searchParams.tipo)
  const tipoInicial = esTipoHogar(tipo) ? tipo : 'house'
  const tope = Number(first(searchParams.tope)) || 0
  const [zonas, cliente] = await Promise.all([catalogo(), clienteDelLink(first(searchParams.s), first(searchParams.vista))])
  const medio = (first(searchParams.utm_medium) ?? '').toLowerCase()
  return (
    <ConoceTuHogar
      catalogo={zonas}
      zonaInicial={first(searchParams.zona) ?? null}
      tipoInicial={tipoInicial}
      // Su presupuesto tal cual (link del asesor o de la pauta): se busca ±15 %.
      topeInicial={tope > 0 && tope <= 20_000_000 ? Math.round(tope) : null}
      dormInicial={dormMinValido(first(searchParams.dorm))}
      barrioInicial={barrioHogarValido(first(searchParams.barrio))}
      cliente={cliente}
      desdePauta={first(searchParams.origen) === 'pauta' || ['pauta', 'paid', 'cpc', 'paid_social'].includes(medio)}
      abrirAlCargar={first(searchParams.abrir) === '1'}
    />
  )
}
