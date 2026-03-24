'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, Loader2 } from 'lucide-react'

// Same locations as SearchAutocomplete — shared source of truth
const PROPERTY_LOCATIONS = [
  { label: 'Roldán', sublabel: 'Santa Fe', value: 'roldan' },
  { label: 'Funes', sublabel: 'Santa Fe', value: 'funes' },
  { label: 'Rosario', sublabel: 'Santa Fe', value: 'rosario' },
  { label: 'Fisherton', sublabel: 'Rosario', value: 'fisherton' },
  { label: 'Aldea Fisherton', sublabel: 'Rosario', value: 'aldea fisherton' },
  { label: 'Tierra de Sueños', sublabel: 'Roldán', value: 'tierra de sueños' },
  { label: 'Tierra de Sueños 1', sublabel: 'Roldán', value: 'tierra de sueños 1' },
  { label: 'Tierra de Sueños 3', sublabel: 'Roldán', value: 'tierra de sueños 3' },
  { label: 'Fincas de Roldán', sublabel: 'Roldán', value: 'fincas' },
  { label: 'Los Raigales', sublabel: 'Roldán', value: 'raigales' },
  { label: 'Los Indios', sublabel: 'Roldán', value: 'los indios' },
  { label: 'Barrio Sur', sublabel: 'Roldán', value: 'barrio sur' },
  { label: 'San Lorenzo', sublabel: 'Santa Fe', value: 'san lorenzo' },
  { label: 'Granadero Baigorria', sublabel: 'Santa Fe', value: 'baigorria' },
  { label: 'Funes Hills', sublabel: 'Funes', value: 'funes hills' },
  { label: 'Barrio Cielo', sublabel: 'Roldán', value: 'barrio cielo' },
  { label: 'Distrito Roldán', sublabel: 'Roldán', value: 'distrito roldan' },
]

interface Suggestion {
  label: string
  sublabel: string
  type: 'property' | 'osm'
  value: string
}

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setIsOpen(false); return }
    const lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const local: Suggestion[] = PROPERTY_LOCATIONS
      .filter(loc => {
        const norm = loc.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return norm.includes(lower) || loc.value.includes(lower)
      })
      .slice(0, 5)
      .map(loc => ({ label: loc.label, sublabel: loc.sublabel, type: 'property' as const, value: loc.value }))

    setSuggestions(local)
    setIsOpen(true)
    setActiveIdx(-1)

    if (q.length >= 3) {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Santa Fe Argentina')}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data = await res.json()
        const osm: Suggestion[] = data
          .filter((r: Record<string, unknown>) => {
            const addr = r.address as Record<string, string> | undefined
            return addr && (addr.state || '').toLowerCase().includes('santa fe')
          })
          .map((r: Record<string, unknown>) => {
            const addr = r.address as Record<string, string>
            const city = addr.city || addr.town || addr.village || addr.suburb || ''
            const neighbourhood = addr.neighbourhood || addr.suburb || ''
            const label = neighbourhood && neighbourhood !== city ? neighbourhood : (r.display_name as string).split(',')[0]
            return { label, sublabel: city || 'Santa Fe', type: 'osm' as const, value: label.toLowerCase() }
          })
          .filter((s: Suggestion) => !local.some(l => l.label.toLowerCase() === s.label.toLowerCase()))
          .slice(0, 4)
        setSuggestions(prev => [...prev.filter(s => s.type === 'property'), ...osm])
      } catch {} finally { setLoading(false) }
    }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250)
  }

  const navigate = (value: string) => {
    setIsOpen(false)
    setQuery(value)
    router.push(`/propiedades?q=${encodeURIComponent(value)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(prev => (prev + 1) % suggestions.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(prev => (prev - 1 + suggestions.length) % suggestions.length) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); navigate(suggestions[activeIdx].value) }
    else if (e.key === 'Escape') setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <form
        action="/propiedades"
        method="GET"
        onSubmit={e => { if (activeIdx >= 0 && isOpen) { e.preventDefault(); navigate(suggestions[activeIdx].value) } }}
        style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}
      >
        {/* Desktop: single row */}
        <div className="hidden md:flex items-stretch">
          <select name="op" style={{ border: 'none', borderRight: '1px solid #e5e7eb', borderRadius: 0, outline: 'none', background: 'transparent', padding: '14px 16px', fontSize: '14px', color: '#4b5563', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>
            <option value="">Operación ▾</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
          <select name="type" style={{ border: 'none', borderRight: '1px solid #e5e7eb', borderRadius: 0, outline: 'none', background: 'transparent', padding: '14px 16px', fontSize: '14px', color: '#4b5563', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>
            <option value="">Tipo ▾</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="terreno">Terreno</option>
            <option value="local">Local</option>
          </select>
          <input
            name="q"
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Barrio, ciudad o dirección"
            autoComplete="off"
            style={{ border: 'none', borderRadius: 0, outline: 'none', background: 'transparent', padding: '14px 16px', fontSize: '14px', flex: 1, minWidth: 0 }}
          />
          <button type="submit" style={{ border: 'none', borderRadius: '0 8px 8px 0', outline: 'none', background: '#1A5C38', color: '#fff', padding: '14px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {/* Mobile: stacked */}
        <div className="md:hidden flex flex-col">
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
            <select name="op" style={{ flex: 1, border: 'none', borderRight: '1px solid #e5e7eb', borderRadius: 0, outline: 'none', background: 'transparent', padding: '12px 16px', fontSize: '14px', color: '#4b5563', cursor: 'pointer', fontWeight: 500 }}>
              <option value="">Operación ▾</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
            <select name="type" style={{ flex: 1, border: 'none', borderRadius: 0, outline: 'none', background: 'transparent', padding: '12px 16px', fontSize: '14px', color: '#4b5563', cursor: 'pointer', fontWeight: 500 }}>
              <option value="">Tipo ▾</option>
              <option value="casa">Casa</option>
              <option value="departamento">Depto</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              name="q"
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
              onKeyDown={handleKeyDown}
              placeholder="Barrio, ciudad o dirección"
              autoComplete="off"
              style={{ flex: 1, border: 'none', borderRadius: 0, outline: 'none', background: 'transparent', padding: '12px 16px', fontSize: '14px', minWidth: 0 }}
            />
            <button type="submit" style={{ border: 'none', borderRadius: 0, outline: 'none', background: '#1A5C38', color: '#fff', padding: '12px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
          {suggestions.some(s => s.type === 'property') && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nuestras zonas</span>
            </div>
          )}
          {suggestions.filter(s => s.type === 'property').map((s, i) => (
            <button
              key={`p-${i}`}
              type="button"
              onClick={() => navigate(s.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${activeIdx === i ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
            >
              <Home className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-gray-900 block truncate">{s.label}</span>
                <span className="text-xs text-gray-400">{s.sublabel}</span>
              </div>
            </button>
          ))}
          {suggestions.some(s => s.type === 'osm') && (
            <>
              <div className="border-t border-gray-100 mx-3" />
              <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Otras ubicaciones</span>
                {loading && <Loader2 className="w-3 h-3 text-gray-300 animate-spin" />}
              </div>
            </>
          )}
          {suggestions.filter(s => s.type === 'osm').map((s, i) => {
            const gIdx = suggestions.filter(x => x.type === 'property').length + i
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => navigate(s.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${activeIdx === gIdx ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-700 block truncate">{s.label}</span>
                  <span className="text-xs text-gray-400">{s.sublabel}</span>
                </div>
              </button>
            )
          })}
          {loading && suggestions.every(s => s.type === 'property') && (
            <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Buscando más ubicaciones…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
