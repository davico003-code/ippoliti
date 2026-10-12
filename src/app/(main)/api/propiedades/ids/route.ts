import { NextResponse } from 'next/server'
import { getProperties } from '@/lib/tokko'

// Los ids de las propiedades publicadas hoy (~3 KB). Lo lee el middleware para
// dejar pasar las fichas vivas sin consultarle a Hilo en cada visita; por una
// que NO está en esta lista, el middleware le pregunta a Hilo antes de
// redirigirla (la lista puede tener unos minutos). Usa el listado "vivo"
// (tag 'tokko-properties'): cuando Hilo publica o da de baja, se refresca solo.

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getProperties()
    const ids = (data.objects ?? []).map((p) => p.id).filter((id) => Number.isFinite(id))
    return NextResponse.json({ ids }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (err) {
    console.error('[propiedades/ids]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'sin_listado' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
