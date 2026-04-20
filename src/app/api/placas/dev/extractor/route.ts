// Endpoint dev: corre el extractor contra una nota real del Blob y devuelve
// el JSON del carrusel (sin renderizar).
//
// Uso:
//   GET /api/placas/dev/extractor              → usa una nota mock local
//                                                 (útil en local sin token Blob)
//   GET /api/placas/dev/extractor?slug=abc-def  → usa esa específica del Blob
//                                                 (requiere BLOB_READ_WRITE_TOKEN)

import { NextResponse } from 'next/server'
import { extraerCarrusel } from '@/agents/placas/lib/extractor'
import { leerNotaPorSlug } from '@/agents/placas/lib/leer-nota'
import type { NotaParaExtractor } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

// Nota de ejemplo para testear sin Vercel Blob. Refleja una nota real
// publicada por el writer del blog con datos local del corredor oeste.
const NOTA_MOCK: NotaParaExtractor = {
  titulo: '¿Qué es el ROI y por qué deberías calcularlo antes de invertir en Funes?',
  slug: 'roi-funes-inversion-2026',
  meta_description:
    'La métrica que separa una buena compra de una mala inversión. Cómo calcular ROI real en Funes y Roldán con datos de operaciones concretas 2024-2025.',
  bajada:
    'Antes de firmar, hacé este cálculo. Te puede cambiar una decisión de USD 100.000.',
  contenido_markdown: `## El número que todos miran pero pocos calculan bien

Compraste un terreno en Funes a USD 30.000. Lo vendés un año después a USD 40.000. Parece +33%, ¿no? En realidad son 21,2% netos después de gastos.

La diferencia son los costos de operación: escribanía, comisión, sellados. En el corredor oeste estos gastos típicamente suman 7-10% del valor de compra.

## Cómo se calcula bien

ROI = (Valor de venta - Gastos - Valor de compra) / Valor de compra

Con datos concretos:
- Compra: USD 30.000
- Gastos totales: USD 3.000 (10%)
- Venta: USD 40.000
- Ganancia neta: USD 7.000
- ROI: 21,2%

## Cuatro cosas que miramos antes de aconsejar

En SI Inmobiliaria, antes de presentar un terreno como "inversión", corroboramos:

1. Ubicación real, no el nombre del barrio. Cercanía a ruta, escuelas, centros comerciales.
2. Servicios asegurados: agua de red, cloacas, gas natural, pavimento.
3. Velocidad del barrio: cuántas construcciones hay en marcha, perfil de vecinos.
4. Horizonte de venta: hay zonas que se valorizan en 1 año, otras en 5.

## El dato del mercado

Según nuestro relevamiento propio sobre 200 operaciones 2024-2025, el 73% de los inversores del corredor oeste nunca calculó su ROI antes de comprar. Entraron por intuición o porque "el barrio está subiendo".

El problema: sin el cálculo, no sabés si vas a recuperar con rentabilidad superior a un plazo fijo. Y en 2026, con tasas reales bajas pero volatilidad en dólar, la diferencia importa.

## Lo que te llevás

En Funes y Roldán siempre hay oportunidades. Solo hay que saber leerlas. El ROI bien calculado es la primera herramienta — la que separa al que compra una casa del que hace una inversión.

— David Flores, Corredor Inmobiliario (Mat. N° 0621), SI Inmobiliaria`,
  keywords: ['ROI', 'inversión', 'Funes', 'Roldán', 'terreno', 'rentabilidad'],
  categoria: 'inversion',
  imagen_sugerida: 'terreno-funes-atardecer-inversion',
  imagen_url:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  try {
    let nota: NotaParaExtractor | null = null
    if (slug) {
      nota = await leerNotaPorSlug(slug)
      if (!nota) {
        return NextResponse.json(
          { error: `No encontré nota con slug "${slug}" en Blob` },
          { status: 404 },
        )
      }
    } else {
      // Fallback local: nota mock (no necesita Blob)
      nota = NOTA_MOCK
    }

    const t0 = Date.now()
    const resultado = await extraerCarrusel(nota)
    const ms = Date.now() - t0

    return NextResponse.json({
      nota: { titulo: nota.titulo, slug: nota.slug },
      ms,
      ...resultado,
    }, { status: resultado.ok ? 200 : 422 })
  } catch (err) {
    console.error('[placas/dev/extractor]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'extractor-failed' },
      { status: 500 },
    )
  }
}
