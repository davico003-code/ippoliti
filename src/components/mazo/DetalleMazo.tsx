'use client'

// "VER DETALLES" de una tarjeta del Tinder (David, 4-oct-2026: "la ubicación
// exacta rápidamente si la tenemos y demás características en un vistazo").
// Hoja que sube adentro del mazo, sin salir: precio y datos principales, la
// ubicación con el mapa, el resto de los datos, las características y la
// descripción. Son las MISMAS piezas de la ficha neutra (/v): DatosClave,
// LocationMap, AmenityChips, StructuredDescription. Abajo, ✕ y ♥ para decidir
// ahí mismo.

import { useEffect, useState } from 'react'
import { ChevronLeft, MapPin, X } from 'lucide-react'
import type { FichaSnapshot } from '@/lib/ficha'
import type { ItemFeed } from '@/lib/feed-en-red'
import { limpiarTextoNeutro } from '@/lib/ficha-titular'
import { DatosFicha, StatsFicha } from '@/components/v/DatosClave'
import LocationMap from '@/components/v/LocationMap'
import AmenityChips from '@/components/v/AmenityChips'
import StructuredDescription from '@/components/v/StructuredDescription'

export type DetalleRespuesta = {
  snapshot: Omit<FichaSnapshot, 'fotos' | 'blueprints' | 'ogImage'>
  /** true = el punto es la ubicación real (nuestras); false = aproximada (colegas). */
  exacta: boolean
}

/** Lo ya traído en esta visita: abrir el mismo detalle dos veces es instantáneo. */
const cache = new Map<string, Promise<DetalleRespuesta | null>>()

