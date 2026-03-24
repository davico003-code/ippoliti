'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, Loader2 } from 'lucide-react'

interface Suggestion {
  label: string
  sublabel: string
  type: 'property' | 'osm'
  value: string
}

// Known locations extracted from Tokko property data
const PROPERTY_LOCATIONS: { label: string; sublabel: string; value: string }[] = [
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
  { label: 'Luis Agote', sublabel: 'Rosario', value: 'luis agote' },
  { label: 'Echesortu', sublabel: 'Rosario', value: 'echesortu' },
  { label: 'Puerto Norte', sublabel: 'Rosario', value: 'puerto norte' },
  { label: 'Pichincha', sublabel: 'Rosario', value: 'pichincha' },
  { label: 'Funes Hills', sublabel: 'Funes', value: 'funes hills' },
  { label: 'Barrio Cielo', sublabel: 'Roldán', value: 'barrio cielo' },
  { label: 'Acequias del Aire', sublabel: 'Roldán', value: 'acequias' },
  { label: 'San Sebastián', sublabel: 'Roldán', value: 'san sebastian' },
  { label: 'Distrito Roldán', sublabel: 'Roldán', value: 'distrito roldan' },
]

interface Props {
  variant?: 'navbar' | 'hero'
  className?: string
  onSelect?: () => void
}

export default function SearchAutocomplete({ variant = 'navbar', onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setIsOpen(false); return }

    const lower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // 1. Local property locations
    const local: Suggestion[] = PROPERTY_LOCATIONS
      .filter(loc => {
        const norm = loc.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const normSub = loc.sublabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return norm.includes(lower) || normSub.includes(lower) || loc.value.includes(lower)
      })
      .slice(0, 5)
      .map(loc => ({
        label: loc.label,
        sublabel: loc.sublabel,
        type: 'property' as const,
        value: loc.value,
      }))

    setSuggestions(local)
    setIsOpen(true)
    setActiveIdx(-1)

    // 2. OSM Nominatim (async, appended after local)
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
            if (!addr) return false
            const state = (addr.state || '').toLowerCase()
            return state.includes('santa fe')
          })
          .map((r: Record<string, unknown>) => {
            const addr = r.address as Record<string, string>
            const city = addr.city || addr.town || addr.village || addr.suburb || ''
            const neighbourhood = addr.neighbourhood || addr.suburb || ''
            const label = neighbourhood && neighbourhood !== city ? neighbourhood : (r.display_name as string).split(',')[0]
            return {
              label,
              sublabel: city || 'Santa Fe',
              type: 'osm' as const,
              value: label.toLowerCase(),
            }
          })
          .filter((s: Suggestion) => !local.some(l => l.label.toLowerCase() === s.label.toLowerCase()))
          .slice(0, 4)

        setSuggestions(prev => {
          const merged = [...prev.filter(s => s.type === 'property'), ...osm]
          return merged
        })
      } catch {
        // Nominatim fail is non-critical
      } finally {
        setLoading(false)
      }
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
    onSelect?.()
    router.push(`/propiedades?q=${encodeURIComponent(value)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      navigate(suggestions[activeIdx].value)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const isNavbar = variant === 'navbar'

  return (
    <div ref={wrapperRef} className="relative">
      <form
        action="/propiedades"
        method="GET"
        onSubmit={e => {
          if (activeIdx >= 0 && isOpen) {
            e.preventDefault()
            navigate(suggestions[activeIdx].value)
          }
        }}
        style={isNavbar ? {
          display: 'flex', alignItems: 'center',
          borderRadius: '50px', overflow: 'hidden',
          background: '#f9fafb', border: '1px solid #e5e7eb',
        } : { display: 'flex', alignItems: 'center' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            name="q"
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese barrio, ciudad o dirección"
            autoComplete="off"
            style={isNavbar ? {
              border: 'none', outline: 'none', boxShadow: 'none',
              background: 'transparent', padding: '8px 16px',
              fontSize: '14px', width: '100%', minWidth: '240px',
              borderRadius: '50px 0 0 50px',
            } : {
              border: 'none', outline: 'none', boxShadow: 'none',
              background: 'transparent', padding: '16px',
              fontSize: '14px', width: '100%', minWidth: 0, flex: 1,
            }}
          />
        </div>
        <button
          type="submit"
          style={isNavbar ? {
            border: 'none', outline: 'none', boxShadow: 'none',
            background: '#1A5C38', color: '#fff',
            padding: '8px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '0 50px 50px 0', flexShrink: 0,
          } : {
            border: 'none', outline: 'none', boxShadow: 'none',
            background: '#1A5C38', color: '#fff',
            padding: '16px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#145030' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
        >
          <Search className={isNavbar ? 'w-4 h-4' : 'w-[18px] h-[18px]'} />
          {!isNavbar && <span>Buscar</span>}
        </button>
      </form>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
          {/* Local results header */}
          {suggestions.some(s => s.type === 'property') && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nuestras zonas</span>
            </div>
          )}
          {suggestions.filter(s => s.type === 'property').map((s, i) => {
            const globalIdx = i
            return (
              <button
                key={`p-${i}`}
                type="button"
                onClick={() => navigate(s.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  activeIdx === globalIdx ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-900 block truncate">{s.label}</span>
                  <span className="text-xs text-gray-400">{s.sublabel}</span>
                </div>
              </button>
            )
          })}

          {/* OSM results */}
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
            const globalIdx = suggestions.filter(x => x.type === 'property').length + i
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => navigate(s.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  activeIdx === globalIdx ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
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
