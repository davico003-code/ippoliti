'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Bookmark,
  ArrowLeft,
} from 'lucide-react'
import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import MobileFilterSheet from '@/components/MobileFilterSheet'
import { ZONAS, type Zona } from '@/lib/zonas'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  getRoofedArea,
  getLotSurface,
  isLand,
  translatePropertyType,
  generatePropertySlug,
} from '@/lib/tokko'

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
type MaxPrice  = 'sin-limite' | '50000' | '100000' | '200000' | '500000'
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

export default function PropiedadesView({ properties }: { properties: TokkoProperty[] }) {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''

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

  const [filters, setFilters]           = useState<Filters>({ ...DEFAULTS, search: initialSearch })
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [flyToCenter, setFlyToCenter]   = useState<[number, number] | null>(null)
  const [mobileView, setMobileView]     = useState<'list' | 'map'>('list')
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [listMode, setListMode]         = useState<ListMode>('compact')
  const [sortBy, setSortBy]             = useState<SortBy>('destacadas')
  const [sortOpen, setSortOpen]         = useState(false)
  const [mapBounds, setMapBounds]       = useState<{ south: number; north: number; west: number; east: number } | null>(null)
  const [saveToast, setSaveToast]       = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const sortRef                         = useRef<HTMLDivElement>(null)
  const listRef                         = useRef<HTMLDivElement>(null)

  // Hide navbar on mobile for /propiedades
  useEffect(() => {
    const nav = document.querySelector('nav')
    if (!nav) return
    const mq = window.matchMedia('(max-width: 767px)')
    const toggle = (e: MediaQueryListEvent | MediaQueryList) => {
      nav.style.display = e.matches ? 'none' : ''
    }
    toggle(mq)
    mq.addEventListener('change', toggle)
    return () => { mq.removeEventListener('change', toggle); nav.style.display = '' }
  }, [])

  // Persist listMode preference
  useEffect(() => {
    const saved = localStorage.getItem('si-list-mode') as ListMode | null
    if (saved === 'compact' || saved === 'list') setListMode(saved)
  }, [])

  // Fix mapa Safari iOS - forzar resize al mostrar
  useEffect(() => {
    if (mobileView === 'map') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    }
  }, [mobileView])

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
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

  const hasActive = (Object.keys(DEFAULTS) as (keyof Filters)[])
    .some(k => filters[k] !== DEFAULTS[k])

  // ─── Client-side filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => properties.filter(p => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = [p.publication_title, p.address, p.fake_address, p.location?.short_location, p.location?.name]
        .filter(Boolean).join(' ').toLowerCase()
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
      const loc = (p.location?.short_location ?? p.location?.name ?? '').toLowerCase()
      const addr = (p.fake_address ?? p.address ?? '').toLowerCase()
      const all = `${loc} ${addr}`
      if (filters.location === 'roldan' && !all.includes('roldan') && !all.includes('roldán')) return false
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

  const handleCardClick = useCallback((property: TokkoProperty) => {
    setSelectedId(property.id)
    if (property.geo_lat && property.geo_long) {
      const lat = parseFloat(property.geo_lat)
      const lng = parseFloat(property.geo_long)
      if (!isNaN(lat) && !isNaN(lng)) setFlyToCenter([lat, lng])
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowBottomSheet(true)
    }
  }, [])

  const handleMapSelect = useCallback((id: number) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowBottomSheet(true)
    }
  }, [])

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

  // Count non-operation active filters for mobile badge
  const mobileActiveCount = [
    filters.type !== 'todos',
    filters.beds !== 'todos',
    filters.maxPrice !== 'sin-limite',
    filters.location !== 'todos',
  ].filter(Boolean).length

  return (
    <div className="h-screen md:h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden">
      <h1 className="sr-only">Propiedades en venta y alquiler en Funes, Roldán y Rosario</h1>

      {/* ── Mobile Filter Bar (2 rows) ────────────────────────────────────── */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        {/* Row 1: Back + Search + Location */}
        <div className="flex items-center gap-2 px-3 pt-[env(safe-area-inset-top)] py-2">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Dirección, ciudad o barrio..."
              value={filters.search}
              aria-label="Buscar dirección, ciudad o barrio"
              onChange={e => set('search', e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 placeholder:text-gray-400"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, border: '1.5px solid #e5e7eb' }}
            />
          </div>
          <button
            onClick={() => {
              if (!navigator.geolocation) return
              navigator.geolocation.getCurrentPosition(
                pos => { setMobileView('map'); setFlyToCenter([pos.coords.latitude, pos.coords.longitude]) },
                () => {},
                { enableHighAccuracy: true, timeout: 8000 }
              )
            }}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0"
            style={{ border: '1.5px solid #e5e7eb' }}
            aria-label="Mi ubicación"
          >
            <MapPin className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Row 2: Operation toggle + Filters button */}
        <div className="flex items-center gap-2 px-3 pb-2">
          {/* Segmented control */}
          <div className="flex rounded-full bg-gray-100 p-0.5 flex-1">
            {(['venta', 'alquiler'] as const).map(op => (
              <button
                key={op}
                onClick={() => set('operation', filters.operation === op ? 'todos' : op)}
                className="flex-1 py-2 rounded-full text-center transition-all"
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
            className="relative flex items-center gap-1.5 h-10 rounded-xl px-4 flex-shrink-0 cursor-pointer"
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
        <div className="relative min-w-[170px] max-w-[220px] flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Dirección, ciudad o barrio..." value={filters.search}
            aria-label="Buscar barrio o dirección"
            onChange={e => set('search', e.target.value)}
            className="w-full h-10 pl-8 pr-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all placeholder:text-gray-400"
            style={{ border: '1.5px solid #d1d5db', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14 }}
          />
        </div>
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
        <FilterSelect value={filters.operation} onChange={v => set('operation', v)}
          options={[{value:'todos',label:'Operación'},{value:'venta',label:'Venta'},{value:'alquiler',label:'Alquiler'}]} />
        <FilterSelect value={filters.type} onChange={v => set('type', v)}
          options={[{value:'todos',label:'Tipología'},{value:'casa',label:'Casa'},{value:'departamento',label:'Depto.'},{value:'terreno',label:'Terreno'},{value:'local',label:'Local'}]} />
        <FilterSelect value={filters.beds} onChange={v => set('beds', v)}
          options={[{value:'todos',label:'Dormitorios'},{value:'1',label:'1 dorm.'},{value:'2',label:'2 dorm.'},{value:'3',label:'3 dorm.'},{value:'4+',label:'4+ dorm.'}]} />
        <FilterSelect value={filters.maxPrice} onChange={v => set('maxPrice', v)}
          options={[{value:'sin-limite',label:'Precio máx.'},{value:'50000',label:'USD 50k'},{value:'100000',label:'USD 100k'},{value:'200000',label:'USD 200k'},{value:'500000',label:'USD 500k'}]} />
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
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
        <button
          onClick={() => {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(
              pos => { setMobileView('map'); setFlyToCenter([pos.coords.latitude, pos.coords.longitude]) },
              () => {},
              { enableHighAccuracy: true, timeout: 8000 }
            )
          }}
          className="flex items-center gap-1.5 h-10 rounded-xl px-3.5 whitespace-nowrap flex-shrink-0 transition-all cursor-pointer"
          style={{ border: '1.5px solid #d1d5db', background: '#fff', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: '#0a0a0a' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0a0a0a' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db' }}
          title="Mi ubicación"
        >
          <MapPin className="w-4 h-4 text-gray-400" />
          Mi ubicación
        </button>
        <button
          onClick={() => setSaveToast(true)}
          className="flex items-center gap-1.5 h-10 rounded-xl px-4 whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer"
          style={{ background: '#1A5C38', color: '#fff', border: 'none', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14, fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
        >
          <Bookmark className="w-4 h-4" />
          Guardar
        </button>
      </div>

      {/* Save search toast */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3"
          style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14 }}
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          Guardá búsquedas para recibir alertas de nuevas propiedades
          <button onClick={() => setSaveToast(false)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                    <PropiedadCardGrid key={p.id} property={p} isSelected={p.id === selectedId} onClick={() => handleCardClick(p)} />
                  ))}
                </div>
                {/* Mobile list */}
                <div className="md:hidden px-4 pt-3 pb-[100px] space-y-3">
                  {visibleProperties.map(p => (
                    <PropiedadCardGrid key={p.id} property={p} isSelected={p.id === selectedId} onClick={() => handleCardClick(p)} variant="mobile" />
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
            onSelect={handleMapSelect}
            flyToCenter={flyToCenter}
            onBoundsSearch={(bounds) => {
              setMapBounds({
                south: bounds.getSouth(),
                north: bounds.getNorth(),
                west: bounds.getWest(),
                east: bounds.getEast(),
              })
            }}
            activeZona={activeZona}
            onMapMove={closeBottomSheet}
          />
          <div className="absolute top-3 left-3 z-[999] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-100">
              <span className="text-xs font-bold text-gray-900 font-numeric">
                {visibleProperties.filter(p => p.geo_lat && p.geo_long).length}
              </span>
              <span className="text-xs text-gray-500"> pines en el mapa</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Toggle ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center gap-2 rounded-full"
        style={{
          background: '#1A5C38',
          color: '#fff',
          padding: '12px 24px',
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          border: 'none',
        }}
      >
        {mobileView === 'list' ? (
          <>
            <Map className="w-4 h-4" /> Mapa
          </>
        ) : (
          <>
            <LayoutGrid className="w-4 h-4" /> Lista
          </>
        )}
      </button>

      {/* ── Mobile Property Preview Card ─────────────────────────────────── */}
      {selectedProperty && (
        <Link
          href={`/propiedades/${generatePropertySlug(selectedProperty)}`}
          className={`md:hidden fixed left-3 right-3 z-[9998] transition-all duration-200 ${
            showBottomSheet ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
          style={{ bottom: 80 }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex" style={{ border: '1px solid #e5e7eb' }}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); closeBottomSheet() }}
              aria-label="Cerrar"
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <div className="relative w-28 flex-shrink-0 bg-gray-100">
              {(() => {
                const photo = getMainPhoto(selectedProperty)
                return photo ? (
                  <Image src={photo} alt={selectedProperty.publication_title || selectedProperty.address}
                    fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-300" />
                  </div>
                )
              })()}
            </div>
            <div className="flex-1 min-w-0 p-3 pr-8 flex flex-col gap-0.5">
              {selectedProperty.type?.name && (
                <span className="self-start px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-white"
                  style={{ background: '#1A5C38', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                  {translatePropertyType(selectedProperty.type.name)}
                </span>
              )}
              <h3 className="text-[13px] font-medium text-gray-900 leading-tight line-clamp-2"
                style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}>
                {selectedProperty.publication_title || selectedProperty.address}
              </h3>
              <p className="text-[17px] font-bold text-gray-900"
                style={{ fontFamily: "'Poppins', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                {formatPrice(selectedProperty)}
              </p>
              <p className="text-[11px] text-gray-500" style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}>
                {(() => {
                  const specs: string[] = []
                  const r = getRoofedArea(selectedProperty)
                  const land2 = isLand(selectedProperty)
                  const lot = getLotSurface(selectedProperty)
                  if (r != null && r > 0) specs.push(`${r} m²`)
                  if (!land2 && (selectedProperty.suite_amount || selectedProperty.room_amount) > 0)
                    specs.push(`${selectedProperty.suite_amount || selectedProperty.room_amount} dorm`)
                  if (!land2 && selectedProperty.bathroom_amount > 0)
                    specs.push(`${selectedProperty.bathroom_amount} baño${selectedProperty.bathroom_amount > 1 ? 's' : ''}`)
                  if (land2 && lot != null && lot > 0 && specs.length === 0) specs.push(`${lot} m²`)
                  return specs.join(' · ')
                })()}
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
