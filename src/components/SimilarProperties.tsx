'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Search, X } from 'lucide-react'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  getRoofedArea,
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
  /** @deprecated — ya no se usa, se mantiene por compat con llamadas existentes */
  currentPropertyId?: number
}

export default function SimilarProperties({ properties }: Props) {
  const [sort, setSort] = useState<SortMode>('recomendado')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return properties
    const q = search.toLowerCase().trim()
    // Check if searching by price (number)
    const numQuery = parseInt(q.replace(/\D/g, ''), 10)
    return properties.filter(p => {
      const loc = (p.location?.name ?? p.location?.short_location ?? '').toLowerCase()
      const addr = (p.fake_address ?? p.address ?? '').toLowerCase()
      const title = (p.publication_title ?? '').toLowerCase()
      const textMatch = loc.includes(q) || addr.includes(q) || title.includes(q)
      if (textMatch) return true
      // Price match: if user typed a number, check if price is within 20%
      if (numQuery > 0) {
        const price = p.operations?.[0]?.prices?.[0]?.price ?? 0
        if (price > 0) {
          const ratio = price / numQuery
          return ratio >= 0.8 && ratio <= 1.2
        }
      }
      return false
    })
  }, [properties, search])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sort) {
      case 'precio':
        return list.sort((a, b) => {
          const pa = a.operations?.[0]?.prices?.[0]?.price ?? Infinity
          const pb = b.operations?.[0]?.prices?.[0]?.price ?? Infinity
          return pa - pb
        })
      case 'dormitorios':
        return list.sort((a, b) => (b.suite_amount || b.room_amount || 0) - (a.suite_amount || a.room_amount || 0))
      case 'barrio':
        return list.sort((a, b) =>
          (a.location?.name ?? a.address ?? '').localeCompare(b.location?.name ?? b.address ?? '')
        )
      case 'recomendado':
      default:
        return list
    }
  }, [filtered, sort])

  if (properties.length === 0) {
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
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por barrio, zona o precio..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
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

      {/* Cards grid — desktop 4 cols, mobile 1 col full-width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {sorted.map(property => {
          const photo = getMainPhoto(property)
          const slug = generatePropertySlug(property)
          const price = formatPrice(property)
          const area = getTotalSurface(property)
          const roofed = getRoofedArea(property)
          const typeName = translatePropertyType(property.type?.name)
          const op = property.operations?.[0]?.operation_type === 'Sale'
            ? 'Venta'
            : property.operations?.[0]?.operation_type === 'Rent'
              ? 'Alquiler'
              : null
          const beds = property.suite_amount || property.room_amount || 0
          const baths = property.bathroom_amount || 0
          const sizeLabel = roofed && roofed > 0 ? `${roofed} m²` : area && area > 0 ? `${area} m²` : null
          const specsBits: string[] = []
          if (beds > 0) specsBits.push(`${beds} dorm`)
          if (baths > 0) specsBits.push(`${baths} baño${baths > 1 ? 's' : ''}`)
          if (sizeLabel) specsBits.push(sizeLabel)
          const loc = property.location?.short_location || property.location?.name || ''
          const addr = property.fake_address || property.address

          return (
            <Link
              key={property.id}
              href={`/propiedades/${slug}`}
              className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-[#1A5C38]"
            >
              {/* Photo 16:9, sin overlay de texto */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                {photo && (
                  <Image
                    src={photo}
                    alt={property.publication_title || addr}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                )}
                {op && (
                  <span
                    className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded text-white uppercase tracking-wide"
                    style={{ background: op === 'Venta' ? '#dc2626' : '#2563eb' }}
                  >
                    {op}
                  </span>
                )}
                {typeName && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded bg-white/95 text-[#1A5C38] uppercase tracking-wide">
                    {typeName}
                  </span>
                )}
              </div>

              {/* Info — debajo de la foto */}
              <div className="p-4">
                <p className="text-gray-900 font-black text-xl font-numeric leading-none mb-2">
                  {price}
                </p>
                {specsBits.length > 0 && (
                  <p className="text-gray-600 text-sm mb-2 font-poppins">
                    {specsBits.join(' · ')}
                  </p>
                )}
                <h3 className="text-gray-900 text-sm font-semibold line-clamp-2 leading-snug mb-2 font-raleway">
                  {property.publication_title || addr}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-[#1A5C38]" />
                  <span className="truncate">
                    {addr}{loc ? ` · ${loc}` : ''}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {sorted.length === 0 && search && (
        <p className="text-center text-gray-400 text-sm mt-6">No se encontraron propiedades para &ldquo;{search}&rdquo;</p>
      )}
    </div>
  )
}
