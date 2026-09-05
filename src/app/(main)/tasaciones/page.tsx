// /tasaciones — "¿Cuánto vale tu casa hoy?" en 3 pasos, una sola página.
// El SEO (metadata + JSON-LD) vive en layout.tsx. Los barrios se cargan en el
// servidor para que los chips pinten con la página, sin layout shift.
//
// Query params: ?barrio=<slug>&tipo=casa|lote|depto (los anuncios linkean así;
// ?zona=<nombre> es compat con el link viejo del tasador de /tasar).

import TasacionFlow from '@/components/tasaciones/TasacionFlow'
import { obtenerBarrios } from '@/lib/tasacion/hilo'

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function TasacionesPage({ searchParams }: { searchParams: SP }) {
  const barrios = await obtenerBarrios().catch(() => [])
  return (
    <TasacionFlow
      barrios={barrios}
      barrioInicial={first(searchParams.barrio)}
      tipoInicial={first(searchParams.tipo)}
      zonaInicial={first(searchParams.zona)}
    />
  )
}
