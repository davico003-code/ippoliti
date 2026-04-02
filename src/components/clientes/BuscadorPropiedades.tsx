'use client'

import { useState, useEffect, useRef } from 'react'

interface Result {
  id: number
  publication_title: string
  address: string
  photos?: { image?: string; is_front_cover?: boolean; is_blueprint?: boolean }[]
  operations?: { prices?: { price: number; currency: string }[] }[]
  type?: { name?: string }
}

const TYPE_ES: Record<string, string> = {
  Apartment: 'Departamento', House: 'Casa', Land: 'Terreno',
  Garage: 'Cochera', 'Bussiness Premises': 'Local', Office: 'Oficina',
  PH: 'PH', Duplex: 'Dúplex',
}

function getPhoto(r: Result): string | null {
  const photos = (r.photos || []).filter(p => !p.is_blueprint)
  const cover = photos.find(p => p.is_front_cover) || photos[0]
  return cover?.image || null
}

function getPrice(r: Result): string {
  const p = r.operations?.[0]?.prices?.[0]
  return p?.price ? `${p.currency || 'USD'} ${p.price.toLocaleString('es-AR')}` : 'Consultar'
}

interface Props {
  asignados: string[]
  onToggle: (tokkoId: string, action: 'add' | 'remove') => void
}

export default function BuscadorPropiedades({ asignados, onToggle }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/propiedades?search=${encodeURIComponent(search)}&limit=12`)
        if (r.ok) { const d = await r.json(); setResults(d.objects || []) }
      } catch {}
      setLoading(false)
    }, 300)
  }, [search])

  const isAsignada = (id: number) => asignados.includes(String(id))

  // Sort: assigned first
  const sorted = [...results].sort((a, b) => {
    const aA = isAsignada(a.id) ? 0 : 1
    const bA = isAsignada(b.id) ? 0 : 1
    return aA - bA
  })

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Escribí una dirección o barrio..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] focus:ring-2 focus:ring-[#1A5C38]/10 transition-all"
        />
      </div>

      {/* Count */}
      <p className="text-xs text-[#1A5C38] font-semibold">
        {asignados.length} propiedad{asignados.length !== 1 ? 'es' : ''} asignada{asignados.length !== 1 ? 's' : ''}
      </p>

      {loading && <p className="text-xs text-gray-400 flex items-center gap-2">
        <span className="w-3 h-3 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" /> Buscando propiedades...
      </p>}

      {!search.trim() && asignados.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-sm text-gray-400">Usá el buscador para agregar propiedades</p>
        </div>
      )}

      {/* Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(r => {
            const assigned = isAsignada(r.id)
            const photo = getPhoto(r)
            return (
              <button
                key={r.id}
                onClick={() => onToggle(String(r.id), assigned ? 'remove' : 'add')}
                className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 ${
                  assigned ? 'border-[#1A5C38] ring-2 ring-[#1A5C38]/20' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Photo */}
                <div className="relative h-32 bg-gray-100">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                  )}

                  {/* Assigned overlay */}
                  {assigned && (
                    <div className="absolute inset-0 bg-[#1A5C38]/40 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}

                  {/* Hover overlay for unassigned */}
                  {!assigned && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white text-2xl font-light">＋</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-400">{TYPE_ES[r.type?.name || ''] || r.type?.name || ''}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{r.publication_title || r.address}</p>
                  <p className="text-sm font-bold text-[#1A5C38] font-numeric mt-0.5">{getPrice(r)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
