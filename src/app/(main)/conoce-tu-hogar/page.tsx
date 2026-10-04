// /conoce-tu-hogar — "Conocé tu próximo hogar": dónde busca, qué y hasta
// cuánto, y el mazo tipo Tinder (nuestras + "En red"). Se llega desde el link
// debajo del buscador de la home. Query params: ?zona=<nombre>&tipo=house|lot|apartment&tope=<usd>

import type { Metadata } from 'next'
import ConoceTuHogar from '@/components/hogar/ConoceTuHogar'
import { esTipoHogar } from '@/lib/feed-en-red'

export const metadata: Metadata = {
  title: 'Conocé tu próximo hogar | SI INMOBILIARIA',
  description: 'Contanos dónde buscás y deslizá las casas de la zona: guardá con ♥ las que te gusten y un asesor te coordina las visitas.',
  alternates: { canonical: '/conoce-tu-hogar' },
}

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default function ConoceTuHogarPage({ searchParams }: { searchParams: SP }) {
  const tipo = first(searchParams.tipo)
  const tope = Number(first(searchParams.tope))
  return (
    <ConoceTuHogar
      zonaInicial={first(searchParams.zona) ?? null}
      tipoInicial={esTipoHogar(tipo) ? tipo : 'house'}
      topeInicial={Number.isFinite(tope) && tope > 0 ? Math.round(tope) : null}
    />
  )
}
