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
        {units.length} unidad{units.length !== 1 ? 'es' : ''} · {devName}
      </p>

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
                    className="text-[13px] font-semibold text-[#1A5C38] hover:underline"
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
