'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize } from 'lucide-react'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  translatePropertyType,
} from '@/lib/tokko'

type SortMode = 'recomendado' | 'precio' | 'dormitorios' | 'barrio'

const SORT_BUTTONS: { value: SortMode; label: string }[] = [
  { value: 'recomendado', label: 'Recomendado' },
  { value: 'precio', label: 'Precio' },
  { value: 'dormitorios', label: 'Dormitorios' },
  { value: 'barrio', label: 'Barrio' },
]

interface Props {
  properties: TokkoProperty[]
}

export default function SimilarProperties({ properties }: Props) {
  const [sort, setSort] = useState<SortMode>('recomendado')

  const sorted = useMemo(() => {
    const list = [...properties]
    switch (sort) {
      case 'precio':
        return list.sort((a, b) => {
          const pa = a.operations?.[0]?.prices?.[0]?.price ?? Infinity
          const pb = b.operations?.[0]?.prices?.[0]?.price ?? Infinity
          return pa - pb
        })
      case 'dormitorios':
        return list.sort((a, b) => (b.room_amount ?? 0) - (a.room_amount ?? 0))
      case 'barrio':
        return list.sort((a, b) =>
          (a.location?.name ?? a.address ?? '').localeCompare(b.location?.name ?? b.address ?? '')
        )
      case 'recomendado':
      default:
        return list
    }
  }, [properties, sort])

  if (sorted.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Otras opciones para vos</h2>
        <p className="text-gray-400 text-sm">No hay propiedades similares disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Otras opciones para vos</h2>
        <p className="text-gray-500 text-sm mt-1">Propiedades similares en la zona</p>
      </div>

      {/* Sort buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SORT_BUTTONS.map(btn => (
          <button
            key={btn.value}
            onClick={() => setSort(btn.value)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sort === btn.value
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map(property => {
          const photo = getMainPhoto(property)
          const slug = generatePropertySlug(property)
          const price = formatPrice(property)
          const area = getTotalSurface(property)
          const typeName = translatePropertyType(property.type?.name)

          return (
            <Link
              key={property.id}
              href={`/propiedades/${slug}`}
              className="group relative rounded-xl overflow-hidden h-[260px] flex flex-col justify-end bg-gray-200"
            >
              {/* Background photo */}
              {photo && (
                <Image
                  src={photo}
                  alt={property.publication_title || property.address}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                {typeName && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-600/90 text-white uppercase tracking-wide">
                    {typeName}
                  </span>
                )}
                {area != null && area > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-black/50 text-white backdrop-blur-sm font-numeric">
                    <Maximize className="w-3 h-3" />
                    {area} m²
                  </span>
                )}
              </div>

              {/* Bottom content */}
              <div className="relative z-10 p-4">
                <p className="text-white font-black text-lg font-numeric mb-1 drop-shadow-md">
                  {price}
                </p>
                <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1 drop-shadow-sm">
                  {property.publication_title || property.address}
                </h3>
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{property.fake_address || property.address}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
