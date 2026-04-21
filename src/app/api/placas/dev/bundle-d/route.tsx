// Endpoint dev — valida cta-actions + cierre E2E con la placa 5 del carrusel
// real que generó el extractor.
//
// ?t=cta-real       placa 5 real del extractor (paso 3) ahora renderizable
// ?t=destacado-like highlight cambiado a 'like'
// ?t=sobre-dark     cta-actions sobre fondo verde-profundo

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Placa } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const PLACAS: Record<string, Placa> = {
  'cta-real': {
    orden: 5,
    fondo: 'crema',
    nombre: 'cta-final',
    head_bar_izquierda: 'SI · Comunidad',
    head_bar_derecha: 'Gracias por leer',
    meta_foot: '@inmobiliaria.si',
    bloques: [
      { tipo: 'eyebrow', texto: 'Si llegaste hasta acá' },
      {
        tipo: 'titulo',
        tamaño: 'md',
        texto: 'Es porque te interesa **invertir mejor**.',
      },
      {
        tipo: 'parrafo',
        texto:
          'Somos una inmobiliaria familiar en **Funes, Roldán y Rosario** desde 1983. Nos ayudás a seguir compartiendo contenido si hacés estas tres cosas:',
      },
      { tipo: 'cta-actions', destacado: 'seguir' },
    ],
  },
  'destacado-like': {
    orden: 5,
    fondo: 'crema',
    nombre: 'cta-highlight-like',
    head_bar_izquierda: 'SI · Comunidad',
    head_bar_derecha: 'Gracias por leer',
    meta_foot: '@inmobiliaria.si',
    bloques: [
      { tipo: 'eyebrow', texto: 'Te sirvió?' },
      {
        tipo: 'titulo',
        tamaño: 'lg',
        texto: 'Dejanos *tu like*.',
      },
      {
        tipo: 'parrafo',
        texto:
          'Cada like nos ayuda a seguir creando contenido honesto sobre el mercado del corredor oeste.',
      },
      { tipo: 'cta-actions', destacado: 'like' },
    ],
  },
  'sobre-dark': {
    orden: 5,
    fondo: 'verde-profundo',
    nombre: 'cta-dark',
    head_bar_izquierda: 'SI · Comunidad',
    head_bar_derecha: 'Última',
    meta_foot: '@inmobiliaria.si',
    bloques: [
      { tipo: 'eyebrow', texto: 'Final del carrusel' },
      {
        tipo: 'titulo',
        tamaño: 'md',
        texto: '*Invertir con criterio* empieza por saber leer el mercado.',
      },
      { tipo: 'cta-actions', destacado: 'seguir' },
    ],
  },
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const t = new URL(req.url).searchParams.get('t') ?? 'cta-real'
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
        'Content-Disposition': `inline; filename="bundle-d-${t}.png"`,
      },
    })
  } catch (err) {
    console.error(`[placas/dev/bundle-d t=${t}]`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
