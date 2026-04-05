'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  MapPin,
  List,
  Map,
  X,
  SlidersHorizontal,
  ChevronDown,
  Bed,
  Bath,
  Maximize2,
  Home,
  Car,
  LayoutGrid,
  LayoutList,
  Check,
  ArrowUpDown,
} from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import FeaturedPropertyEditorial from '@/components/FeaturedPropertyEditorial'
import SimplePropertyCard from '@/components/SimplePropertyCard'
import { buildPropertyLayout } from '@/lib/propertyLayout'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  translatePropertyType,
  translateCondition,
  generatePropertySlug,
  getDescription,
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
type ListMode  = 'compact' | 'list' | 'editorial'
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
        className={`appearance-none rounded-lg pl-3 pr-7 py-1.5 text-sm cursor-pointer
          focus:outline-none transition-all border
          ${active
            ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${active ? 'text-brand-600' : 'text-gray-400'}`} />
    </div>
  )
}

// ─── Compact card (sidebar mini) ─────────────────────────────────────────────

function CompactCard({ property, isSelected, onClick }: {
  property: TokkoProperty; isSelected: boolean; onClick: () => void
}) {
  const photo = getMainPhoto(property)
  const operation = getOperationType(property)
  const price = formatPrice(property)
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const land = isLand(property)
  const slug = generatePropertySlug(property)
  const starred = property.is_starred_on_web

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 border-b cursor-pointer transition-all duration-150 group
        ${starred ? 'border-b-brand-200 bg-brand-50/30' : 'border-b-gray-100'}
        ${isSelected ? 'bg-green-50 border-l-[3px] border-l-brand-600' : 'hover:bg-[#F0F7F4] border-l-[3px] border-l-transparent'}`}
    >
      <div className="relative w-[152px] h-[112px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {photo ? (
          <Image src={photo} alt={property.publication_title || property.address} fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="152px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-300" /></div>
        )}
        {starred && (
          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400/90 text-gray-900 uppercase tracking-wide">
            Destacada
          </span>
        )}
        {operation && (
          <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide text-white
            ${operation === 'Venta' ? 'bg-gray-900/85' : 'bg-brand-600/85'}`}>{operation}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 overflow-hidden">
        <div>
          {property.type?.name && (
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-0.5 truncate">{translatePropertyType(property.type.name)}</p>
          )}
          <h3 className={`text-[13px] font-bold leading-tight line-clamp-2 mb-1 transition-colors ${isSelected ? 'text-brand-700' : 'text-gray-900 group-hover:text-brand-700'}`}>
            {property.publication_title || property.address}
          </h3>
          <div className="flex items-start gap-1 text-gray-400">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-brand-500" />
            <span className="text-[11px] line-clamp-1">{property.fake_address || property.address}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            {land ? (
              lot != null && lot > 0 && (
                <span className="flex items-center gap-0.5 text-gray-500"><Maximize2 className="w-3 h-3" /><span className="font-numeric">{lot}</span> m² lote</span>
              )
            ) : (
              <>
                {roofed != null && roofed > 0 && (
                  <span className="flex items-center gap-0.5 text-gray-500"><Home className="w-3 h-3" /><span className="font-numeric">{roofed}</span> cub.</span>
                )}
                {lot != null && lot > 0 && lot !== roofed && (
                  <span className="flex items-center gap-0.5 text-gray-500"><Maximize2 className="w-3 h-3" /><span className="font-numeric">{lot}</span> lote</span>
                )}
              </>
            )}
            {(property.suite_amount || property.room_amount) > 0 && (
              <span className="flex items-center gap-0.5 text-gray-500"><Bed className="w-3 h-3" /><span className="font-numeric">{property.suite_amount || property.room_amount}</span></span>
            )}
            {property.bathroom_amount > 0 && (
              <span className="flex items-center gap-0.5 text-gray-500"><Bath className="w-3 h-3" /><span className="font-numeric">{property.bathroom_amount}</span></span>
            )}
            <span className="font-bold text-gray-900 text-[12px] font-numeric">{price}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <ShareCardButton slug={slug} title={property.publication_title || property.address} price={price} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Expanded list card (Tokko-style, horizontal, full) ──────────────────────

