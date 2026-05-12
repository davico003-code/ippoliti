// Endpoint de desarrollo: renderiza una portada de ejemplo y la devuelve
// como PNG. Solo disponible en dev. En prod devuelve 404.
//
// Uso: GET http://localhost:3000/api/placas/dev/portada
//      → descarga/muestra el PNG de 1080×1350

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Placa } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const PLACA_PORTADA_DEMO: Placa = {
  orden: 1,
  fondo: 'verde-profundo',
  nombre: 'portada',
  head_bar_izquierda: 'SI · Reporte 02',
  head_bar_derecha: 'Funes · Oct 2025',
  meta_foot: 'Deslizá →',
  bloques: [
    { tipo: 'eyebrow', texto: 'Inversión en Funes' },
    {
      tipo: 'titulo',
      texto: '¿Qué es el *ROI* y por qué **deberías** calcularlo?',
    },
    {
      tipo: 'bajada',
      texto:
        'La métrica que separa al que compra una casa del que hace una inversión. Aprendé a calcularla antes de firmar.',
    },
  ],
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const buffer = await renderPlaca(PLACA_PORTADA_DEMO)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': 'inline; filename="portada-demo.png"',
      },
    })
  } catch (err) {
    console.error('[placas/dev/portada]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
