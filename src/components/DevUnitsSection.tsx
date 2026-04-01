'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { DevUnit } from '@/lib/developments'

function getPhoto(u: DevUnit): string | null {
  const photos = (u.photos || []).filter(p => !p.is_blueprint)
  const cover = photos.find(p => p.is_front_cover)
  return (cover || photos[0])?.image || (cover || photos[0])?.thumb || null
}

function getDorms(u: DevUnit): number {
  return u.suite_amount || u.room_amount || 0
}

function getArea(u: DevUnit): number {
  return parseFloat(u.roofed_surface || u.total_surface || u.surface || '0') || 0
}

interface Props {
  units: DevUnit[]
  devName: string
  whatsappUrl: string
}

export default function DevUnitsSection({ units, devName, whatsappUrl }: Props) {
  const [activeTab, setActiveTab] = useState<number | null>(null)

  // Build available tabs from real data
  const tabs = useMemo(() => {
    const dormCounts = new Map<number, number>()
    for (const u of units) {
      const d = getDorms(u)
      dormCounts.set(d, (dormCounts.get(d) || 0) + 1)
    }
    const sorted = Array.from(dormCounts.keys()).sort((a, b) => a - b)
    return sorted.map(d => ({
      value: d,
      label: d === 0 ? 'Monoambiente' : `${d} Dorm`,
      count: dormCounts.get(d) || 0,
    }))
  }, [units])

  const filtered = activeTab !== null ? units.filter(u => getDorms(u) === activeTab) : units

  if (units.length === 0) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Unidades disponibles</h2>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-3">No hay unidades cargadas en este momento.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-full hover:bg-[#1ea952] transition-colors">
            Consultanos por disponibilidad
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Unidades disponibles</h2>
      <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
        En venta · {units.length} unidad{units.length !== 1 ? 'es' : ''} · {devName}
      </p>

      {/* Stats summary */}
      {(() => {
        const areas = units.map(u => getArea(u)).filter(a => a > 0).sort((a, b) => a - b)
        const dorms = units.map(u => getDorms(u)).filter(d => d > 0).sort((a, b) => a - b)
        const baths = units.map(u => u.bathroom_amount || 0).filter(b => b > 0).sort((a, b) => a - b)
        const hasCochera = units.some(u => u.parking_lot_amount > 0)
        const uniqueDorms = Array.from(new Set(dorms))
        const uniqueBaths = Array.from(new Set(baths))

        return (
          <div className="flex flex-wrap gap-3 mb-6">
            {areas.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9H21M9 3V21"/></svg>
                <span className="font-numeric">{areas[0] === areas[areas.length - 1] ? `${areas[0]}` : `${areas[0]} a ${areas[areas.length - 1]}`} m²</span>
              </span>
            )}
            {uniqueDorms.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><path d="M3 9V19M21 9V19M3 15H21M3 9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9"/><path d="M7 7V5C7 4.4 7.4 4 8 4H16C16.6 4 17 4.4 17 5V7"/></svg>
                {uniqueDorms.length === 1 ? `${uniqueDorms[0]} dorm.` : `${uniqueDorms[0]} a ${uniqueDorms[uniqueDorms.length - 1]} dorm.`}
              </span>
            )}
            {uniqueBaths.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><path d="M4 12H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V12Z"/><path d="M4 12V6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6V8"/><path d="M8 8H20"/></svg>
                {uniqueBaths.length === 1 ? `${uniqueBaths[0]} baño${uniqueBaths[0] > 1 ? 's' : ''}` : `${uniqueBaths[0]} a ${uniqueBaths[uniqueBaths.length - 1]} baños`}
              </span>
            )}
            {hasCochera && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><path d="M7 17m0 2a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m0 2a2 2 0 1 0-4 0a2 2 0 1 0 4 0"/><path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"/><path d="M10 17h4"/></svg>
                Con cochera
              </span>
            )}
          </div>
        )
      })()}

      {/* Filter tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTab(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === null ? 'bg-[#1A5C38] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === t.value ? 'bg-[#1A5C38] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(u => {
          const photo = getPhoto(u)
          const area = getArea(u)
          const price = u.operations?.[0]?.prices?.[0]
          const statusLabel = u.status === 2 ? 'Reservada' : 'Disponible'
          const statusColor = u.status === 2 ? 'bg-amber-100 text-amber-700' : 'bg-[#e8f5ee] text-[#1A5C38]'
          const dorms = getDorms(u)

          return (
            <div key={u.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              {/* Image */}
              <div className="relative h-[160px] bg-[#F2F2F7]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={u.publication_title || u.reference_code} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs text-gray-400 mb-0.5">{u.type?.name || 'Unidad'}</p>
                <p className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
                  {u.reference_code || u.publication_title || u.address}
                </p>

                {/* Price */}
                <p className="text-xl font-bold text-[#1A5C38] font-numeric mb-2">
                  {price?.price ? `${price.currency || 'USD'} ${price.price.toLocaleString('es-AR')}` : 'Consultar'}
                </p>

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {area > 0 && <span className="font-numeric">{area} m²</span>}
                  {dorms > 0 && <span>{dorms} dorm.</span>}
                  {u.bathroom_amount > 0 && <span>{u.bathroom_amount} baño{u.bathroom_amount > 1 ? 's' : ''}</span>}
                  {u.parking_lot_amount > 0 && <span>{u.parking_lot_amount} coch.</span>}
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/propiedades/${u.id}-unidad`}
                    className="block w-full text-center text-[13px] font-semibold text-white bg-[#1A5C38] hover:bg-[#145030] py-2.5 rounded-xl transition-colors"
                  >
                    Ver unidad &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
