import { NextResponse, type NextRequest } from 'next/server'
import { getBarrioBySlug } from '@/lib/barrios'
import { getPropiedadesByBarrio } from '@/lib/tokko/fetch-propiedades-por-barrio'

export const revalidate = 3600 // 1h

type TipoPropiedad = 'Terreno' | 'Casa' | 'Departamento' | 'Todos'

const TIPOS_VALIDOS: TipoPropiedad[] = ['Terreno', 'Casa', 'Departamento', 'Todos']

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const barrio = getBarrioBySlug(params.slug)
  if (!barrio) {
    return NextResponse.json({ error: 'Barrio no encontrado' }, { status: 404 })
  }

  const tipoParam = request.nextUrl.searchParams.get('tipo') ?? 'Todos'
  const tipo = (TIPOS_VALIDOS.includes(tipoParam as TipoPropiedad)
    ? tipoParam
    : 'Todos') as TipoPropiedad

  try {
    const result = await getPropiedadesByBarrio(params.slug, tipo)
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[api/barrios/propiedades] error:', err)
    return NextResponse.json(
      { error: 'No se pudieron cargar propiedades' },
      { status: 500 },
    )
  }
}