export function cargarDetalle(key: string): Promise<DetalleRespuesta | null> {
  let p = cache.get(key)
  if (!p) {
    p = fetch(`/api/propiedades/detalle-mazo?id=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? (r.json() as Promise<DetalleRespuesta>) : null))
      .catch(() => null)
      .then((d) => {
        if (!d) cache.delete(key) // un error no queda guardado: se puede reintentar
        return d
      })
    cache.set(key, p)
  }
  return p
}

export default function DetalleMazo({
  item,
  guardada,
  onCerrar,
  onPaso,
  onMeGusta,
  onQuieroVerla,
}: {
  item: ItemFeed
  guardada: boolean
  onCerrar: () => void
  onPaso: () => void
  onMeGusta: () => void
  /** ★ "Quiero conocerla" (coordinar la visita), igual que en la tarjeta. */
  onQuieroVerla?: () => void
}) {
  const [estado, setEstado] = useState<'cargando' | 'error' | DetalleRespuesta>('cargando')
  const [intento, setIntento] = useState(0)
  // "Ver la ficha completa" (nuestras) se abre ACÁ ADENTRO, como en la selección
  // del cliente (/seleccion/ficha/…: la misma ficha sin menú ni pie): antes
  // sacaba del Tinder y al volver se perdía dónde estaba.
  const [completa, setCompleta] = useState(false)
  const [completaCargada, setCompletaCargada] = useState(false)
  const urlCompleta = item.esNuestra && item.href?.startsWith('/propiedades/') ? item.href.replace('/propiedades/', '/seleccion/ficha/') : null

  useEffect(() => {
    let vivo = true
    setEstado('cargando')
    cargarDetalle(item.key).then((d) => {
      if (vivo) setEstado(d ?? 'error')
    })
    return () => {
      vivo = false
    }
  }, [item.key, intento])

  const d = typeof estado === 'object' ? estado : null
  const s: FichaSnapshot | null = d ? { ...d.snapshot, fotos: [], blueprints: [], ogImage: null } : null
  const descripcion = s ? (item.esNuestra ? s.descripcion : limpiarTextoNeutro(s.descripcion)) : ''
  const conMapa = s && typeof s.lat === 'number' && typeof s.lng === 'number'
  const direccion = item.direccion || s?.zonaCompleta || item.zona

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-black/30" role="dialog" aria-modal="true" aria-label={`Detalles: ${item.titulo || item.precio}`}>
      <div className="mt-auto flex h-[92%] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.15)]">
        <header className="flex items-center gap-2 border-b border-gray-100 px-2 py-2">
          <button
            type="button"
            onClick={() => (completa ? setCompleta(false) : onCerrar())}
            className="flex h-11 items-center gap-0.5 rounded-full pl-1.5 pr-3 text-[15px] font-semibold text-gray-800 hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Volver
          </button>
          <p className="min-w-0 flex-1 truncate pr-3 text-right text-[14px] text-gray-500">{s?.tituloGenerico || item.titulo}</p>
        </header>

        {completa && urlCompleta && (
          <div className="relative min-h-0 flex-1 bg-gray-50">
            {!completaCargada && (
              <div className="absolute inset-0 grid place-items-center" aria-label="Cargando la ficha">
                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#1A5C38]" />
              </div>
            )}
            <iframe
              src={urlCompleta}
              title={`Ficha: ${item.titulo || item.precio}`}
              onLoad={() => setCompletaCargada(true)}
              className="h-full w-full border-0 bg-white"
              style={{ opacity: completaCargada ? 1 : 0, transition: 'opacity 200ms' }}
            />
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 ${completa && urlCompleta ? 'hidden' : ''}`}>
          <p className="text-[26px] font-black leading-none text-gray-900 font-numeric">{item.precio}</p>
          {/* Mientras carga, la línea de la tarjeta; después, la fila de íconos (no se repiten). */}
          {item.datos && typeof estado !== 'object' && <p className="mt-1.5 text-[16px] text-gray-700 font-poppins">{item.datos}</p>}

          {estado === 'cargando' && (
            <div className="mt-5 space-y-3" aria-label="Cargando los detalles">
              <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-[220px] animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          )}

          {estado === 'error' && (
            <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-[16px] text-gray-700">No pudimos traer los detalles.</p>
              <button type="button" onClick={() => setIntento((n) => n + 1)} className="mt-3 h-11 rounded-xl border border-gray-200 bg-white px-5 font-semibold text-gray-800">
                Reintentar
              </button>
            </div>
          )}

          {s && (
            <>
              <div className="mt-4">
                <StatsFicha snapshot={s} />
              </div>

              <section className="mt-6" aria-labelledby="detalle-ubicacion">
                <h3 id="detalle-ubicacion" className="text-[17px] font-bold text-gray-900">
                  Ubicación
                </h3>
                {direccion && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[16px] text-gray-800">
                    <MapPin className="mt-0.5 h-5 w-5 flex-none text-gray-500" aria-hidden="true" />
                    <span>{direccion}</span>
                  </p>
                )}
                {conMapa ? (
                  <>
                    <div className="mt-3 detalle-mapa">
                      <LocationMap lat={s.lat as number} lng={s.lng as number} />
                    </div>
                    <p className="mt-1.5 text-[14px] text-gray-500">{d!.exacta ? 'Ubicación exacta' : 'El punto del mapa es aproximado'}</p>
                  </>
                ) : (
                  <p className="mt-1.5 text-[15px] text-gray-500">Esta propiedad no tiene el punto en el mapa.</p>
                )}
              </section>

              <section className="mt-6">
                <DatosFicha snapshot={s} />
              </section>

              {s.caracteristicas?.length > 0 && (
                <section className="mt-6">
                  <AmenityChips caracteristicas={s.caracteristicas} extras={s.extras} />
                </section>
              )}

              {descripcion.trim() && (
                <section className="mt-6">
                  <StructuredDescription text={descripcion} />
                </section>
              )}

              {urlCompleta && (
                <button
                  type="button"
                  onClick={() => setCompleta(true)}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 text-[16px] font-semibold text-gray-800"
                >
                  Ver la ficha completa
                </button>
              )}
            </>
          )}
        </div>

        {/* Decidir sin volver a la tarjeta */}
        {/* Los mismos tres de la tarjeta (✕ · ★ · ♥), con los colores de Tinder */}
        <footer className="flex gap-2 border-t border-gray-100 px-3 pt-2.5" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onPaso}
            aria-label="Paso"
            // Solo la ✕ (como Tinder): así entran "Quiero conocerla" y "Me gusta" hasta en el iPhone SE.
            className="grid h-12 w-12 flex-none place-items-center rounded-2xl border border-gray-200 bg-white active:scale-[0.98]"
          >
            <X className="h-6 w-6 text-[#E5484D]" strokeWidth={3} aria-hidden="true" />
          </button>
          {onQuieroVerla && (
            <button
              type="button"
              onClick={onQuieroVerla}
              className="flex h-12 flex-auto items-center justify-center gap-1.5 rounded-2xl px-2 text-[14px] font-bold text-white whitespace-nowrap active:scale-[0.98]"
              style={{ background: '#2B7FFF' }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.6l6-.9z" fill="currentColor" />
              </svg>
              Quiero conocerla
            </button>
          )}
          <button
            type="button"
            onClick={onMeGusta}
            aria-pressed={guardada}
            className="flex h-12 flex-auto items-center justify-center gap-1.5 rounded-2xl px-2 text-[14px] font-bold text-white whitespace-nowrap active:scale-[0.98]"
            style={{ background: '#1A5C38' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-9.3-9A5 5 0 0 1 12 6.6a5 5 0 0 1 9.3 4.9c-1.8 4.6-9.3 9-9.3 9z" fill="currentColor" />
            </svg>
            Me gusta
          </button>
        </footer>
      </div>
      <style dangerouslySetInnerHTML={{ __html: '.detalle-mapa .vf-mapa { height: 230px; }' }} />
    </div>
  )
}
