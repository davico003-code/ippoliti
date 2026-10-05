// /conoce-tu-hogar — "Conocé tu próximo hogar": dónde busca, qué y hasta
// cuánto, y el mazo tipo Tinder (nuestras + "En red"). Se llega desde el link
// debajo del buscador de la home (celu). Query params: ?zona=<nombre>&tipo=house|lot|apartment&tope=<usd>&dorm=<1-5>
//
// Dónde se puede buscar lo dice Hilo (barrios y ciudades con algo en venta,
// nuestras o de la red): se carga en el servidor, así las sugerencias salen
// al tipear sin esperar.

import type { Metadata } from 'next'
import ConoceTuHogar from '@/components/hogar/ConoceTuHogar'
import { type TipoHogar, type ZonaHogar, dormMinValido, esTipoHogar } from '@/lib/feed-en-red'
import { type BarrioPortada, type NuestraPortada, armarPortadas } from '@/lib/hogar-portadas'
import { getMainPhoto, getProperties, sanitizeProperty } from '@/lib/tokko'
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

/** Las nuestras en venta (mismo listado cacheado que usa el resto de la web). */
async function nuestras(): Promise<NuestraPortada[]> {
  try {
    const d = await getProperties()
    return (d.objects ?? []).map(sanitizeProperty).map((p) => {
      const venta = (p.operations ?? []).find((o) => o.operation_type === 'Sale')
      return {
        tipoId: p.type?.id ?? null,
        barrio: p.location?.name ?? null,
        ubicacionCompleta: p.location?.full_location ?? null,
        foto: venta ? getMainPhoto(p) : null,
        destacada: !!p.is_starred_on_web,
        precioUsd: venta?.prices?.find((x) => x.currency === 'USD' && x.price > 0)?.price ?? null,
      }
    })
  } catch (e) {
    console.warn('[conoce-tu-hogar] nuestras', e instanceof Error ? e.message : e)
    return []
  }
}

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function ConoceTuHogarPage({ searchParams }: { searchParams: SP }) {
  const tipo = first(searchParams.tipo)
  const tope = Number(first(searchParams.tope))
  const [zonas, propias] = await Promise.all([catalogo(), nuestras()])
  const portadas = Object.fromEntries(
    (['house', 'lot', 'apartment'] as const).map((t) => [t, armarPortadas(zonas, propias, t)]),
  ) as Record<TipoHogar, BarrioPortada[]>
  return (
    <ConoceTuHogar
      catalogo={zonas}
      portadas={portadas}
      zonaInicial={first(searchParams.zona) ?? null}
      tipoInicial={esTipoHogar(tipo) ? tipo : 'house'}
      topeInicial={Number.isFinite(tope) && tope > 0 ? Math.round(tope) : null}
      dormInicial={dormMinValido(first(searchParams.dorm))}
    />
  )
}
