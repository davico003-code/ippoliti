'use client'

// "Más casas en <barrio>" debajo de la ficha (David, 3-oct-2026). Va SOLO
// abajo de todo (David, 3-oct noche: "que aparezca si llega hasta el final",
// sin pestaña en la barra ni aviso flotante): la primera tarjeta del mazo con
// ✕ y ♥; tocarla abre el mazo tipo Tinder (MazoCasas) con las nuestras del
// barrio (sello verde) y las "En red" (otras inmobiliarias, dicho abiertamente).

import { useEffect, useMemo, useState } from 'react'
import { type TokkoProperty, operacionPrincipal, translatePropertyType } from '@/lib/tokko'
import { type FeedEnRed as DatosFeed, type PuntoZona, enLaZona, itemDeEnRed, pluralTipo } from '@/lib/feed-en-red'
import { itemDeNuestra } from '@/lib/mazo-items'
import MazoCasas, { BotonesTinder, Tarjeta, useGuardadas } from '@/components/mazo/MazoCasas'

/** Barrio, pin y precio en dólares de una propiedad, para la regla de zona. */
function puntoDe(p: TokkoProperty): PuntoZona {
  const lat = p.geo_lat ? parseFloat(p.geo_lat) : NaN
  const lng = p.geo_long ? parseFloat(p.geo_long) : NaN
  const precio = operacionPrincipal(p)?.prices?.[0]
  return {
    barrio: p.location?.name ?? null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    precioUsd: precio && precio.currency === 'USD' && precio.price > 0 ? precio.price : null,
  }
}

/** Cuántas nuestras como mucho en el mazo (así también entran las En red). */
const MAX_NUESTRAS = 6

export default function FeedEnRed({ property, nuestras }: { property: TokkoProperty; nuestras: TokkoProperty[] }) {
  const [datos, setDatos] = useState<DatosFeed | null>(null)
  // Nuestras parecidas para el mazo: se piden más que las 4 de "Otras opciones"
  // y se quedan SOLO las del barrio o la zona (David, 3-oct: "si no, pierde el sentido").
  const [cercanas, setCercanas] = useState<TokkoProperty[] | null>(null)
  /** Desde qué tarjeta se abrió el mazo (null = cerrado). */
  const [abiertoEn, setAbiertoEn] = useState<number | null>(null)
  const guardadasApi = useGuardadas()

  useEffect(() => {
    let cancelado = false
    fetch(`/api/propiedades/similar?id=${property.id}&limit=24`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { objects?: TokkoProperty[] } | null) => {
        if (!cancelado && d && Array.isArray(d.objects)) setCercanas(d.objects)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [property.id])

  useEffect(() => {
    let cancelado = false
    fetch(`/api/propiedades/en-red?id=${property.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DatosFeed | null) => {
        if (!cancelado && d && Array.isArray(d.tarjetas)) setDatos(d)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [property.id])

  const enRed = useMemo(() => (datos?.tarjetas ?? []).map(itemDeEnRed), [datos])
  const items = useMemo(() => {
    const ref = puntoDe(property)
    const nuestrasZona = (cercanas ?? nuestras)
      .filter((p) => p.id !== property.id && enLaZona(ref, puntoDe(p)))
      .map(itemDeNuestra)
      .filter((i) => i.fotos.length > 0)
      .slice(0, MAX_NUESTRAS)
    return [...nuestrasZona, ...enRed]
  }, [cercanas, nuestras, property, enRed])
  const barrio = datos?.barrio || property.location?.name || null
  const plural = pluralTipo(translatePropertyType(property.type?.name))
  const titulo = barrio ? `Más ${plural} en ${barrio}` : `Más ${plural} en la zona`

  if (enRed.length === 0) return null
  const { montado, esGuardada, guardar } = guardadasApi

  return (
    <>
      <section className="mt-4 bg-white rounded-2xl px-5 md:px-8 pt-6 pb-6 shadow-sm border border-gray-100" aria-labelledby="feed-en-red-titulo">
        <h2 id="feed-en-red-titulo" className="text-2xl font-black text-gray-900 [text-wrap:balance]">
          {titulo}
        </h2>
        <p className="text-sm text-gray-600 mt-1 mb-4 max-w-2xl">
          Algunas las publican otras inmobiliarias. Te las mostramos y te coordinamos la visita nosotros.
        </p>
        {items[0] && (
          <div className="max-w-[420px]">
            <button
              type="button"
              onClick={() => setAbiertoEn(0)}
              aria-label={`Ver ${titulo.toLowerCase()}`}
              className="relative block w-full h-[470px] text-left rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]"
            >
              <Tarjeta item={items[0]} modo="quieta" guardada={montado && esGuardada(items[0].key)} arrastre={null} salida={null} par={0} />
            </button>
            <div className="mt-4">
              <BotonesTinder
                chicos
                onPaso={() => setAbiertoEn(1)}
                onMeGusta={() => {
                  guardar(items[0])
                  setAbiertoEn(1)
                }}
              />
            </div>
            <p className="mt-2.5 text-center text-xs text-gray-500">
              {items.length} para ver · deslizá a la derecha las que te gusten
            </p>
          </div>
        )}
      </section>

      {montado && abiertoEn != null && (
        <MazoCasas
          items={items}
          titulo={titulo}
          barrio={barrio}
          inicio={abiertoEn}
          guardadasApi={guardadasApi}
          origen="ficha"
          onCerrar={() => setAbiertoEn(null)}
        />
      )}
    </>
  )
}
