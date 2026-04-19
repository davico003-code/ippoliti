'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Check, MessageCircle, Link2, Search, X } from 'lucide-react'
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
  currentPropertyId?: number
}

export default function SimilarProperties({ properties, currentPropertyId }: Props) {
  const [sort, setSort] = useState<SortMode>('recomendado')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const compareUrl = useMemo(() => {
    const ids = Array.from(selected)
    if (currentPropertyId) ids.unshift(currentPropertyId)
    return `/comparar?ids=${ids.join(',')}`
  }, [selected, currentPropertyId])

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

  const whatsappShareUrl = useMemo(() => {
    const fullCompareUrl = `https://siinmobiliaria.com${compareUrl}`
    const msg = `Te preparé una selección de propiedades:\n${fullCompareUrl}`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }, [compareUrl])

  const copyCompareLink = async () => {
    const fullUrl = `https://siinmobiliaria.com${compareUrl}`
    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      // Fallback for non-secure or denied contexts
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

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
        <p className="text-gray-500 text-sm mt-1">Seleccioná propiedades para compartirlas o compararlas</p>
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
          const isSelected = selected.has(property.id)
          const loc = property.location?.short_location || property.location?.name || ''
          const addr = property.fake_address || property.address

          return (
            <div key={property.id} className="relative">
              {/* Select checkbox (compartir/comparar) */}
              <button
                onClick={() => toggleSelect(property.id)}
                className={`absolute top-3 right-3 z-20 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
                  isSelected
                    ? 'bg-brand-600 border-brand-600 text-white scale-110'
                    : 'bg-white/90 border-gray-300 text-transparent hover:border-brand-500 hover:bg-white backdrop-blur-sm'
                }`}
                title={isSelected ? 'Quitar de selección' : 'Seleccionar para compartir'}
              >
                <Check className="w-4 h-4" />
              </button>

              <Link
                href={`/propiedades/${slug}`}
                className={`group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-[#1A5C38] ${
                  isSelected ? 'ring-2 ring-brand-600 ring-offset-2' : ''
                }`}
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
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && search && (
        <p className="text-center text-gray-400 text-sm mt-6">No se encontraron propiedades para &ldquo;{search}&rdquo;</p>
      )}

      {/* Floating action bar when properties are selected */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 py-3 animate-in slide-in-from-bottom">
          <span className="text-sm font-bold text-gray-700 mr-1 whitespace-nowrap">
            {selected.size} seleccionada{selected.size > 1 ? 's' : ''}
          </span>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            Compartir {selected.size} por WhatsApp
          </a>

          <button
            onClick={copyCompareLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              linkCopied
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {linkCopied ? 'Link copiado!' : 'Copiar link'}
          </button>

          <button
            onClick={() => setSelected(new Set())}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Limpiar selección"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
