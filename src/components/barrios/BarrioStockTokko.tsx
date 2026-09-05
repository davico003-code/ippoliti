'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { TokkoProperty } from '@/lib/tokko'
import {
  formatPrice,
  formatLocation,
  generatePropertySlug,
  getMainPhoto,
  getRoofedArea,
  getLotSurface,
  translatePropertyType,
} from '@/lib/tokko'
import { trackEvent } from '@/lib/analytics'

interface Props {
  slug: string
  nombre: string
  tipo: 'Terreno' | 'Casa' | 'Departamento' | 'Todos'
  title?: string
}

export default function BarrioStockTokko({ slug, nombre, tipo, title }: Props) {
  const [properties, setProperties] = useState<TokkoProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetch(`/api/barrios/${slug}/propiedades?tipo=${encodeURIComponent(tipo)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        if (data.error) {
          setError(data.error)
          return
        }
        setProperties(data.properties ?? [])
      })
      .catch((e) => {
        if (!active) return
        setError(String(e?.message ?? e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, tipo])

  useEffect(() => {
    if (!loading && properties.length > 0 && !tracked) {
      trackEvent('barrios_stock_view', { slug, tipo, count: properties.length })
      setTracked(true)
    }
  }, [loading, properties, slug, tipo, tracked])

  if (loading) {
    return (
      <div className="rounded-xl bg-stone-50 p-8 text-center text-sm text-stone-500">
        Cargando stock disponible en {nombre}…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-stone-50 p-8 text-center text-sm text-stone-600">
        No pudimos cargar el stock en este momento. Pedinos disponibilidad por WhatsApp.
      </div>
    )
  }

  if (properties.length === 0) {
    if (tipo === 'Casa' || tipo === 'Departamento') return null
    return (
      <div className="rounded-xl bg-brand-50 p-8 text-center">
        <p className="mb-3 font-raleway text-lg text-navy-700">
          No hay stock publicado en {nombre} ahora mismo.
        </p>
        <p className="mb-4 text-sm text-stone-600">
          Trabajamos con stock que rota — si querés que te avisemos cuando entre algo, dejanos el dato.
        </p>
        <Link
          href={`https://wa.me/5493413340916?text=${encodeURIComponent(
            `Hola, quiero que me avisen cuando entren ${tipo === 'Terreno' ? 'lotes' : 'propiedades'} en ${nombre}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('barrios_whatsapp_click', { slug, ubicacion: 'stock-vacio' })}
          className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white"
        >
          Avísenme cuando entren {tipo === 'Terreno' ? 'lotes' : 'propiedades'}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h3 className="mb-4 font-raleway text-2xl font-semibold text-navy-700">
          {title}
          <span className="ml-2 font-numeric text-base text-stone-500 tabular-nums">
            ({properties.length})
          </span>
        </h3>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((p) => {
          const photo = getMainPhoto(p)
          const url = `/propiedades/${generatePropertySlug(p)}`
          const lot = getLotSurface(p)
          const roofed = getRoofedArea(p)
          return (
            <Link
              key={p.id}
              href={url}
              className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full bg-stone-100">
                {photo ? (
                  <Image
                    src={photo}
                    alt={p.publication_title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">
                    Foto no disponible
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {translatePropertyType(p.type?.name)} · {formatLocation(p)}
                </p>
                <h4 className="font-raleway text-base font-semibold text-navy-700 line-clamp-2">
                  {p.publication_title}
                </h4>
                <p className="font-numeric text-lg font-semibold tabular-nums text-brand-700">
                  {formatPrice(p)}
                </p>
                <div className="flex gap-3 text-xs text-stone-600 font-numeric tabular-nums">
                  {lot ? <span>{lot} m² lote</span> : null}
                  {roofed ? <span>· {roofed} m² cub.</span> : null}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
