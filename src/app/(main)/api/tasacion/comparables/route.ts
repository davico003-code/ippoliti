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

  // m² presentes pero fuera de rango → 400 explícito. Si los descartáramos en
  // silencio, devolveríamos un rango sin filtro de m² que parece válido.
  const m2CubRaw = sp.get('m2Cubiertos')
  const m2LoteRaw = sp.get('m2Lote')
  const m2Cubiertos = numOpt(m2CubRaw, 1, 100000)
  const m2Lote = numOpt(m2LoteRaw, 1, 10000000)
  if (m2CubRaw?.trim() && m2Cubiertos == null) {
    return NextResponse.json({ error: 'm2Cubiertos fuera de rango (1 a 100.000)' }, { status: 400 })
  }
  if (m2LoteRaw?.trim() && m2Lote == null) {
    return NextResponse.json({ error: 'm2Lote fuera de rango (1 a 10.000.000)' }, { status: 400 })
  }

  let data
  try {
    data = await obtenerComparables({
      barrioId,
      tipo,
      m2Cubiertos,
      m2Lote,
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
