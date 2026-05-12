// Endpoint dev — valida numero-hero + numero-shock + breakdown.
// Renderiza las placas 2 y 4 del carrusel real del extractor (paso 3) ahora
// que los bloques están disponibles.
//
// Query:
//   ?t=caso-real          → placa 2 (caso-concreto del carrusel real)
//   ?t=dato-shock         → placa 4 (dato-mercado del carrusel real)
//   ?t=numero-solo        → placa con solo numero-hero aislado (para test visual)

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Placa } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const PLACAS: Record<string, Placa> = {
  'caso-real': {
    orden: 2,
    fondo: 'crema',
    nombre: 'caso-concreto',
    head_bar_izquierda: 'Caso 01 · Venta · Funes',
    head_bar_derecha: 'Página 02 / 05',
    meta_foot: 'ROI real →',
    bloques: [
      { tipo: 'eyebrow', texto: 'Caso concreto · Terreno Funes' },
      {
        tipo: 'parrafo',
        tamaño: 'lg',
        italica: true,
        texto: '**Compraste a USD 30.000, vendés a USD 40.000.** Parece +33%, ¿no? En realidad son 21,2% netos después de gastos.',
      },
      {
        tipo: 'numero-hero',
        valor: '21',
        sup: ',2%',
        anotacion_valor: '+ USD 7.000',
        anotacion_label: 'GANANCIA NETA · 12 MESES',
      },
      {
        tipo: 'breakdown',
        items: [
          { label: 'Compra', valor: 'USD 30.000' },
          { label: 'Gastos', valor: 'USD 3.000' },
          { label: 'Venta', valor: 'USD 40.000' },
        ],
      },
    ],
  },
  'dato-shock': {
    orden: 4,
    fondo: 'verde-profundo',
    nombre: 'dato-mercado',
    head_bar_izquierda: 'Dato del mercado',
    head_bar_derecha: 'Página 04 / 05',
    meta_foot: 'Cierre →',
    bloques: [
      { tipo: 'eyebrow', texto: 'Relevamiento propio' },
      { tipo: 'numero-shock', valor: '73', sup: '%' },
      {
        tipo: 'parrafo',
        tamaño: 'xl',
        texto:
          'de los que invierten en el **corredor oeste** *nunca calcularon* su ROI antes de comprar.',
      },
      {
        tipo: 'fuente',
        texto: '— Relevamiento SI Inmobiliaria, 200 operaciones 2024–2025.',
      },
    ],
  },
  'numero-solo': {
    orden: 3,
    fondo: 'blanco',
    nombre: 'numero-solo',
    head_bar_izquierda: 'Promedio Funes Lake',
    head_bar_derecha: 'Mercado · 2026',
    meta_foot: 'Siguiente →',
    bloques: [
      { tipo: 'eyebrow', texto: 'Precio por m² · Funes Lake' },
      {
        tipo: 'numero-hero',
        valor: '850',
        sup: ' USD/m²',
        anotacion_valor: '+12%',
        anotacion_label: 'VS 2024',
      },
      {
        tipo: 'fuente',
        texto: '— Relevamiento propio SI Inmobiliaria, 2026.',
      },
    ],
  },
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const t = url.searchParams.get('t') ?? 'caso-real'
  const placa = PLACAS[t]
  if (!placa) {
    return NextResponse.json(
      { error: `t=${t} inválido. Usar: ${Object.keys(PLACAS).join(' | ')}` },
      { status: 400 },
    )
  }

  try {
    const buffer = await renderPlaca(placa)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="bundle-b-${t}.png"`,
      },
    })
  } catch (err) {
    console.error(`[placas/dev/bundle-b t=${t}]`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
