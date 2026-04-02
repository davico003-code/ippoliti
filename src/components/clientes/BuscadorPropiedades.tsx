'use client'

import { useState, useEffect, useRef } from 'react'

interface Result {
  id: number
  publication_title: string
  address: string
  photo: string | null
  price: number | null
  currency: string
  type: string
}

const TYPE_ES: Record<string, string> = {
  Apartment: 'Departamento', House: 'Casa', Land: 'Terreno',
  Garage: 'Cochera', 'Bussiness Premises': 'Local', Office: 'Oficina',
  PH: 'PH', Duplex: 'Dúplex',
}

function fmtPrice(price: number | null, currency: string): string {
  if (!price) return 'Consultar'
  return `${currency} ${price.toLocaleString('es-AR')}`
}

interface Props {
  asignados: string[]
  onToggle: (tokkoId: string, action: 'add' | 'remove') => void
}

export default function BuscadorPropiedades({ asignados, onToggle }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); setSearched(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSearched(true)
      try {
        const r = await fetch(`/api/clientes/buscar?q=${encodeURIComponent(search)}`)
        if (r.ok) setResults(await r.json())
      } catch {}
      setLoading(false)
    }, 300)
  }, [search])

  const isAsignada = (id: number) => asignados.includes(String(id))

  const sorted = [...results].sort((a, b) => {
    const aA = isAsignada(a.id) ? 0 : 1
    const bA = isAsignada(b.id) ? 0 : 1
    return aA - bA
  })

  return (
    <div className="space-y-3">
      {/* Search */}
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

      {/* Status */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#1A5C38] font-semibold">
          {asignados.length} propiedad{asignados.length !== 1 ? 'es' : ''} asignada{asignados.length !== 1 ? 's' : ''}
        </p>
        {searched && !loading && (
          <p className="text-xs text-gray-400">
            {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* Hint */}
      {search.trim().length > 0 && search.trim().length < 2 && (
        <p className="text-xs text-gray-400 text-center py-2">Escribí al menos 2 letras para buscar</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!search.trim() && asignados.length === 0 && !loading && (
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-sm text-gray-400">Usá el buscador para agregar propiedades</p>
        </div>
      )}

      {/* Grid */}
      {!loading && sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(r => {
            const assigned = isAsignada(r.id)
            return (
              <button
                key={r.id}
                onClick={() => onToggle(String(r.id), assigned ? 'remove' : 'add')}
                className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 ${
                  assigned ? 'border-[#1A5C38] ring-2 ring-[#1A5C38]/20' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="relative h-32 bg-gray-100">
                  {r.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                  )}
                  {assigned && (
                    <div className="absolute inset-0 bg-[#1A5C38]/40 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {!assigned && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white text-2xl font-light">＋</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400">{TYPE_ES[r.type] || r.type}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{r.publication_title || r.address}</p>
                  <p className="text-sm font-bold text-[#1A5C38] font-numeric mt-0.5">{fmtPrice(r.price, r.currency)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
