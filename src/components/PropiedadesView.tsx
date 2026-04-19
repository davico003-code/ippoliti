'use client'

import dynamic from 'next/dynamic'
import PropertyPanel from './PropertyPanel'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Map,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  Check,
  ArrowUpDown,
  Locate,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import MobileFilterSheet from '@/components/MobileFilterSheet'
import { buscarZonas } from '@/lib/zonas'
import { highlightMatch } from '@/lib/highlight'
import { ZONAS, type Zona } from '@/lib/zonas'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  translatePropertyType,
  generatePropertySlug,
} from '@/lib/tokko'
import { PRICE_OPTIONS } from '@/constants/filters'

const PropiedadesMap = dynamic(() => import('./PropiedadesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <span className="text-sm text-gray-500 font-medium">Cargando mapa…</span>
      </div>
    </div>
  ),
})

// ─── Filter types ────────────────────────────────────────────────────────────

type Operation = 'todos' | 'venta' | 'alquiler'
type PropType  = 'todos' | 'casa' | 'departamento' | 'terreno' | 'local'
type Beds      = 'todos' | '1' | '2' | '3' | '4+'
type MaxPrice  = 'sin-limite' | '50000' | '100000' | '150000' | '200000' | '250000' | '300000' | '350000' | '400000' | '450000' | '500000' | '600000' | '700000'
type Location  = 'todos' | 'roldan' | 'rosario' | 'funes'
type ListMode  = 'compact' | 'list'
type SortBy    = 'recientes' | 'precio-asc' | 'precio-desc' | 'superficie' | 'destacadas'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'destacadas', label: 'Destacadas primero' },
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'superficie', label: 'Mayor superficie' },
]

interface Filters {
  search: string; operation: Operation; type: PropType
  beds: Beds; maxPrice: MaxPrice; location: Location
}

const DEFAULTS: Filters = {
  search: '', operation: 'todos', type: 'todos',
  beds: 'todos', maxPrice: 'sin-limite', location: 'todos',
}

// ─── FilterSelect ────────────────────────────────────────────────────────────

