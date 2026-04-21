// E2E dev — renderiza cada una de las 5 placas del carrusel real
// generado por el extractor (paso 3) sobre la nota mock ROI-Funes.
//
// ?i=1..5  → PNG individual
//
// Este carrusel es el output verbatim que Claude Sonnet devolvió corriendo
// `/api/placas/dev/extractor`. Lo fijamos acá para poder iterar los PNGs sin
// quemar tokens en cada render.

import { NextResponse } from 'next/server'
import { renderPlaca } from '@/agents/placas/lib/renderer'
import type { Carrusel } from '@/agents/placas/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const CARRUSEL: Carrusel = {
  total: 5,
  placas: [
    {
      orden: 1,
      fondo: 'verde-profundo',
      nombre: 'portada',
      head_bar_izquierda: 'SI · Reporte 03',
      head_bar_derecha: 'Funes · Enero 2026',
      meta_foot: 'Deslizá →',
      bloques: [
        { tipo: 'eyebrow', texto: 'Inversión en Funes' },
        {
          tipo: 'titulo',
          texto:
            'El número que separa una *buena compra* de una **mala inversión**',
          tamaño: 'lg',
        },
        {
          tipo: 'bajada',
          texto:
            'Antes de firmar, hacé este cálculo. Te puede cambiar una decisión de USD 100.000.',
        },
      ],
    },
    {
      orden: 2,
      fondo: 'crema',
      nombre: 'caso-concreto',
      head_bar_izquierda: 'SI · Reporte 03',
      head_bar_derecha: 'Página 02 / 05',
      meta_foot: 'Próximo →',
      bloques: [
        { tipo: 'eyebrow', texto: 'Caso real · Funes 2024' },
        {
          tipo: 'parrafo',
          texto:
            'Compraste un terreno a USD 30.000. Lo vendés un año después a USD 40.000. Parece +33%, pero después de escribanía, comisión y sellados, son 21,2% netos.',
          italica: true,
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
            { label: 'Gastos totales', valor: 'USD 3.000' },
            { label: 'Venta', valor: 'USD 40.000' },
          ],
        },
      ],
    },
    {
      orden: 3,
      fondo: 'verde-profundo',
      nombre: 'dato-shock',
      alineacion: 'centro',
      head_bar_izquierda: 'SI · Reporte 03',
      head_bar_derecha: 'Página 03 / 05',
      meta_foot: 'Próximo →',
      bloques: [
        { tipo: 'numero-shock', valor: '73', sup: '%' },
        {
          tipo: 'parrafo',
          texto:
            'De los inversores del corredor oeste nunca calculó su ROI antes de comprar. Entraron por intuición o porque el barrio está subiendo. Sin el cálculo, no sabés si vas a recuperar con rentabilidad superior a un plazo fijo.',
          tamaño: 'lg',
        },
        {
          tipo: 'fuente',
          texto: '— Relevamiento SI Inmobiliaria sobre 200 operaciones 2024-2025',
        },
      ],
    },
    {
      orden: 4,
      fondo: 'blanco',
      nombre: 'checklist',
      head_bar_izquierda: 'SI · Reporte 03',
      head_bar_derecha: 'Página 04 / 05',
      meta_foot: 'Última →',
      bloques: [
        { tipo: 'eyebrow', texto: 'Antes de invertir en Funes o Roldán' },
        {
          tipo: 'lista',
          titulo: '4 cosas que miramos antes de aconsejar',
          items: [
            'Ubicación real, no el nombre del barrio. Cercanía a ruta, escuelas, centros comerciales.',
            'Servicios asegurados: agua de red, cloacas, gas natural, pavimento.',
            'Velocidad del barrio: cuántas construcciones hay en marcha, perfil de vecinos.',
            'Horizonte de venta: hay zonas que se valorizan en 1 año, otras en 5.',
          ],
          estilo: 'numerada',
        },
      ],
    },
    {
      orden: 5,
      fondo: 'crema',
      nombre: 'cta',
      head_bar_izquierda: 'SI · Comunidad',
      head_bar_derecha: 'Gracias por leer',
      meta_foot: '@inmobiliaria.si',
      bloques: [
        { tipo: 'eyebrow', texto: 'Si llegaste hasta acá' },
        {
          tipo: 'titulo',
          texto: 'Es porque querés *invertir con criterio*',
          tamaño: 'lg',
        },
        {
          tipo: 'parrafo',
          texto:
            'En Funes y Roldán siempre hay oportunidades. Solo hay que saber leerlas. El ROI bien calculado es la primera herramienta — la que separa al que compra una casa del que hace una inversión.',
        },
        { tipo: 'cta-actions', destacado: 'seguir' },
      ],
    },
  ],
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const iRaw = new URL(req.url).searchParams.get('i') ?? '1'
  const i = Number(iRaw)
  if (!Number.isInteger(i) || i < 1 || i > CARRUSEL.total) {
    return NextResponse.json(
      { error: `i=${iRaw} inválido. Rango: 1..${CARRUSEL.total}` },
      { status: 400 },
    )
  }
  const placa = CARRUSEL.placas[i - 1]
  try {
    const buffer = await renderPlaca(placa)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="e2e-${i}-${placa.nombre}.png"`,
      },
    })
  } catch (err) {
    console.error(`[placas/dev/e2e i=${i}]`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render-failed' },
      { status: 500 },
    )
  }
}
