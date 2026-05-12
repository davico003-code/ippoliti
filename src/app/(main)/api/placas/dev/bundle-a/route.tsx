// Endpoint dev para validar los bloques del bundle A: parrafo + fuente + handle.
// Renderiza una placa "frankestein" con los 3 bloques nuevos combinados con
// los ya validados (eyebrow, titulo, bajada).
//
// Query params:
//   ?t=1  portada-like con parrafo sm debajo de bajada (fondo verde-profundo)
//   ?t=2  caso con parrafo italic lg (fondo crema)
//   ?t=3  dato-shock like con parrafo xl + fuente (fondo verde-profundo)
//   ?t=4  cta-ish con eyebrow + titulo + parrafo + handle (fondo crema)

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Placa } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const PLACAS: Record<string, Placa> = {
  '1': {
    orden: 1,
    fondo: 'verde-profundo',
    nombre: 'portada-con-parrafo',
    head_bar_izquierda: 'SI · Reporte 03',
    head_bar_derecha: 'Funes · 2026',
    meta_foot: 'Deslizá →',
    bloques: [
      { tipo: 'eyebrow', texto: 'Inversión en Funes' },
      { tipo: 'titulo', texto: 'El número que todos miran pero *pocos calculan* bien' },
      { tipo: 'bajada', texto: 'Antes de firmar, hacé este cálculo. Te puede cambiar una decisión de USD 100.000.' },
    ],
  },
  '2': {
    orden: 2,
    fondo: 'crema',
    nombre: 'caso-real-parrafo-lg',
    head_bar_izquierda: 'Caso 01 · Venta · Funes',
    head_bar_derecha: 'Página 02 / 05',
    meta_foot: 'ROI real →',
    bloques: [
      {
        tipo: 'parrafo',
        tamaño: 'lg',
        italica: true,
        texto:
          '**Comprás un terreno en Funes a USD 30.000.** Lo vendés un año después a USD 40.000. ¿Cuánto rendiste realmente?',
      },
    ],
  },
  '3': {
    orden: 4,
    fondo: 'verde-profundo',
    nombre: 'dato-parrafo-xl-fuente',
    head_bar_izquierda: 'Dato del mercado',
    head_bar_derecha: 'Página 04 / 05',
    meta_foot: 'Cierre →',
    bloques: [
      { tipo: 'eyebrow', texto: 'Relevamiento propio' },
      {
        tipo: 'parrafo',
        tamaño: 'xl',
        texto:
          'de los que invierten en el **corredor oeste** *nunca calcularon* su ROI antes de comprar.',
      },
      { tipo: 'fuente', texto: '— Relevamiento propio SI Inmobiliaria, 200 operaciones 2024–2025.' },
    ],
  },
  '4': {
    orden: 5,
    fondo: 'crema',
    nombre: 'cta-like-sin-actions',
    head_bar_izquierda: 'SI · Comunidad',
    head_bar_derecha: 'Gracias por leer',
    meta_foot: '@inmobiliaria.si',
    bloques: [
      { tipo: 'eyebrow', texto: 'Si llegaste hasta acá' },
      {
        tipo: 'titulo',
        tamaño: 'lg',
        texto: 'Es porque te interesa **invertir con criterio**',
      },
      {
        tipo: 'parrafo',
        texto:
          'Somos una inmobiliaria familiar en **Funes, Roldán y Rosario** desde 1983. Seguinos para más data inmobiliaria honesta.',
      },
      { tipo: 'handle', texto: '@inmobiliaria.si' },
    ],
  },
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const t = url.searchParams.get('t') ?? '1'
  const placa = PLACAS[t]
  if (!placa) {
    return NextResponse.json({ error: `t=${t} inválido. Usar t=1|2|3|4` }, { status: 400 })
  }

  try {
    const buffer = await renderPlaca(placa)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="bundle-a-${t}.png"`,
      },
    })
  } catch (err) {
    console.error(`[placas/dev/bundle-a t=${t}]`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
