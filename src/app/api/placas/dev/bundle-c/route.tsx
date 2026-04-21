// Endpoint dev — valida bloque lista con 3 variantes.
//
// ?t=numerada      lista clásica del HTML de referencia (4 items, headline con inline markdown, fondo crema)
// ?t=bullets       variante bullets (círculos verdes) sobre blanco
// ?t=dark-numerada sobre fondo verde-profundo

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Placa } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const PLACAS: Record<string, Placa> = {
  numerada: {
    orden: 3,
    fondo: 'crema',
    nombre: 'lista-numerada-crema',
    head_bar_izquierda: 'Antes de invertir',
    head_bar_derecha: 'Página 03 / 06',
    meta_foot: 'Alquiler →',
    bloques: [
      {
        tipo: 'lista',
        titulo: '**4 cosas que miramos** antes de invertir en *Funes o Roldán*.',
        items: [
          '**Ubicación real,** no el nombre del barrio. Cercanía a ruta, escuelas y centro comercial.',
          '**Servicios asegurados:** agua de red, cloacas, gas natural y pavimento terminado.',
          '**Velocidad del barrio.** Cuántas construcciones hay en marcha y qué perfil de vecinos entra.',
          '**Horizonte de venta.** Hay zonas que se valorizan en 1 año y otras en 5.',
        ],
        estilo: 'numerada',
      },
    ],
  },
  bullets: {
    orden: 3,
    fondo: 'blanco',
    nombre: 'lista-bullets-blanco',
    head_bar_izquierda: 'Checklist del comprador',
    head_bar_derecha: 'Página 03 / 05',
    meta_foot: 'Siguiente →',
    bloques: [
      {
        tipo: 'lista',
        titulo: 'Lo que no podés olvidar al firmar.',
        items: [
          'Revisar el plano aprobado por el municipio.',
          'Chequear deudas de expensas e impuestos.',
          'Confirmar servicios y plazos de conexión.',
        ],
        estilo: 'bullets',
      },
    ],
  },
  'dark-numerada': {
    orden: 3,
    fondo: 'verde-profundo',
    nombre: 'lista-sobre-dark',
    head_bar_izquierda: 'Errores típicos',
    head_bar_derecha: 'Página 03 / 05',
    meta_foot: 'Dato →',
    bloques: [
      {
        tipo: 'lista',
        titulo: 'Tres errores que *no deberías* cometer.',
        items: [
          '**No calcular el ROI** antes de firmar, solo guiarse por intuición.',
          '**Confiar en proyecciones** de precios sin respaldo histórico.',
          '**Ignorar costos ocultos** como escribanía, comisión y sellados.',
        ],
        estilo: 'numerada',
      },
    ],
  },
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const t = new URL(req.url).searchParams.get('t') ?? 'numerada'
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
        'Content-Disposition': `inline; filename="bundle-c-${t}.png"`,
      },
    })
  } catch (err) {
    console.error(`[placas/dev/bundle-c t=${t}]`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
