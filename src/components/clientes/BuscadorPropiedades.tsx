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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

interface Props {
  asignados: string[]
  onToggle: (tokkoId: string, action: 'add' | 'remove') => void
}

export default function BuscadorPropiedades({ asignados, onToggle }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{ total: number; timestamp: string | null } | null>(null)
  const [needsSync, setNeedsSync] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Check cache on mount
  useEffect(() => {
    fetch('/api/clientes/sync')
      .then(r => r.json())
      .then(data => {
        setCacheInfo(data)
        if (!data.timestamp || data.total === 0) setNeedsSync(true)
      })
      .catch(() => setNeedsSync(true))
  }, [])

  // Fast search with 100ms debounce
  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/clientes/buscar?q=${encodeURIComponent(search)}`)
        if (r.ok) {
          const data = await r.json()
          if (data.error === 'sync_needed') { setNeedsSync(true); setResults([]) }
          else setResults(data)
        }
      } catch {}
      setLoading(false)
    }, 100)
  }, [search])

  async function doSync() {
    setSyncing(true)
    try {
      const r = await fetch('/api/clientes/sync', { method: 'POST' })
      if (r.ok) {
        const data = await r.json()
        setCacheInfo({ total: data.total, timestamp: data.timestamp })
        setNeedsSync(false)
      }
    } catch {}
    setSyncing(false)
  }

  const isAsignada = (id: number) => asignados.includes(String(id))
  const sorted = [...results].sort((a, b) => (isAsignada(a.id) ? 0 : 1) - (isAsignada(b.id) ? 0 : 1))

  return (
    <div className="space-y-3">
      {/* Sync needed */}
      {needsSync && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700 mb-2">Necesitás sincronizar las propiedades primero</p>
          <button onClick={doSync} disabled={syncing}
            className="px-4 py-2 bg-[#1A5C38] text-white text-sm font-bold rounded-xl disabled:opacity-50">
            {syncing ? 'Sincronizando...' : 'Sincronizar propiedades'}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por barrio, ciudad, dirección..."
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] focus:ring-2 focus:ring-[#1A5C38]/10 transition-all"
        />
        {/* Sync button */}
        <button onClick={doSync} disabled={syncing} title="Actualizar base de datos"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1A5C38] transition-colors disabled:opacity-50">
          <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#1A5C38] font-semibold">
          {asignados.length} asignada{asignados.length !== 1 ? 's' : ''}
        </p>
        {cacheInfo && cacheInfo.timestamp && (
          <p className="text-[10px] text-gray-300">
            {cacheInfo.total} propiedades · {timeAgo(Number(cacheInfo.timestamp))}
          </p>
        )}
      </div>

      {search.trim().length > 0 && search.trim().length < 2 && (
        <p className="text-xs text-gray-400 text-center py-2">Escribí al menos 2 letras</p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
        </div>
      )}

      {!search.trim() && asignados.length === 0 && !loading && !needsSync && (
        <div className="text-center py-6">
          <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-xs text-gray-400">Usá el buscador para agregar propiedades</p>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <>
          <p className="text-[10px] text-gray-400">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
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
        </>
      )}
    </div>
  )
}
