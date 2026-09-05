import { NextRequest, NextResponse } from 'next/server'
import { obtenerComparables, respuestaNivel4, TIPOS_TASACION } from '@/lib/tasacion/hilo'
import type { TipoTasacion } from '@/lib/tasacion/types'

// Proxy a Hilo GET /api/public/tasacion/comparables. Valida la query, cachea
// 10 min (fetch interno con revalidate 600) y ante cualquier falla responde
// nivel 4: la página nunca se rompe.
export const dynamic = 'force-dynamic'

const numOpt = (v: string | null, min: number, max: number): number | null => {
  if (v == null || v.trim() === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const barrioId = (sp.get('barrioId') ?? '').trim().slice(0, 64)
  const tipo = (sp.get('tipo') ?? 'casa').trim().toLowerCase() as TipoTasacion

  if (!barrioId || !/^[\w.:-]+$/.test(barrioId)) {
    return NextResponse.json({ error: 'barrioId inválido' }, { status: 400 })
  }
  if (!TIPOS_TASACION.includes(tipo)) {
    return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })
  }

  const lat = numOpt(sp.get('lat'), -90, 90)
  const lng = numOpt(sp.get('lng'), -180, 180)

  let data
  try {
    data = await obtenerComparables({
      barrioId,
      tipo,
      m2Cubiertos: numOpt(sp.get('m2Cubiertos'), 1, 100000),
      m2Lote: numOpt(sp.get('m2Lote'), 1, 10000000),
      lat: lat != null && lng != null ? lat : null,
      lng: lat != null && lng != null ? lng : null,
    })
  } catch (err) {
    console.warn('[tasacion] comparables fallo total:', err)
    data = respuestaNivel4()
  }

  return NextResponse.json(data, {
    headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' },
  })
}