function FilterSelect<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void
}) {
  const active = value !== options[0].value
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        aria-label={options[0].label}
        className="appearance-none h-10 rounded-xl pl-3.5 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all"
        style={{
          border: active ? '1.5px solid #1A5C38' : '1.5px solid #d1d5db',
          background: '#fff',
          color: active ? '#1A5C38' : '#0a0a0a',
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontWeight: active ? 600 : 500,
          fontSize: 14,
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#0a0a0a' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#d1d5db' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${active ? 'text-[#1A5C38]' : 'text-gray-400'}`} />
    </div>
  )
}

// ─── Cards moved to PropiedadCardGrid.tsx ────────────────────────────────────

// ─── PropiedadesView ──────────────────────────────────────────────────────────

export default function PropiedadesView({
  properties,
  initialPropertyId,
}: {
  properties: TokkoProperty[]
  /** If provided, the detail panel opens with this property on mount. Used by /propiedades/[slug] */
  initialPropertyId?: number
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSearch = searchParams.get('q') ?? ''
  // Leer operación desde la URL (el Navbar linkea a ?op=venta|alquiler)
  const opParam = (searchParams.get('op') ?? searchParams.get('operacion') ?? '').toLowerCase()
  const initialOperation: Operation =
    opParam === 'venta' || opParam === 'alquiler' ? opParam : 'todos'

  // Resolve zona from q param
  const resolvedZona = useMemo<Zona | null>(() => {
    if (!initialSearch) return null
    const q = initialSearch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return ZONAS.find(z => {
      const n = z.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (n === q) return true
      return (z.aliases ?? []).some(a => a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === q)
    }) ?? null
  }, [initialSearch])

  const activeZona = resolvedZona

  const [filters, setFilters]           = useState<Filters>({ ...DEFAULTS, search: initialSearch, operation: initialOperation })

  // Reaccionar a cambios de URL sin remontaje. Cuando el usuario clickea
  // "Comprar" o "Alquilar" en el header estando ya en /propiedades, Next.js
  // hace navegación client-side y solo cambia searchParams; sin este efecto
  // el filtro de operación quedaría con el valor viejo. Al cambiar la URL
  // también limpiamos los demás filtros (beds, maxPrice, location, type)
  // para evitar combinaciones inválidas heredadas de la sesión anterior.
  useEffect(() => {
    setFilters({ ...DEFAULTS, search: initialSearch, operation: initialOperation })
  }, [initialSearch, initialOperation])
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [hoveredId, setHoveredId]       = useState<number | null>(null)
  const [flyToCenter, setFlyToCenter]   = useState<[number, number] | null>(null)
  const [mobileView, setMobileView]     = useState<'list' | 'map'>(() => {
    if (typeof window === 'undefined') return 'map'
    return (sessionStorage.getItem('si_mobile_view') as 'list' | 'map') || 'map'
  })
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [listMode, setListMode]         = useState<ListMode>('compact')
  const [sortBy, setSortBy]             = useState<SortBy>('destacadas')
  const [sortOpen, setSortOpen]         = useState(false)
  const [mapBounds, setMapBounds]       = useState<{ south: number; north: number; west: number; east: number } | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileSortOpen, setMobileSortOpen]       = useState(false)
  const [refreshing, setRefreshing]               = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState(false)
  const [searchDropdownDesktop, setSearchDropdownDesktop] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchWrapDesktopRef = useRef<HTMLDivElement>(null)

  // Cargar historial persistente del localStorage al montar
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('si_search_history')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.filter((x): x is string => typeof x === 'string').slice(0, 5))
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Agregar término al historial (al principio, sin duplicados, max 5)
  const pushToHistory = useCallback((term: string) => {
    const t = term.trim()
    if (!t) return
    setSearchHistory(prev => {
      const next = [t, ...prev.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 5)
      try { localStorage.setItem('si_search_history', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])
  const searchWrapRef                   = useRef<HTMLDivElement>(null)
  const sortRef                         = useRef<HTMLDivElement>(null)
  const listRef                         = useRef<HTMLDivElement>(null)

  // Persist listMode preference
  useEffect(() => {
    const saved = localStorage.getItem('si-list-mode') as ListMode | null
    if (saved === 'compact' || saved === 'list') setListMode(saved)
  }, [])

  // Persist mobile view choice + Safari iOS fix
  useEffect(() => {
    sessionStorage.setItem('si_mobile_view', mobileView)
    if (mobileView === 'map') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    }
  }, [mobileView])

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSearchSuggestions(false)
      if (searchWrapDesktopRef.current && !searchWrapDesktopRef.current.contains(e.target as Node)) setSearchDropdownDesktop(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleListMode = useCallback((mode: ListMode) => {
    setListMode(mode)
    localStorage.setItem('si-list-mode', mode)
  }, [])

  const set = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters(prev => ({ ...prev, [k]: v })), [])

  const reset = useCallback(() => setFilters(DEFAULTS), [])

  // "Mi ubicación actual": obtiene coords + reverse geocoding con Nominatim
  // y carga el nombre del lugar en el input de búsqueda.
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización')
      return
    }
    setLocatingUser(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es&zoom=14`,
            { headers: { 'Accept': 'application/json' } },
          )
          if (!res.ok) throw new Error('Nominatim error')
          const data = await res.json()
          const addr = data.address ?? {}
          // Preferir barrio/suburb → ciudad, con fallback progresivo
          const nombre =
            addr.neighbourhood ||
            addr.suburb ||
            addr.village ||
            addr.town ||
            addr.city ||
            addr.city_district ||
            addr.county ||
            addr.state ||
            data.display_name?.split(',')[0] ||
            ''
          if (!nombre) throw new Error('Sin resultados')
          set('search', nombre)
          pushToHistory(nombre)
          setFlyToCenter([latitude, longitude])
          setMobileView('map')
          setSearchSuggestions(false)
          setSearchDropdownDesktop(false)
        } catch {
          setLocationError('No se pudo obtener tu ubicación')
        } finally {
          setLocatingUser(false)
        }
      },
      () => {
        setLocatingUser(false)
        setLocationError('No se pudo obtener tu ubicación')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [set, pushToHistory])

  const hasActive = (Object.keys(DEFAULTS) as (keyof Filters)[])
    .some(k => filters[k] !== DEFAULTS[k])

  // ─── Client-side filtering ──────────────────────────────────────────────────
  // Normaliza texto: lowercase + NFD sin tildes (para que "roldan" matchee "Roldán")
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Resolver el barrio real de cada propiedad (NO usar divisions en bruto porque
  // Tokko pone TODOS los barrios de la ciudad en divisions[], no solo el de la
  // propiedad). Match del fake_address contra cada division individual.
  const resolvedNeighborhoods = useMemo(() => {
    const map: Record<number, string> = {}
    for (const p of properties) {
      const addrText = p.fake_address || p.address || ''
      const divs = [...(p.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
      const match = divs.find(d => {
        const escaped = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`\\b${escaped}\\b`, 'i').test(addrText)
      })
      map[p.id] = match?.name ?? ''
    }
    return map
  }, [properties])

  const filtered = useMemo(() => properties.filter(p => {
    if (filters.search) {
      const q = norm(filters.search)
      // Solo incluir el barrio resuelto (no toda la lista de divisions de la ciudad)
      const neighborhood = resolvedNeighborhoods[p.id] ?? ''
      const development = p.development?.name ?? ''
      const haystack = norm([
        p.publication_title,
        p.address,
        p.fake_address,
        p.location?.short_location,
        p.location?.name,
        neighborhood,
        development,
      ].filter(Boolean).join(' '))
      if (!haystack.includes(q)) return false
    }
    if (filters.operation !== 'todos') {
      const op = p.operations?.[0]?.operation_type
      if (filters.operation === 'venta' && op !== 'Sale') return false
      if (filters.operation === 'alquiler' && op !== 'Rent') return false
    }
    if (filters.type !== 'todos') {
      const t = p.type?.name?.toLowerCase() ?? ''
      if (filters.type === 'casa' && !t.includes('casa') && !t.includes('house')) return false
      if (filters.type === 'departamento' && !t.includes('departamento') && !t.includes('apartment') && !t.includes('condo')) return false
      if (filters.type === 'terreno' && !t.includes('terreno') && !t.includes('land') && !t.includes('countryside')) return false
      if (filters.type === 'local' && !t.includes('local') && !t.includes('comercial') && !t.includes('bussiness') && !t.includes('warehouse')) return false
    }
    if (filters.beds !== 'todos') {
      const rooms = p.suite_amount || p.room_amount || 0
      if (filters.beds === '4+' && rooms < 4) return false
      if (filters.beds !== '4+' && rooms !== parseInt(filters.beds)) return false
    }
    if (filters.maxPrice !== 'sin-limite') {
      const max = parseInt(filters.maxPrice)
      const price = p.operations?.[0]?.prices?.[0]?.price ?? 0
      const currency = p.operations?.[0]?.prices?.[0]?.currency ?? ''
      if (currency === 'USD' && price > max) return false
    }
    if (filters.location !== 'todos') {
      const all = norm(`${p.location?.short_location ?? p.location?.name ?? ''} ${p.fake_address ?? p.address ?? ''}`)
      if (filters.location === 'roldan' && !all.includes('roldan')) return false
      if (filters.location === 'rosario' && !all.includes('rosario')) return false
      if (filters.location === 'funes' && !all.includes('funes')) return false
    }
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'destacadas': {
        if (a.is_starred_on_web && !b.is_starred_on_web) return -1
        if (!a.is_starred_on_web && b.is_starred_on_web) return 1
        return 0
      }
      case 'precio-asc': {
        const pa = a.operations?.[0]?.prices?.[0]?.price ?? Infinity
        const pb = b.operations?.[0]?.prices?.[0]?.price ?? Infinity
        return pa - pb
      }
      case 'precio-desc': {
        const pa = a.operations?.[0]?.prices?.[0]?.price ?? 0
        const pb = b.operations?.[0]?.prices?.[0]?.price ?? 0
        return pb - pa
      }
      case 'superficie': {
        const sa = parseFloat(a.total_surface) || parseFloat(a.roofed_surface) || 0
        const sb = parseFloat(b.total_surface) || parseFloat(b.roofed_surface) || 0
        return sb - sa
      }
      case 'recientes':
      default:
        return 0
    }
  }), [properties, filters, sortBy])

  // Apply map bounds filter if active
  const visibleProperties = useMemo(() => {
    if (!mapBounds) return filtered
    return filtered.filter(p => {
      if (!p.geo_lat || !p.geo_long) return true
      const lat = parseFloat(p.geo_lat)
      const lng = parseFloat(p.geo_long)
      return lat >= mapBounds.south && lat <= mapBounds.north && lng >= mapBounds.west && lng <= mapBounds.east
    })
  }, [filtered, mapBounds])

  const [panelPropertyId, setPanelPropertyId] = useState<number | null>(initialPropertyId ?? null)

  // Re-sync panel state if navigating between /propiedades/[slug] URLs
  // without remounting (e.g. clicking a nearby property inside the panel).
  useEffect(() => {
    if (initialPropertyId != null) setPanelPropertyId(initialPropertyId)
  }, [initialPropertyId])

  const handleCardClick = useCallback((property: TokkoProperty) => {
    setSelectedId(property.id)
    if (property.geo_lat && property.geo_long) {
      const lat = parseFloat(property.geo_lat)
      const lng = parseFloat(property.geo_long)
      if (!isNaN(lat) && !isNaN(lng)) setFlyToCenter([lat, lng])
    }
    // Desktop: panel overlay (mapa visible detrás, tipo Zillow)
    // Mobile: bottom sheet preview
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowBottomSheet(true)
    } else {
      setPanelPropertyId(property.id)
    }
  }, [])

  const handleMapSelect = useCallback((id: number) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowBottomSheet(true)
    }
  }, [])

  const handleMapDeselect = useCallback(() => {
    setSelectedId(null)
  }, [])

  // Scroll automático a la card seleccionada (cuando el usuario clickea un marker)
  useEffect(() => {
    if (selectedId == null || !listRef.current) return
    const el = listRef.current.querySelector<HTMLDivElement>(`[data-property-id="${selectedId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedId])

  const closeBottomSheet = useCallback(() => {
    setShowBottomSheet(false)
    setSelectedId(null)
  }, [])

  const selectedProperty = useMemo(
    () => (selectedId != null ? properties.find(p => p.id === selectedId) ?? null : null),
    [selectedId, properties]
  )

  const opLabel = filters.operation === 'venta' ? 'en venta'
    : filters.operation === 'alquiler' ? 'en alquiler' : 'disponibles'

  const searchZonas = useMemo(() => buscarZonas(filters.search, 6), [filters.search])

  // Count non-operation active filters for mobile badge
  const mobileActiveCount = [
    filters.type !== 'todos',
    filters.beds !== 'todos',
    filters.maxPrice !== 'sin-limite',
    filters.location !== 'todos',
  ].filter(Boolean).length

  return (
    <div className="h-[100dvh] lg:h-[calc(100dvh-var(--header-height))] flex flex-col bg-white overflow-hidden" style={{ overscrollBehaviorY: 'contain' }}>
      <h1 className="sr-only">Propiedades en venta y alquiler en Funes, Roldán y Rosario</h1>

      {/* ── Mobile Filter Bar (shared between list and map views) ────────── */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        {/* Row 1: Back + Search + Location */}
        <div className="flex items-center gap-2 px-3 pt-[env(safe-area-inset-top)] py-2">
          <button
            onClick={() => mobileView === 'map' ? setMobileView('list') : window.history.back()}
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative flex-1" ref={searchWrapRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Dirección, ciudad o barrio..."
              value={filters.search}
              aria-label="Buscar dirección, ciudad o barrio"
              autoComplete="off"
              onChange={e => {
                set('search', e.target.value)
                setSearchSuggestions(true)
              }}
              onFocus={() => setSearchSuggestions(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const v = filters.search.trim()
                  if (v.length >= 2) pushToHistory(v)
                  setSearchSuggestions(false)
                  ;(e.currentTarget as HTMLInputElement).blur()
                }
              }}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 placeholder:text-gray-400"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 16, border: '1.5px solid #e5e7eb' }}
            />
            {/* Autocomplete dropdown */}
            {searchSuggestions && (
              <div
                className="absolute left-0 right-0 z-50 bg-white overflow-y-auto"
                style={{
                  top: '100%', marginTop: 4,
                  border: '1px solid #e5e7eb', borderRadius: 12,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  maxHeight: '50vh',
                }}
              >
                {/* Mi ubicación actual — siempre primera opción */}
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={useMyLocation}
                  disabled={locatingUser}
                  className="w-full flex items-center gap-3 text-left"
                  style={{
                    padding: '14px 16px', fontSize: 15, color: '#1A5C38',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: locatingUser ? 'wait' : 'pointer',
                    minHeight: 48, fontFamily: "'Raleway', system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {locatingUser ? (
                    <div className="w-4 h-4 border-2 border-[#1A5C38]/30 border-t-[#1A5C38] rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <Locate className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                  )}
                  <span className="flex-1">
                    {locatingUser ? 'Obteniendo ubicación...' : 'Mi ubicación actual'}
                  </span>
                </button>
                {locationError && (
                  <div style={{ padding: '10px 16px', fontSize: 13, color: '#dc2626', background: '#fef2f2', borderBottom: '1px solid #f3f4f6' }}>
                    {locationError}
                  </div>
                )}
                {/* Búsquedas recientes — solo si no está escribiendo y hay historial */}
                {filters.search.trim().length < 2 && searchHistory.length > 0 && (
                  <>
                    <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                      Búsquedas recientes
                    </div>
                    {searchHistory.map(term => (
                      <button
                        key={term}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          set('search', term)
                          pushToHistory(term)
                          setSearchSuggestions(false)
                        }}
                        className="w-full flex items-center gap-3 text-left"
                        style={{
                          padding: '12px 16px', fontSize: 15, color: '#111',
                          background: 'transparent', border: 'none',
                          borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                          minHeight: 44, fontFamily: "'Raleway', system-ui, sans-serif",
                        }}
                      >
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 truncate">{term}</span>
                      </button>
                    ))}
                  </>
                )}
                {searchZonas.map(zona => (
                  <button
                    key={zona.id}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      set('search', zona.nombre)
                      pushToHistory(zona.nombre)
                      setSearchSuggestions(false)
                    }}
                    className="w-full flex items-center gap-3 text-left"
                    style={{
                      padding: '14px 16px',
                      fontSize: 15,
                      color: '#111',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      minHeight: 48,
                      fontFamily: "'Raleway', system-ui, sans-serif",
                    }}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1 truncate">{highlightMatch(zona.nombre, filters.search)}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                      {zona.tipo === 'barrio_cerrado' ? `${zona.ciudad} · Country` : zona.ciudad}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Operation toggle + Filters button */}
        <div className="flex items-center gap-2 px-3 pb-2">
          {/* Segmented control */}
          <div className="flex rounded-full bg-gray-100 p-0.5 flex-1" style={{ minHeight: 44 }}>
            {(['venta', 'alquiler'] as const).map(op => (
              <button
                key={op}
                onClick={() => set('operation', filters.operation === op ? 'todos' : op)}
                className="flex-1 py-2.5 rounded-full text-center transition-all"
                style={{
                  background: filters.operation === op ? '#1A5C38' : 'transparent',
                  color: filters.operation === op ? '#fff' : '#6b7280',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: filters.operation === op ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="relative flex items-center gap-1.5 h-11 rounded-xl px-4 flex-shrink-0 cursor-pointer"
            style={{
              border: mobileActiveCount > 0 ? '1.5px solid #1A5C38' : '1.5px solid #d1d5db',
              background: '#fff',
              fontFamily: "'Raleway', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: mobileActiveCount > 0 ? '#1A5C38' : '#0a0a0a',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {mobileActiveCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {mobileActiveCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Desktop Filter Bar ────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 overflow-x-auto scrollbar-none">
        <div className="relative min-w-[220px] max-w-[260px] flex-shrink-0" ref={searchWrapDesktopRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Dirección, ciudad o barrio..." value={filters.search}
            aria-label="Buscar barrio o dirección"
            autoComplete="off"
            onChange={e => { set('search', e.target.value); setSearchDropdownDesktop(true) }}
            onFocus={() => setSearchDropdownDesktop(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const v = filters.search.trim()
                if (v.length >= 2) pushToHistory(v)
                setSearchDropdownDesktop(false)
                ;(e.currentTarget as HTMLInputElement).blur()
              }
            }}
            className="w-full h-10 pl-8 pr-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all placeholder:text-gray-400"
            style={{ border: '1.5px solid #d1d5db', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14 }}
          />
          {searchDropdownDesktop && (
            <div
              className="absolute left-0 right-0 z-50 bg-white overflow-y-auto"
              style={{
                top: '100%', marginTop: 4,
                border: '1px solid #e5e7eb', borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                maxHeight: '60vh', minWidth: 280,
              }}
            >
              {/* Mi ubicación actual — siempre primera opción */}
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={useMyLocation}
                disabled={locatingUser}
                className="w-full flex items-center gap-3 text-left"
                style={{
                  padding: '12px 14px', fontSize: 14, color: '#1A5C38',
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: locatingUser ? 'wait' : 'pointer',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                  fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f7f4' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {locatingUser ? (
                  <div className="w-4 h-4 border-2 border-[#1A5C38]/30 border-t-[#1A5C38] rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <Locate className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                )}
                <span className="flex-1">
                  {locatingUser ? 'Obteniendo ubicación...' : 'Mi ubicación actual'}
                </span>
              </button>
              {locationError && (
                <div style={{ padding: '10px 14px', fontSize: 13, color: '#dc2626', background: '#fef2f2', borderBottom: '1px solid #f3f4f6' }}>
                  {locationError}
                </div>
              )}
              {/* Búsquedas recientes — solo si no está escribiendo y hay historial */}
              {filters.search.trim().length < 2 && searchHistory.length > 0 && (
                <>
                  <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                    Búsquedas recientes
                  </div>
                  {searchHistory.map(term => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        set('search', term)
                        pushToHistory(term)
                        setSearchDropdownDesktop(false)
                      }}
                      className="w-full flex items-center gap-3 text-left"
                      style={{
                        padding: '10px 14px', fontSize: 14, color: '#111',
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                        fontFamily: "'Raleway', system-ui, sans-serif",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 truncate">{term}</span>
                    </button>
                  ))}
                </>
              )}
              {searchZonas.map(zona => (
                <button
                  key={zona.id}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    set('search', zona.nombre)
                    pushToHistory(zona.nombre)
                    setSearchDropdownDesktop(false)
                  }}
                  className="w-full flex items-center gap-3 text-left"
                  style={{
                    padding: '10px 14px', fontSize: 14, color: '#111',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    fontFamily: "'Raleway', system-ui, sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 truncate">{highlightMatch(zona.nombre, filters.search)}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                    {zona.tipo === 'barrio_cerrado' ? `${zona.ciudad} · Country` : zona.ciudad}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
        <FilterSelect value={filters.operation} onChange={v => set('operation', v)}
          options={[{value:'todos',label:'Operación'},{value:'venta',label:'Venta'},{value:'alquiler',label:'Alquiler'}]} />
        <FilterSelect value={filters.type} onChange={v => set('type', v)}
          options={[{value:'todos',label:'Tipología'},{value:'casa',label:'Casa'},{value:'departamento',label:'Depto.'},{value:'terreno',label:'Terreno'},{value:'local',label:'Local'}]} />
        <FilterSelect value={filters.beds} onChange={v => set('beds', v)}
          options={[{value:'todos',label:'Dormitorios'},{value:'1',label:'1 dorm.'},{value:'2',label:'2 dorm.'},{value:'3',label:'3 dorm.'},{value:'4+',label:'4+ dorm.'}]} />
        <FilterSelect value={filters.maxPrice} onChange={v => set('maxPrice', v)}
          options={PRICE_OPTIONS.map(o => ({ value: o.value as MaxPrice, label: o.value === 'sin-limite' ? 'Precio máx.' : o.label }))} />
        <FilterSelect value={filters.location} onChange={v => set('location', v)}
          options={[{value:'todos',label:'Ubicación'},{value:'roldan',label:'Roldán'},{value:'rosario',label:'Rosario'},{value:'funes',label:'Funes'}]} />
        {hasActive && (
          <>
            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
            <button onClick={reset}
              className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-colors"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: '#dc2626' }}
            >
              <X className="w-3.5 h-3.5" /> Borrar filtros
            </button>
          </>
        )}
      </div>


      {/* Mobile filter sheet */}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onChangeFilter={(k, v) => set(k as keyof Filters, v as never)}
        onReset={() => { reset(); setMobileFiltersOpen(false) }}
        resultCount={visibleProperties.length}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Property list */}
        <div className={`flex flex-col border-r border-gray-200 w-full md:w-[40%] ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}>

          {/* Count header + sort + view toggle — desktop only */}
          <div className="hidden md:flex px-3 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0 items-center justify-between gap-2">
            {/* Sort dropdown */}
            <div ref={sortRef} className="relative flex-shrink-0">
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {sortBy === 'destacadas' ? 'Ordenar' : SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </span>
                <span className="sm:hidden">Ordenar</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-[13px] text-left transition-colors ${
                        sortBy === opt.value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[12px] text-gray-500 flex-1 text-center truncate">
              <span className="font-bold text-gray-900 font-numeric">{visibleProperties.length}</span>
              {' '}propiedad{visibleProperties.length !== 1 ? 'es' : ''} {opLabel}
            </p>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleListMode('compact')}
                className={`p-1.5 rounded transition-colors ${listMode === 'compact' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Vista compacta"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => toggleListMode('list')}
                className={`p-1.5 rounded transition-colors ${listMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Vista lista"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {visibleProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-8 py-12">
                <SlidersHorizontal className="w-9 h-9 text-gray-200 mb-3" />
                <p className="text-gray-500 font-semibold text-sm mb-1">Sin resultados</p>
                <p className="text-gray-400 text-xs mb-4">Probá con otros filtros</p>
                <button onClick={() => { reset(); setMapBounds(null) }} className="text-accent-400 text-sm font-semibold hover:text-accent-500 transition-colors">
                  Borrar filtros
                </button>
              </div>
            ) : (
              <>
                {/* Desktop grid */}
                <div className="hidden md:grid p-4 grid-cols-1 xl:grid-cols-2 gap-4">
                  {visibleProperties.map(p => (
                    <div
                      key={p.id}
                      data-property-id={p.id}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(prev => (prev === p.id ? null : prev))}
                    >
                      <PropiedadCardGrid property={p} isSelected={p.id === selectedId} onClick={() => handleCardClick(p)} />
                    </div>
                  ))}
                </div>
                {/* Mobile list */}
                <div className="md:hidden px-4 pt-3 pb-[100px] space-y-3">
                  {visibleProperties.map(p => (
                    <div key={p.id} data-property-id={p.id}>
                      <PropiedadCardGrid property={p} isSelected={p.id === selectedId} onClick={() => router.push(`/propiedades/${generatePropertySlug(p)}`)} variant="mobile" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className={`relative w-full md:w-[60%] ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          <PropiedadesMap
            properties={filtered}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={handleMapSelect}
            onDeselect={handleMapDeselect}
            onOpenDetail={(id) => setPanelPropertyId(id)}
            flyToCenter={flyToCenter}
            onBoundsSearch={(bounds) => {
              setRefreshing(true)
              setMapBounds({
                south: bounds.getSouth(),
                north: bounds.getNorth(),
                west: bounds.getWest(),
                east: bounds.getEast(),
              })
              setTimeout(() => setRefreshing(false), 500)
            }}
            activeZona={activeZona}
            onMapMove={closeBottomSheet}
          />
          <div className="absolute top-3 left-3 z-[999] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md border border-gray-100">
              <span className="text-xs font-bold text-gray-900 font-numeric">
                {visibleProperties.filter(p => p.geo_lat && p.geo_long).length}
              </span>
              <span className="text-xs text-gray-500"> propiedades</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Buttons ───────────────────────────────────────── */}
      <div
        className={`md:hidden fixed left-1/2 -translate-x-1/2 z-[9999] flex gap-3 transition-opacity duration-200 ${
          showBottomSheet ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', maxWidth: 280 }}
      >
        {mobileView === 'list' && (
          <button
            onClick={() => setMobileSortOpen(true)}
            className="inline-flex items-center gap-2 rounded-full"
            style={{ background: '#111', color: '#fff', padding: '12px 20px', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, fontWeight: 600, border: 'none', minHeight: 44, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          >
            <ArrowUpDown className="w-4 h-4" /> Ordenar
          </button>
        )}
        {mobileView === 'map' && (
          <button
            onClick={() => { window.dispatchEvent(new Event('si-refresh-bounds')) }}
            className="inline-flex items-center justify-center rounded-full"
            style={{ background: '#111', color: '#fff', width: 44, height: 44, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            aria-label="Buscar en esta zona"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
          className="inline-flex items-center gap-2 rounded-full"
          style={{ background: '#111', color: '#fff', padding: '12px 20px', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, fontWeight: 600, border: 'none', minHeight: 44, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
        >
          {mobileView === 'list' ? (
            <><Map className="w-4 h-4" /> Mapa</>
          ) : (
            <><LayoutGrid className="w-4 h-4" /> Lista</>
          )}
        </button>
      </div>

      {/* ── Mobile Sort Sheet ─────────────────────────────────────────────── */}
      {mobileSortOpen && (
        <>
          <div className="fixed inset-0 z-[10000] bg-black/50" onClick={() => setMobileSortOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[10001] bg-white flex flex-col"
            style={{ borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', animation: 'slideUp 250ms ease-out' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div />
              <span style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 700, fontSize: 18, color: '#0a0a0a' }}>Ordenar por</span>
              <button onClick={() => setMobileSortOpen(false)} className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setMobileSortOpen(false) }}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                  style={{
                    fontFamily: "'Raleway', system-ui, sans-serif",
                    fontSize: 15,
                    fontWeight: sortBy === opt.value ? 600 : 400,
                    color: sortBy === opt.value ? '#1A5C38' : '#0a0a0a',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    minHeight: 48,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                  {sortBy === opt.value && <Check className="w-5 h-5 text-[#1A5C38]" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile Property Preview Card (vertical Zillow-style) ──────── */}
      {selectedProperty && (
        <div
          className={`md:hidden fixed left-3 right-3 z-[9998] transition-all duration-250 ${
            showBottomSheet ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
          }`}
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', maxWidth: 'calc(100vw - 24px)' }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {/* Photo */}
            <div className="relative w-full aspect-[16/10] bg-gray-100">
              {(() => {
                const photo = getMainPhoto(selectedProperty)
                return photo ? (
                  <Image src={photo} alt={selectedProperty.publication_title || selectedProperty.address}
                    fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-300" />
                  </div>
                )
              })()}
              {/* Operation badge */}
              {(() => {
                const op = getOperationType(selectedProperty)
                return op ? (
                  <span className="absolute top-2.5 left-2.5"
                    style={{
                      background: op === 'Venta' ? '#1A5C38' : op === 'Alquiler' ? '#2563eb' : '#7c3aed',
                      color: '#fff', fontFamily: "'Raleway', system-ui, sans-serif",
                      fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
                      padding: '5px 10px', borderRadius: 6,
                    }}>
                    {op}
                  </span>
                ) : null
              })()}
              {/* Close button */}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); closeBottomSheet() }}
                aria-label="Cerrar"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 14 }}>
              <p style={{ fontFamily: "'Poppins', system-ui, sans-serif", fontWeight: 700, fontSize: 22, color: '#0a0a0a', margin: '0 0 4px', fontVariantNumeric: 'tabular-nums' }}>
                {formatPrice(selectedProperty)}
              </p>
              <p style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>
                {(() => {
                  const specs: string[] = []
                  const r = getRoofedArea(selectedProperty)
                  const land2 = isLand(selectedProperty)
                  const lot = getLotSurface(selectedProperty)
                  if (!land2 && (selectedProperty.suite_amount || selectedProperty.room_amount) > 0)
                    specs.push(`${selectedProperty.suite_amount || selectedProperty.room_amount} dorm`)
                  if (!land2 && selectedProperty.bathroom_amount > 0)
                    specs.push(`${selectedProperty.bathroom_amount} baño${selectedProperty.bathroom_amount > 1 ? 's' : ''}`)
                  if (r != null && r > 0) specs.push(`${r} m² cub`)
                  if (lot != null && lot > 0 && lot !== r) specs.push(`${lot.toLocaleString('es-AR')} m² lote`)
                  if (land2 && lot != null && lot > 0 && specs.length === 0) specs.push(`${lot.toLocaleString('es-AR')} m²`)
                  return specs.join(' · ')
                })()}
              </p>
              <p style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 500, fontSize: 14, color: '#0a0a0a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {translatePropertyType(selectedProperty.type?.name)}{selectedProperty.type?.name && (selectedProperty.fake_address || selectedProperty.address) ? ' · ' : ''}{selectedProperty.fake_address || selectedProperty.address}
              </p>
              <p style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedProperty.location?.short_location || selectedProperty.location?.name || ''}
              </p>

              {/* CTA */}
              <Link
                href={`/propiedades/${generatePropertySlug(selectedProperty)}`}
                onClick={e => e.stopPropagation()}
                className="block text-center mt-3 mb-1"
                style={{
                  background: '#1A5C38', color: '#fff',
                  fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, fontWeight: 600,
                  padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
                  minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                Ver propiedad completa →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Panel de detalle tipo Zillow (desktop) */}
      {panelPropertyId != null && (
        <PropertyPanel
          propertyId={panelPropertyId}
          onClose={() => { setPanelPropertyId(null); setSelectedId(null) }}
          allProperties={properties}
        />
      )}
    </div>
  )
}
