'use client'

// Lista de precios de un emprendimiento: filas compactas agrupadas por cantidad
// de dormitorios. Cada fila dice dónde está la unidad, su superficie, el precio
// y abre el plano. Recibe filas ya normalizadas (UnidadFila), así sirve igual
// para las unidades del CRM que para la lista viva del desarrollador (Brickfy).

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Map as MapIcon, Send } from 'lucide-react'
import type { UnidadFila } from '@/lib/unidadesFilas'
import { conCifras } from '@/components/emprendimiento/conCifras'
import ViewerModal, { type Viewer } from '@/components/ViewerModal'

interface Props {
  filas: UnidadFila[]
  devName: string
  whatsappUrl: string
  location?: string
  /** URL absoluta de la página del emprendimiento — habilita "Enviar lista de precios". */
  pageUrl?: string
}

const porPrecio = (a: UnidadFila, b: UnidadFila) =>
  (a.precio || Number.MAX_SAFE_INTEGER) - (b.precio || Number.MAX_SAFE_INTEGER)

const formatPrecio = (f: UnidadFila) =>
  f.precio > 0 ? `${f.moneda} ${f.precio.toLocaleString('es-AR')}` : 'Consultar'

export default function DevUnitsSection({ filas, devName, whatsappUrl, location, pageUrl }: Props) {
  const [viewer, setViewer] = useState<Viewer | null>(null)

  // Link wa.me SIN número: abre WhatsApp con la lista completa de precios ya
  // redactada y deja elegir el destinatario. Se arma desde las filas vivas, así
  // la lista nunca queda desactualizada.
  const priceListHref = useMemo(() => {
    if (!pageUrl || !filas.some(f => f.precio > 0)) return null
    const lines = filas.slice().sort(porPrecio).map(f => {
      const parts = [f.etiqueta, ...(f.m2 > 0 && !f.etiqueta.includes('m²') ? [`${f.m2.toLocaleString('es-AR')} m²`] : [])]
      return `▪️ ${parts.join(' · ')} — ${f.precio > 0 ? `*${formatPrecio(f)}*` : 'Consultar'}`
    })
    const msg = [
      `*Lista de precios — ${devName}*${location && !devName.toLowerCase().includes(location.toLowerCase()) ? ` (${location})` : ''}`,
      `${filas.length} unidad${filas.length !== 1 ? 'es' : ''} en venta:`,
      '',
      ...lines,
      '',
      `Más info y fotos: ${pageUrl}`,
      'SI INMOBILIARIA · (341) 334-0916',
    ].join('\n')
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }, [filas, devName, location, pageUrl])

  // Un grupo por cantidad de dormitorios, cada uno de menor a mayor precio.
  const grupos = useMemo(() => {
    const map = new Map<number, UnidadFila[]>()
    for (const f of filas) map.set(f.dorms, [...(map.get(f.dorms) || []), f])
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([dorms, items]) => ({ dorms, items: items.sort(porPrecio) }))
  }, [filas])

  if (filas.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="mb-4 text-gray-600">No hay unidades cargadas en este momento.</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1ea952]">
          Consultanos por disponibilidad
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-9">
        {grupos.map(g => {
          const desde = g.items.find(f => f.precio > 0)
          return (
            <div key={g.dorms}>
              <div className="flex items-baseline justify-between gap-3 border-b-2 border-gray-900 pb-2">
                <h3 className="text-lg font-black tracking-[-0.01em] text-gray-900 md:text-xl">
                  {g.dorms > 0 ? (
                    <>
                      <span className="font-numeric">{g.dorms}</span> dormitorio{g.dorms > 1 ? 's' : ''}
                    </>
                  ) : (
                    'Monoambientes y otros'
                  )}
                </h3>
                {desde && (
                  <p className="text-sm text-gray-500">
                    desde <span className="font-numeric font-semibold text-gray-900">{formatPrecio(desde)}</span>
                  </p>
                )}
              </div>

              <ul className="divide-y divide-gray-200">
                {g.items.map(f => (
                  <li
                    key={f.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 py-4 md:grid-cols-[minmax(0,1fr)_96px_150px_auto]"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-bold leading-snug text-gray-900 md:text-base">
                        <span>{conCifras(f.etiqueta)}</span>
                        {f.reservada && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                            Reservada
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        <span className="font-numeric md:hidden">
                          {f.m2 > 0 ? `${f.m2.toLocaleString('es-AR')} m²` : ''}
                          {f.m2 > 0 && f.detalle ? ' · ' : ''}
                        </span>
                        {f.detalle && conCifras(f.detalle)}
                      </p>
                    </div>

                    <p className="hidden text-right text-[15px] text-gray-700 font-numeric md:block">
                      {f.m2 > 0 ? `${f.m2.toLocaleString('es-AR')} m²` : '—'}
                    </p>

                    <p className="text-right text-lg font-bold text-[#1A5C38] font-numeric md:text-xl">
                      {formatPrecio(f)}
                    </p>

                    {(f.planos.length > 0 || f.href) && (
                      <div className="col-span-2 flex gap-2 md:col-span-1 md:justify-end">
                        {f.planos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setViewer({ kind: 'images', title: `${f.etiqueta} — Plano`, urls: f.planos })}
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 px-4 text-sm font-bold text-gray-700 transition-colors hover:border-[#1A5C38] hover:text-[#1A5C38] md:flex-none"
                          >
                            <MapIcon className="h-4 w-4" aria-hidden />
                            Plano
                          </button>
                        )}
                        {f.href && (
                          <Link
                            href={f.href}
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1A5C38] px-4 text-sm font-bold text-white transition-colors hover:bg-[#145030] md:flex-none"
                          >
                            Ver unidad
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {priceListHref && (
        <div className="mt-6 flex justify-center sm:justify-end">
          <a
            href={priceListHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition-colors hover:border-[#1A5C38] hover:text-[#1A5C38]"
          >
            <Send className="h-4 w-4" aria-hidden />
            Enviar lista de precios
          </a>
        </div>
      )}

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </div>
  )
}