function ListCard({ property, isSelected, onClick, featured }: {
  property: TokkoProperty; isSelected: boolean; onClick: () => void; featured?: boolean
}) {
  const photo = getMainPhoto(property)
  const operation = getOperationType(property)
  const price = formatPrice(property)
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const land = isLand(property)
  const slug = generatePropertySlug(property)
  const typeName = translatePropertyType(property.type?.name)
  const condition = translateCondition(property.property_condition)
  const desc = getDescription(property)
  const imgH = featured ? 'h-[220px]' : 'h-[160px]'

  return (
    <div
      onClick={onClick}
      className={`flex flex-col sm:flex-row rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group
        hover:shadow-md hover:-translate-y-0.5
        ${property.is_starred_on_web ? 'border-2 border-brand-500 shadow-md' : 'border border-gray-100 shadow-sm'}
        ${isSelected ? 'ring-2 ring-brand-500 shadow-md' : ''}
        ${featured ? 'sm:min-h-[220px]' : ''}`}
    >
      {/* Photo — left */}
      <div className={`relative w-full sm:w-[40%] ${imgH} sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden`}>
        {photo ? (
          <Image src={photo} alt={property.publication_title || property.address} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 40vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><MapPin className="w-12 h-12 text-gray-300" /></div>
        )}
        {operation && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide text-white
            ${operation === 'Venta' ? 'bg-gray-900/85' : 'bg-brand-600/85'}`}>{operation}</span>
        )}
        {property.is_starred_on_web && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded bg-amber-400/90 text-gray-900 uppercase tracking-wide">
            Destacada
          </span>
        )}
      </div>

      {/* Content — center */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
        {typeName && (
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">{typeName}</p>
        )}
        <h3 className={`font-bold leading-tight mb-1.5 transition-colors line-clamp-2
          ${featured ? 'text-base' : 'text-[14px]'}
          ${isSelected ? 'text-brand-700' : 'text-gray-900 group-hover:text-brand-700'}`}>
          {property.publication_title || property.address}
        </h3>
        <div className="flex items-center gap-1 text-brand-600 text-xs mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{property.fake_address || property.address}</span>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
          {land ? (
            lot != null && lot > 0 && (
              <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{lot}</span> m² lote</span>
            )
          ) : (
            <>
              {roofed != null && roofed > 0 && (
                <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{roofed}</span> m² cub.</span>
              )}
              {lot != null && lot > 0 && lot !== roofed && (
                <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{lot}</span> m² lote</span>
              )}
            </>
          )}
          {(property.suite_amount || property.room_amount) > 0 && (
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{property.suite_amount || property.room_amount}</span> dorm.</span>
          )}
          {property.bathroom_amount > 0 && (
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{property.bathroom_amount}</span></span>
          )}
          {property.parking_lot_amount > 0 && (
            <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /><span className="font-numeric font-semibold">{property.parking_lot_amount}</span></span>
          )}
        </div>

        {/* Short description */}
        {desc && (
          <p className="text-gray-400 text-xs line-clamp-2 mb-2 leading-relaxed">{desc}</p>
        )}

        {/* Condition badge */}
        {condition && (
          <span className="inline-block self-start px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-brand-50 text-brand-700 border border-brand-100">
            {condition}
          </span>
        )}

        <div className="mt-auto" />
      </div>

      {/* Price panel — right */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-3 bg-brand-600 px-4 sm:px-5 py-3 sm:py-5 sm:min-w-[140px] sm:rounded-r-xl">
        <div className="text-white font-numeric">
          <p className={`font-black leading-tight ${featured ? 'text-xl' : 'text-lg'}`}>{price}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/propiedades/${slug}`}
            onClick={e => e.stopPropagation()}
            className="px-3 py-1.5 bg-white text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-50 transition-colors"
          >
            Consultar
          </Link>
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <ShareCardButton slug={slug} title={property.publication_title || property.address} price={price} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PropiedadesView ──────────────────────────────────────────────────────────

export default function PropiedadesView({ properties }: { properties: TokkoProperty[] }) {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''

  const [filters, setFilters]           = useState<Filters>({ ...DEFAULTS, search: initialSearch })
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [flyToCenter, setFlyToCenter]   = useState<[number, number] | null>(null)
  const [mobileView, setMobileView]     = useState<'list' | 'map'>('list')
  const [listMode, setListMode]         = useState<ListMode>('compact')
  const [sortBy, setSortBy]             = useState<SortBy>('destacadas')
  const [sortOpen, setSortOpen]         = useState(false)
  const [mapBounds, setMapBounds]       = useState<{ south: number; north: number; west: number; east: number } | null>(null)
  const sortRef                         = useRef<HTMLDivElement>(null)
  const listRef                         = useRef<HTMLDivElement>(null)

  // Persist listMode preference
  useEffect(() => {
    const saved = localStorage.getItem('si-list-mode') as ListMode | null
    if (saved === 'compact' || saved === 'list' || saved === 'editorial') setListMode(saved)
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
    if (window.innerWidth < 768) {
      window.location.href = '/propiedades/' + generatePropertySlug(property)
    } else {
      setMobileView('map')
    }
  }, [])

  const opLabel = filters.operation === 'venta' ? 'en venta'
    : filters.operation === 'alquiler' ? 'en alquiler' : 'disponibles'

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden">

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 md:px-4 h-[52px] border-b border-gray-200 bg-white shadow-sm flex-shrink-0 overflow-x-auto scrollbar-none">
        <div className="relative min-w-[180px] max-w-[240px] flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Buscar barrio o dirección…" value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
        <FilterSelect value={filters.operation} onChange={v => set('operation', v)}
          options={[{value:'todos',label:'Operación'},{value:'venta',label:'Venta'},{value:'alquiler',label:'Alquiler'}]} />
        <FilterSelect value={filters.type} onChange={v => set('type', v)}
          options={[{value:'todos',label:'Tipología'},{value:'casa',label:'Casa'},{value:'departamento',label:'Departamento'},{value:'terreno',label:'Terreno'},{value:'local',label:'Local Comercial'}]} />
        <FilterSelect value={filters.beds} onChange={v => set('beds', v)}
          options={[{value:'todos',label:'Dormitorios'},{value:'1',label:'1 dorm.'},{value:'2',label:'2 dorm.'},{value:'3',label:'3 dorm.'},{value:'4+',label:'4+ dorm.'}]} />
        <FilterSelect value={filters.maxPrice} onChange={v => set('maxPrice', v)}
          options={[{value:'sin-limite',label:'Precio máx.'},{value:'50000',label:'hasta USD 50k'},{value:'100000',label:'hasta USD 100k'},{value:'200000',label:'hasta USD 200k'},{value:'500000',label:'hasta USD 500k'}]} />
        <FilterSelect value={filters.location} onChange={v => set('location', v)}
          options={[{value:'todos',label:'Ubicación'},{value:'roldan',label:'Roldán'},{value:'rosario',label:'Rosario'},{value:'funes',label:'Funes'}]} />
        {hasActive && (
          <>
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <button onClick={reset}
              className="flex items-center gap-1 text-[13px] font-semibold text-accent-400 hover:text-accent-500 transition-colors whitespace-nowrap flex-shrink-0">
              <X className="w-3.5 h-3.5" /> Borrar filtros
            </button>
          </>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Property list */}
        <div className={`flex flex-col border-r border-gray-200 w-full md:w-[40%] ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}>

          {/* Count header + sort + view toggle */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0 flex items-center justify-between gap-2">
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
              <button
                onClick={() => toggleListMode('editorial')}
                className={`p-1.5 rounded transition-colors ${listMode === 'editorial' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Vista editorial"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
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
            ) : listMode === 'editorial' ? (
              <div className="px-4 md:px-6 py-4 bg-white">
                {buildPropertyLayout(visibleProperties).map((block, i) =>
                  block.type === 'featured' ? (
                    <FeaturedPropertyEditorial key={`f-${block.property.id}`} property={block.property} />
                  ) : (
                    <div key={`g-${i}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 py-8">
                      {block.properties.map(p => (
                        <SimplePropertyCard key={p.id} property={p} />
                      ))}
                    </div>
                  )
                )}
              </div>
            ) : listMode === 'compact' ? (
              visibleProperties.map(p => (
                <CompactCard key={p.id} property={p} isSelected={p.id === selectedId} onClick={() => handleCardClick(p)} />
              ))
            ) : (
              <div className="p-3 space-y-4">
                {visibleProperties.map((p, i) => (
                  <ListCard key={p.id} property={p} isSelected={p.id === selectedId}
                    onClick={() => handleCardClick(p)} featured={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className={`relative w-full md:w-[60%] ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          <PropiedadesMap
            properties={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            flyToCenter={flyToCenter}
            onBoundsSearch={(bounds) => {
              setMapBounds({
                south: bounds.getSouth(),
                north: bounds.getNorth(),
                west: bounds.getWest(),
                east: bounds.getEast(),
              })
            }}
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
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]">
        <div className="bg-gray-900 rounded-full shadow-2xl overflow-hidden flex border border-gray-800">
          <button onClick={() => setMobileView('list')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors ${mobileView === 'list' ? 'bg-brand-600 text-white' : 'text-gray-300 hover:text-white'}`}>
            <List className="w-4 h-4" /> Lista
          </button>
          <button onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors ${mobileView === 'map' ? 'bg-brand-600 text-white' : 'text-gray-300 hover:text-white'}`}>
            <Map className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>
    </div>
  )
}
