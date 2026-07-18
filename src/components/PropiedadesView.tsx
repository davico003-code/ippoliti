'use client'

import dynamic from 'next/dynamic'
import PropertyPanel from './PropertyPanel'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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
  Check,
  ArrowUpDown,
  Locate,
  LocateFixed,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import PropiedadCardGrid from '@/components/PropiedadCardGrid'
import PropiedadesViewDesktopGridSkeleton from '@/components/PropiedadesViewDesktopGridSkeleton'
import MobileFilterSheet from '@/components/MobileFilterSheet'
import PropertyShareButton from '@/components/PropertyShareButton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { buscarZonas } from '@/lib/zonas'
import { highlightMatch } from '@/lib/highlight'
import { ZONAS, type Zona } from '@/lib/zonas'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  getOperationType,
  operationBadgeColor,
  getRoofedArea,
  getLotSurface,
  isLand,
  propertyTypeLabelById,
  generatePropertySlug,
  TYPE_FILTER_GROUPS,
} from '@/lib/tokko'
import { filterPropertiesByRadius, GEO_NEARBY_RADIUS_KM, distanceToProperty } from '@/lib/geo'
// Constantes del mapa desde @/lib/map-config (módulo sin leaflet): un import
// estático de PropiedadesMap acá anularía el dynamic() de abajo y metería
// leaflet en el First Load JS de /propiedades.
import { DEFAULT_CENTER as MAP_DEFAULT_CENTER, DEFAULT_ZOOM as MAP_DEFAULT_ZOOM, type FlyToTarget } from '@/lib/map-config'

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

// El grid desktop se importa lazy + ssr:false para no inflar el HTML inicial
// (en mobile representa ~50% del documento). En SSR se sirve el skeleton; el
// chunk real se descarga solo cuando el viewport >= md (gate por
// useMediaQuery), evitando que mobile baje JS que no va a usar.
const PropiedadesViewDesktopGrid = dynamic(
  () => import('./PropiedadesViewDesktopGrid'),
  { ssr: false, loading: () => <PropiedadesViewDesktopGridSkeleton /> }
)

// ─── Filter types ────────────────────────────────────────────────────────────

type Operation = 'todos' | 'venta' | 'alquiler'
// 'todos' o cualquier `value` de TYPE_FILTER_GROUPS (poblado dinámicamente
// según el inventario presente). String abierto porque las opciones se derivan
// del mapa de tipos por id en tokko.ts.
type PropType  = string
type Beds      = 'todos' | '1' | '2' | '3' | '4+'
type Currency  = 'USD' | 'ARS'
type Location  = 'todos' | 'roldan' | 'rosario' | 'funes'
type SortBy    = 'recientes' | 'precio-asc' | 'precio-desc' | 'superficie' | 'destacadas'
type OperationType = 'Sale' | 'Rent'
// listMode era un toggle huérfano (compact|list) que no afectaba el render de
// las cards; eliminado junto con su estado y los botones de la barra superior.

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'destacadas', label: 'Destacadas primero' },
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'superficie', label: 'Mayor superficie' },
]

interface Filters {
  search: string; operation: Operation; type: PropType
  beds: Beds; location: Location
  // Precio: strings de dígitos (sin separadores). Vacío = sin tope en ese extremo.
  priceMin: string; priceMax: string; currency: Currency
}

const DEFAULTS: Filters = {
  search: '', operation: 'todos', type: 'todos',
  beds: 'todos', location: 'todos',
  priceMin: '', priceMax: '', currency: 'USD',
}

function operationTypeForFilter(operation: Operation): OperationType | null {
  if (operation === 'venta') return 'Sale'
  if (operation === 'alquiler') return 'Rent'
  return null
}

function operationForView(property: TokkoProperty, operationType: OperationType | null) {
  if (!operationType) return property.operations?.[0] ?? null
  return property.operations?.find(operation => operation.operation_type === operationType) ?? null
}

/**
 * Las cards y el mapa leen la primera operación para decidir etiqueta y precio.
 * Al filtrar una propiedad mixta, priorizamos la operación elegida sin mutar la
 * ficha original ni descartar la otra operación.
 */
function prioritizeOperationForView(property: TokkoProperty, operationType: OperationType | null): TokkoProperty {
  if (!operationType || !property.operations?.length) return property
  const index = property.operations.findIndex(operation => operation.operation_type === operationType)
  if (index <= 0) return property
  const operations = property.operations.slice()
  const [selected] = operations.splice(index, 1)
  if (!selected) return property
  return { ...property, operations: [selected, ...operations] }
}

// Util: solo dígitos del input crudo (descarta puntos, comas, espacios).
const digitsOnly = (s: string) => s.replace(/\D/g, '')

// Decodifica el término `q` de la URL de forma tolerante. `searchParams.get()`
// ya decodifica una vez; pero si el link se compartió DOBLE-codificado (algunos
// clientes de WhatsApp / copiar-pegar re-encodean la URL → "San%2520Andrés"),
// tras ese decode todavía quedan secuencias %XX. Decodificamos hasta 2 veces
// más mientras siga pareciendo codificado, para que el link igual funcione.
function safeDecodeQuery(s: string): string {
  let v = s
  for (let i = 0; i < 2 && /%[0-9A-Fa-f]{2}/.test(v); i++) {
    try {
      const next = decodeURIComponent(v)
      if (next === v) break
      v = next
    } catch {
      break
    }
  }
  return v
}

// Lectura defensiva de sessionStorage. En Safari con "Bloquear todas las
// cookies", modo Lockdown o webviews in-app (Instagram/WhatsApp) con storage
// deshabilitado, CUALQUIER acceso a window.sessionStorage tira SecurityError.
// Sin esta guarda, el throw en pleno render (useState initializer) tumbaba
// toda /propiedades al error boundary ("Algo salió mal") en esos browsers.
const safeSessionGet = (key: string): string | null => {
  try { return sessionStorage.getItem(key) } catch { return null }
}

// Formato es-AR con separador de miles (120000 → "120.000"). Para vacío devuelve ''.
const formatThousands = (s: string) => {
  const d = digitsOnly(s)
  if (!d) return ''
  return new Intl.NumberFormat('es-AR').format(parseInt(d, 10))
}

// Compacta para label de UI: 120000 → "120K", 1500000 → "1.5M".
const compactPrice = (s: string) => {
  const d = digitsOnly(s)
  if (!d) return ''
  const n = parseInt(d, 10)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`.replace('.0', '')
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString('es-AR')
}

// ─── FilterSelect ────────────────────────────────────────────────────────────

// Dropdown custom (NO <select> nativo): en macOS el menú nativo se abre encima
// del trigger. Acá el panel se ancla SIEMPRE debajo del botón (top = rect.bottom)
// y se renderiza vía portal a document.body porque la filter bar tiene
// `overflow-x-auto` (→ overflow-y auto) que recortaría un panel absolute. Misma
// estrategia de posicionamiento que PriceFilterDropdown.
function FilterSelect<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void
}) {
  const active = value !== options[0].value
  const current = options.find(o => o.value === value) ?? options[0]
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const panelWidth = Math.max(rect.width, 176)
    const vw = window.innerWidth
    // No invadir la columna del mapa (desde el 48% en desktop): flip a la derecha.
    const availableRight = vw >= 768 ? vw * 0.48 - 8 : vw - 16
    let left = rect.left
    if (left + panelWidth > availableRight) left = Math.max(16, rect.right - panelWidth)
    setPos({ top: rect.bottom + 6, left, width: panelWidth })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (buttonRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={options[0].label}
        className="appearance-none h-10 rounded-xl pl-3.5 pr-8 cursor-pointer flex items-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all relative"
        style={{
          border: active || open ? '1.5px solid #1A5C38' : '1.5px solid #d1d5db',
          background: '#fff',
          color: active ? '#1A5C38' : '#0a0a0a',
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontWeight: active ? 600 : 500,
          fontSize: 14,
        }}
      >
        {current.label}
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform ${open ? 'rotate-180' : ''} ${active ? 'text-[#1A5C38]' : 'text-gray-400'}`} />
      </button>

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          className="fixed z-[9999] max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
        >
          {options.map(o => {
            const sel = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="flex w-full items-center justify-between gap-4 px-3.5 py-2 text-left whitespace-nowrap transition-colors hover:bg-gray-50"
                style={{
                  fontFamily: "'Raleway', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: sel ? 600 : 500,
                  color: sel ? '#1A5C38' : '#0a0a0a',
                }}
              >
                {o.label}
                {sel && <Check className="w-4 h-4 flex-shrink-0 text-[#1A5C38]" />}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

// ─── PriceFilterDropdown (desktop: dropdown con inputs min/max + moneda) ────
//
// El panel se renderiza vía portal a document.body porque el wrapper de la
// filter bar usa `overflow-x-auto` y CSS computa `overflow-y` como `auto`
// automáticamente, recortando el dropdown que sale hacia abajo del botón.

const PRICE_PRESETS: Record<Currency, { label: string; min: string; max: string }[]> = {
  USD: [
    { label: 'Hasta 100K',   min: '',       max: '100000' },
    { label: '100K - 250K',  min: '100000', max: '250000' },
    { label: '250K - 500K',  min: '250000', max: '500000' },
    { label: '500K+',        min: '500000', max: '' },
  ],
  ARS: [
    { label: 'Hasta 50M',    min: '',          max: '50000000' },
    { label: '50M - 150M',   min: '50000000',  max: '150000000' },
    { label: '150M - 300M',  min: '150000000', max: '300000000' },
    { label: '300M+',        min: '300000000', max: '' },
  ],
}

function PriceFilterDropdown({
  min, max, currency, onApply,
}: {
  min: string; max: string; currency: Currency
  onApply: (min: string, max: string, currency: Currency) => void
}) {
  const [open, setOpen] = useState(false)
  const [localMin, setLocalMin] = useState(min)
  const [localMax, setLocalMax] = useState(max)
  const [localCur, setLocalCur] = useState<Currency>(currency)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const active = !!min || !!max

  // Sincronizar locals con props commiteados (URL → estado y al cerrar/cancelar)
  useEffect(() => { setLocalMin(min); setLocalMax(max); setLocalCur(currency) }, [min, max, currency])

  const minN = localMin ? parseInt(localMin, 10) : 0
  const maxN = localMax ? parseInt(localMax, 10) : Number.POSITIVE_INFINITY
  const invalid = !!localMin && !!localMax && minN > maxN

  const apply = useCallback(() => {
    if (invalid) return
    onApply(localMin, localMax, localCur)
    setOpen(false)
  }, [invalid, localMin, localMax, localCur, onApply])

  const clear = useCallback(() => {
    setLocalMin(''); setLocalMax('')
    onApply('', '', localCur)
    setOpen(false)
  }, [localCur, onApply])

  // Cambiar moneda resetea los rangos (USD y ARS no son comparables sin TC).
  const onCurrencyChange = (c: Currency) => {
    setLocalCur(c)
    setLocalMin('')
    setLocalMax('')
  }

  const onPresetClick = (preset: { min: string; max: string }) => {
    setLocalMin(preset.min)
    setLocalMax(preset.max)
  }

  // Posicionamiento del panel: por defecto alineado al borde izquierdo del botón.
  // Si invadiría visualmente el mapa (columna derecha del listado, desde el 48% del
  // viewport en desktop), se "flipea" para alinearse al borde derecho del botón.
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownWidth = 320
    const vw = window.innerWidth
    const availableRight = vw >= 768 ? vw * 0.48 - 8 : vw - 16
    let left = rect.left
    if (left + dropdownWidth > availableRight) {
      left = Math.max(16, rect.right - dropdownWidth)
    }
    setPos({ top: rect.bottom + 4, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  // Click fuera cierra y descarta cambios pendientes (revierte a props commiteados).
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (buttonRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setLocalMin(min); setLocalMax(max); setLocalCur(currency)
      setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, min, max, currency])

  // Esc cierra
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLocalMin(min); setLocalMax(max); setLocalCur(currency)
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, min, max, currency])

  const label = !active ? 'Precio'
    : !min ? `Precio: hasta ${currency} ${compactPrice(max)}`
    : !max ? `Precio: desde ${currency} ${compactPrice(min)}`
    : `Precio: ${currency} ${compactPrice(min)} - ${compactPrice(max)}`

  const presets = PRICE_PRESETS[localCur]

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Filtro de precio"
        aria-expanded={open}
        className="appearance-none h-10 rounded-xl pl-3.5 pr-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all flex items-center gap-1 flex-shrink-0"
        style={{
          border: open || active ? '1.5px solid #1A5C38' : '1.5px solid #d1d5db',
          background: '#fff',
          color: open || active ? '#1A5C38' : '#0a0a0a',
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontWeight: open || active ? 600 : 500,
          fontSize: 14,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <ChevronDown className={`w-4 h-4 ${open || active ? 'text-[#1A5C38]' : 'text-gray-400'} ${open ? 'rotate-180' : ''} transition-transform`} />
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-xl shadow-lg border border-gray-100 p-4"
          style={{
            top: pos.top,
            left: pos.left,
            width: 320,
            backgroundColor: '#fff',
            isolation: 'isolate',
          }}
          role="dialog"
          aria-label="Filtro de precio"
        >
          {/* Selector de moneda (USD/ARS) — joined pill toggle */}
          <div className="flex mb-3">
            {(['USD', 'ARS'] as const).map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={`flex-1 h-9 transition-colors ${i === 0 ? 'rounded-l-md' : 'rounded-r-md'}`}
                style={{
                  background: localCur === c ? '#1A5C38' : '#f3f4f6',
                  color: localCur === c ? '#fff' : '#374151',
                  fontFamily: "'Raleway', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: localCur === c ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Inputs min/max */}
          <div className="flex w-full items-center gap-2 mb-3">
            <input
              type="text"
              inputMode="numeric"
              placeholder={`Desde ${localCur}`}
              aria-label="Precio mínimo"
              value={formatThousands(localMin)}
              onChange={e => setLocalMin(digitsOnly(e.target.value))}
              onKeyDown={e => { if (e.key === 'Enter') apply() }}
              className="flex-1 min-w-0 h-10 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              style={{
                border: invalid ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                fontFamily: "'Raleway', system-ui, sans-serif",
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            <span className="shrink-0 mx-0.5 text-gray-400">—</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`Hasta ${localCur}`}
              aria-label="Precio máximo"
              value={formatThousands(localMax)}
              onChange={e => setLocalMax(digitsOnly(e.target.value))}
              onKeyDown={e => { if (e.key === 'Enter') apply() }}
              className="flex-1 min-w-0 h-10 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              style={{
                border: invalid ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
                fontFamily: "'Raleway', system-ui, sans-serif",
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {invalid && (
            <p className="text-[12px] text-red-600 mb-2" style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}>
              El mínimo no puede ser mayor al máximo
            </p>
          )}

          {/* Atajos rápidos */}
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2"
               style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}>
              Rangos sugeridos
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onPresetClick(p)}
                  className="h-8 px-2 rounded-md border border-gray-200 hover:border-[#1A5C38] hover:text-[#1A5C38] transition-colors"
                  style={{
                    fontFamily: "'Raleway', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#374151',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botones inferiores */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={clear}
              disabled={!active && !localMin && !localMax}
              className="flex-1 h-9 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              style={{
                fontFamily: "'Raleway', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={invalid}
              className="flex-1 h-9 rounded-lg text-white transition-colors"
              style={{
                background: invalid ? '#9ca3af' : '#1A5C38',
                fontFamily: "'Raleway', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: invalid ? 'not-allowed' : 'pointer',
              }}
            >
              Aplicar
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
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
  const pathname = usePathname()
  const initialSearch = safeDecodeQuery(searchParams.get('q') ?? '')

  // Construye el set COMPLETO de filtros desde la URL. Única fuente de verdad
  // para el estado inicial y para re-sincronizar ante navegación externa
  // (Navbar, back/forward) o apertura de un link compartido. Todos los filtros
  // viajan en la query → la búsqueda es 100% compartible.
  const parseFilters = useCallback((): Filters => {
    const op = (searchParams.get('operacion') ?? searchParams.get('op') ?? '').toLowerCase()
    const beds = searchParams.get('dormitorios') ?? ''
    // Alias legacy de links internos (footer/landings): location→ubicacion,
    // type→tipo, search→q. El effect estado→URL luego reescribe al canónico.
    const loc = (searchParams.get('ubicacion') ?? searchParams.get('location') ?? '').toLowerCase()
    const moneda = (searchParams.get('moneda') ?? '').toUpperCase()
    return {
      ...DEFAULTS,
      search: safeDecodeQuery(searchParams.get('q') ?? searchParams.get('search') ?? ''),
      operation: op === 'venta' || op === 'alquiler' ? (op as Operation) : 'todos',
      type: searchParams.get('tipo') || searchParams.get('type') || 'todos',
      beds: (['1', '2', '3', '4+'].includes(beds) ? beds : 'todos') as Beds,
      location: (['roldan', 'rosario', 'funes'].includes(loc) ? loc : 'todos') as Location,
      priceMin: digitsOnly(searchParams.get('precio_min') ?? ''),
      priceMax: digitsOnly(searchParams.get('precio_max') ?? ''),
      currency: moneda === 'ARS' ? 'ARS' : 'USD',
    }
  }, [searchParams])

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

  const [filters, setFilters]           = useState<Filters>(parseFilters)
  // True cuando el cambio de URL fue iniciado por esta UI (sync estado→URL).
  // Sirve para que el effect URL→estado no resetee en el viaje de vuelta.
  const internalUrlSyncRef = useRef(false)

  // URL → estado: ante cualquier cambio de URL NO originado por esta UI
  // (Navbar "Comprar"/"Alquilar", back/forward, o un link compartido), se
  // re-derivan TODOS los filtros desde la query. Como la URL lleva todo, abrir
  // un link compartido reconstruye exactamente la misma búsqueda.
  useEffect(() => {
    if (internalUrlSyncRef.current) {
      internalUrlSyncRef.current = false
      return
    }
    setFilters(parseFilters())
  }, [searchParams, parseFilters])

  // Estado → URL: refleja TODOS los filtros activos en la query (compartible).
  // Debounced para no spamear el historial mientras se tipea en el buscador.
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.delete('op')
    // Migrar alias legacy al canónico: limpiarlos para no duplicar en la URL.
    params.delete('type'); params.delete('location'); params.delete('search')
    const put = (k: string, v: string) => { if (v) params.set(k, v); else params.delete(k) }
    put('q', filters.search.trim())
    put('operacion', filters.operation !== 'todos' ? filters.operation : '')
    put('tipo', filters.type && filters.type !== 'todos' ? filters.type : '')
    put('dormitorios', filters.beds !== 'todos' ? filters.beds : '')
    put('ubicacion', filters.location !== 'todos' ? filters.location : '')
    put('precio_min', filters.priceMin)
    put('precio_max', filters.priceMax)
    put('moneda', (filters.priceMin || filters.priceMax) ? filters.currency : '')
    const qs = params.toString()
    if (qs === searchParams.toString()) return
    const t = setTimeout(() => {
      internalUrlSyncRef.current = true
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 250)
    return () => clearTimeout(t)
  }, [filters, pathname, router, searchParams])
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [hoveredId, setHoveredId]       = useState<number | null>(null)
  const [flyToCenter, setFlyToCenter]   = useState<FlyToTarget | null>(null)
  // Vista mobile (toggle Lista↔Mapa). En desktop ambos paneles son visibles
  // siempre, así que esta variable solo afecta a <md.
  // Default: 'list'. En teléfono la persona necesita ver fotos/precios rápido;
  // el mapa queda a un toque sin descargar Leaflet como primera experiencia.
  // Si el usuario togglea manualmente, su preferencia queda
  // en sessionStorage `si_view_preference` y gana sobre el default automático
  // de búsquedas específicas.
  // IMPORTANTE: el valor inicial debe ser server-estable ('list' en SSR) para
  // no generar hydration mismatch.
  // Valor inicial SERVER-ESTABLE ('list'): leer sessionStorage en el initializer
  // hacía que la primera render del cliente ('map' si el usuario lo prefería) no
  // coincidiera con el SSR ('list') → hydration mismatch. La preferencia se
  // aplica en un effect post-montaje (abajo).
  const [mobileView, setMobileView]     = useState<'list' | 'map'>('list')
  useEffect(() => {
    const pref = safeSessionGet('si_view_preference')
    if (pref === 'list' || pref === 'map') setMobileView(pref)
  }, [])
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [sortBy, setSortBy]             = useState<SortBy>('destacadas')
  const [sortOpen, setSortOpen]         = useState(false)
  const [mapBounds, setMapBounds]       = useState<{ south: number; north: number; west: number; east: number } | null>(null)
  // Modo "cercanía": cuando el usuario clickea Centrar y damos OK al permiso
  // de geolocalización, guardamos el origen acá. El listado y el mapa pasan a
  // mostrar SOLO propiedades dentro de GEO_NEARBY_RADIUS_KM (5 km por default).
  // El chip flotante permite cerrar el modo y volver al estado anterior.
  const [nearbyOrigin, setNearbyOrigin] = useState<{ lat: number; lng: number } | null>(null)
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


  // Safari iOS fix: forzar reflow del mapa cuando se vuelve a mostrar.
  // (Antes este effect también persistía mobileView a sessionStorage. Ahora
  // la persistencia es explícita en setViewManually para no contaminar el
  // sessionStorage con cambios automáticos del default por búsqueda.)
  useEffect(() => {
    if (mobileView === 'map') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    }
  }, [mobileView])

  // Helper para cambios DE USUARIO. Persiste la preferencia para que las
  // búsquedas siguientes en la sesión la respeten sobre el default automático.
  const setViewManually = useCallback((view: 'list' | 'map') => {
    setMobileView(view)
    try { sessionStorage.setItem('si_view_preference', view) } catch { /* ignore */ }
  }, [])

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

  const set = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters(prev => ({ ...prev, [k]: v }))
    // Si el usuario aplica un filtro de Ubicación específica, cancelamos el
    // modo "cercanía": no tiene sentido tener "1 km a la redonda" + "Roldán".
    if (k === 'location' && v !== 'todos') {
      setNearbyOrigin(null)
    }
  }, [])

  const reset = useCallback(() => {
    setFilters(DEFAULTS)
    setNearbyOrigin(null)
    // La URL se limpia sola vía el effect estado→URL (DEFAULTS = sin params).
  }, [])

  // Cambia el filtro de operación y refleja el cambio en la URL para que sea
  // compartible (`?operacion=venta|alquiler`). Preserva el resto de los query
  // params actuales y normaliza el legacy `?op=` al canónico `?operacion=`.
  // Marca el sync como "interno" para que el effect URL→estado no resetee
  // beds/type/location/precios cuando el cambio salió de esta UI.
  const updateOperation = useCallback((v: Operation) => {
    setFilters(prev => ({ ...prev, operation: v }))
    // La URL refleja el cambio vía el effect estado→URL.
  }, [])

  // Aplica un rango de precio + moneda al estado y URL en una sola operación.
  // `min`/`max` ya vienen sanitizados (solo dígitos). Vacío = sin tope ese extremo.
  // Si min > max, NO commitea (la UI marca el error con el flag `priceError`).
  const updatePrice = useCallback((min: string, max: string, currency: Currency) => {
    setFilters(prev => ({ ...prev, priceMin: min, priceMax: max, currency }))
    // La URL (precio_min/precio_max/moneda) se refleja vía el effect estado→URL.
  }, [])

  // "Mi ubicación actual": activa el modo cercanía (filtro 1 km) y centra el
  // mapa. NO hace reverse geocoding ni escribe el nombre del barrio en el
  // input — eso aplicaba un segundo filtro de texto que limitaba la búsqueda
  // y se mezclaba con el filtro de proximidad. Solo proximidad: 1 km a la
  // redonda + el resto de los filtros activos del usuario (operación,
  // tipología, dormitorios, precio) se respetan.
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización')
      return
    }
    setLocatingUser(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Limpiar el input de búsqueda y cualquier filtro de zona específica.
        // El modo cercanía es excluyente con los filtros de texto/zona.
        setFilters(prev => ({ ...prev, search: '', location: 'todos' }))
        setNearbyOrigin({ lat: latitude, lng: longitude })
        setMapBounds(null)
        setFlyToCenter([latitude, longitude, 14])
        setViewManually('map')
        setSearchSuggestions(false)
        setSearchDropdownDesktop(false)
        setLocatingUser(false)
      },
      (err) => {
        setLocatingUser(false)
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Necesitamos acceso a tu ubicación para encontrar propiedades cerca tuyo.'
          : 'No se pudo obtener tu ubicación'
        setLocationError(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [setViewManually])

  const hasActive = (Object.keys(DEFAULTS) as (keyof Filters)[])
    .some(k => filters[k] !== DEFAULTS[k])

  // Opciones de tipología: solo los grupos con al menos un id presente en el
  // inventario cargado, con sus labels en español (mismo mapa por id que el
  // filtrado y el de las cards). Evita ofrecer tipos que SI no tiene.
  const typeOptions = useMemo(() => {
    const present = new Set<number>()
    for (const p of properties) {
      if (p.type?.id != null) present.add(p.type.id)
    }
    return [
      { value: 'todos', label: 'Tipología' },
      ...TYPE_FILTER_GROUPS
        .filter(g => g.ids.some(id => present.has(id)))
        .map(g => ({ value: g.value, label: g.label })),
    ]
  }, [properties])

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

  const selectedOperationType = operationTypeForFilter(filters.operation)
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
    if (selectedOperationType && !p.operations?.some(operation => operation.operation_type === selectedOperationType)) {
      return false
    }
    if (filters.type !== 'todos') {
      // Match por id exacto contra el grupo del filtro (sin substring de nombre:
      // "warehouse" contiene "house" y arrastraba galpones bajo "Casa").
      const grp = TYPE_FILTER_GROUPS.find(g => g.value === filters.type)
      if (!grp || !grp.ids.includes(p.type?.id ?? -1)) return false
    }
    if (filters.beds !== 'todos') {
      const rooms = p.suite_amount || p.room_amount || 0
      if (filters.beds === '4+' && rooms < 4) return false
      if (filters.beds !== '4+' && rooms !== parseInt(filters.beds)) return false
    }
    // Filtro de precio: cohorte por moneda. Si el usuario fija algún tope,
    // solo se evalúan propiedades publicadas en esa moneda; las demás se
    // descartan (decisión explícita: comparar USD vs ARS sin conversión sería
    // engañoso porque dependería de un tipo de cambio que no manejamos).
    if (filters.priceMin || filters.priceMax) {
      const minNum = filters.priceMin ? parseInt(filters.priceMin, 10) : 0
      const maxNum = filters.priceMax ? parseInt(filters.priceMax, 10) : Number.POSITIVE_INFINITY
      // Buscar el precio de la operación activa y la moneda seleccionada.
      const matchingPrice = operationForView(p, selectedOperationType)?.prices?.find(pr => pr.currency === filters.currency)
      if (!matchingPrice) return false
      if (matchingPrice.price < minNum || matchingPrice.price > maxNum) return false
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
        const pa = operationForView(a, selectedOperationType)?.prices?.[0]?.price ?? Infinity
        const pb = operationForView(b, selectedOperationType)?.prices?.[0]?.price ?? Infinity
        return pa - pb
      }
      case 'precio-desc': {
        const pa = operationForView(a, selectedOperationType)?.prices?.[0]?.price ?? 0
        const pb = operationForView(b, selectedOperationType)?.prices?.[0]?.price ?? 0
        return pb - pa
      }
      case 'superficie': {
        const sa = parseFloat(a.total_surface) || parseFloat(a.roofed_surface) || 0
        const sb = parseFloat(b.total_surface) || parseFloat(b.roofed_surface) || 0
        return sb - sa
      }
      case 'recientes':
        // El feed no expone fecha de alta; el ID de Tokko es incremental,
        // así que ID más alto ≈ cargada más recientemente.
        return (Number(b.id) || 0) - (Number(a.id) || 0)
      default:
        return 0
    }
  }).map(property => prioritizeOperationForView(property, selectedOperationType)), [
    properties,
    filters,
    sortBy,
    resolvedNeighborhoods,
    selectedOperationType,
  ])

  // Lista para el mapa: aplica filtros + cercanía. NO aplica mapBounds porque
  // el bounds se calcula desde el viewport y filtrar por bounds antes de
  // pintar generaría un loop visual.
  //
  // Cuando hay nearbyOrigin, además ORDENA por distancia ascendente (más
  // cercanas primero), independiente del sortBy del dropdown — tiene sentido
  // que "buscar cerca" priorice cercanía por encima de destacadas/precio.
  const propertiesForMap = useMemo(() => {
    if (!nearbyOrigin) return filtered
    const within = filterPropertiesByRadius(filtered, nearbyOrigin.lat, nearbyOrigin.lng)
    return within.slice().sort((a, b) => {
      const da = distanceToProperty(a, nearbyOrigin.lat, nearbyOrigin.lng) ?? Infinity
      const db = distanceToProperty(b, nearbyOrigin.lat, nearbyOrigin.lng) ?? Infinity
      return da - db
    })
  }, [filtered, nearbyOrigin])

  // Lista para el listado lateral: cercanía + bounds.
  const visibleProperties = useMemo(() => {
    let list = propertiesForMap
    if (mapBounds) {
      list = list.filter(p => {
        if (!p.geo_lat || !p.geo_long) return true
        const lat = parseFloat(p.geo_lat)
        const lng = parseFloat(p.geo_long)
        return lat >= mapBounds.south && lat <= mapBounds.north && lng >= mapBounds.west && lng <= mapBounds.east
      })
    }
    return list
  }, [propertiesForMap, mapBounds])

  // Callback del botón "Centrar" del mapa: setea origen + limpia bounds para
  // que el filtro de radio sea el único activo (sino se acumulan).
  const handleNearbyOrigin = useCallback((lat: number, lng: number) => {
    setNearbyOrigin({ lat, lng })
    setMapBounds(null)
  }, [])

  // Al cerrar el chip "menos de 1 km", limpiamos el filtro Y mandamos al mapa
  // de vuelta al encuadre inicial (Funes/Roldán/Fisherton). Sino el mapa se
  // queda donde lo dejó el flyTo de la geolocalización del usuario.
  const clearNearby = useCallback(() => {
    setNearbyOrigin(null)
    setFlyToCenter([MAP_DEFAULT_CENTER[0], MAP_DEFAULT_CENTER[1], MAP_DEFAULT_ZOOM])
  }, [])

  // Geolocalización + filtro a 5km. Disparado desde el icono LocateFixed del
  // input desktop. A diferencia de useMyLocation (que hace reverse geocode y
  // setea el texto del search), este callback aplica el filtro de proximidad
  // (mismo modo que el chip flotante "Mostrando propiedades a menos de 5 km").
  const useMyNearbyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización')
      return
    }
    setLocatingUser(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setNearbyOrigin({ lat: latitude, lng: longitude })
        setMapBounds(null)
        setFlyToCenter([latitude, longitude])
        setViewManually('map')
        setLocatingUser(false)
      },
      () => {
        setLocatingUser(false)
        setLocationError('No pudimos acceder a tu ubicación. Verificá los permisos del navegador.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [setViewManually])

  // Panel auto-open ONLY in desktop. En mobile la ficha se renderiza directo
  // como página completa en [slug]/page.tsx mobile block — abrir el panel acá
  // lockearía el body scroll aunque el panel esté display:none (el useEffect
  // corre igual en React) y mataría el scroll mobile de la ficha.
  const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  // Reactivo para gate del DesktopGrid lazy. En SSR y primer paint client
  // devuelve false, evitando que mobile descargue/monte el chunk del grid.
  const isDesktopViewport = useMediaQuery('(min-width: 768px)')
  const shouldRenderMap = isDesktopViewport || mobileView === 'map'
  const [panelPropertyId, setPanelPropertyId] = useState<number | null>(null)

  useEffect(() => {
    if (initialPropertyId == null) return
    if (!isDesktop()) return
    setPanelPropertyId(initialPropertyId)
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
    !!filters.priceMin || !!filters.priceMax,
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
            onClick={() => mobileView === 'map' ? setViewManually('list') : window.history.back()}
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
                onClick={() => updateOperation(filters.operation === op ? 'todos' : op)}
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
            className="w-full h-10 pl-8 pr-9 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 transition-all placeholder:text-gray-400"
            style={{ border: '1.5px solid #d1d5db', fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 14 }}
          />
          <button
            type="button"
            onClick={useMyNearbyLocation}
            disabled={locatingUser}
            aria-label="Usar mi ubicación actual"
            title="Usar mi ubicación"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-[#1A5C38] hover:bg-gray-100 transition-colors disabled:cursor-wait"
          >
            {locatingUser ? (
              <div className="w-3.5 h-3.5 border-2 border-[#1A5C38]/30 border-t-[#1A5C38] rounded-full animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </button>
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
        <FilterSelect value={filters.operation} onChange={updateOperation}
          options={[{value:'todos',label:'Operación'},{value:'venta',label:'Venta'},{value:'alquiler',label:'Alquiler'}]} />
        <FilterSelect value={filters.type} onChange={v => set('type', v)}
          options={typeOptions} />
        <FilterSelect value={filters.beds} onChange={v => set('beds', v)}
          options={[{value:'todos',label:'Dormitorios'},{value:'1',label:'1 dorm.'},{value:'2',label:'2 dorm.'},{value:'3',label:'3 dorm.'},{value:'4+',label:'4+ dorm.'}]} />
        <PriceFilterDropdown
          min={filters.priceMin}
          max={filters.priceMax}
          currency={filters.currency}
          onApply={updatePrice}
        />
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
        onPriceChange={updatePrice}
        onReset={() => { reset(); setMobileFiltersOpen(false) }}
        resultCount={visibleProperties.length}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Property list */}
        <div className={`flex flex-col border-r border-gray-200 w-full md:w-[48%] ${mobileView === 'map' ? 'hidden md:flex' : 'flex'}`}>

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

          </div>

          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {visibleProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-8 py-12">
                <SlidersHorizontal className="w-9 h-9 text-gray-200 mb-3" />
                {nearbyOrigin ? (
                  <>
                    <p className="text-gray-700 font-semibold text-sm mb-1">
                      No hay propiedades a {GEO_NEARBY_RADIUS_KM} km de tu ubicación.
                    </p>
                    <p className="text-gray-400 text-xs mb-4 max-w-[260px]">
                      Probá ampliar la búsqueda o navegá el mapa.
                    </p>
                    <button
                      onClick={clearNearby}
                      className="bg-[#1A5C38] hover:bg-[#145030] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mb-2"
                    >
                      Ver todas las propiedades
                    </button>
                  </>
                ) : (filters.priceMin || filters.priceMax) ? (
                  <>
                    <p className="text-gray-500 font-semibold text-sm mb-1">Sin resultados</p>
                    <p className="text-gray-400 text-xs mb-4 max-w-[260px]">
                      No encontramos propiedades en {filters.currency} en ese rango. Probá cambiar la moneda o ampliar el rango.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 font-semibold text-sm mb-1">Sin resultados</p>
                    <p className="text-gray-400 text-xs mb-4">Probá con otros filtros</p>
                  </>
                )}
                <button onClick={() => { reset(); setMapBounds(null); clearNearby() }} className="text-accent-400 text-sm font-semibold hover:text-accent-500 transition-colors">
                  Borrar filtros
                </button>
              </div>
            ) : (
              <>
                {/* Desktop grid — lazy + gate por viewport.
                    Mobile NO descarga el chunk: isDesktopViewport=false en
                    SSR y en primer paint mobile. Desktop ve el skeleton
                    durante hidratación + descarga del chunk, luego el grid
                    real. El skeleton replica grid-cols/gap/aspect-ratio
                    para no causar CLS al swap. */}
                <div className="hidden md:block">
                  {isDesktopViewport ? (
                    <PropiedadesViewDesktopGrid
                      properties={visibleProperties}
                      selectedId={selectedId}
                      onHover={setHoveredId}
                      onCardClick={handleCardClick}
                      nearbyOrigin={nearbyOrigin}
                    />
                  ) : (
                    <PropiedadesViewDesktopGridSkeleton />
                  )}
                </div>
                {/* Mobile list */}
                <div className="md:hidden px-4 pt-3 pb-[100px] space-y-3">
                  {visibleProperties.map((p, i) => (
                    <div key={p.id} data-property-id={p.id}>
                      {/* Mobile: el Link navega solo, sin onClick. El prefetch
                          ocurre cuando la card entra al viewport. */}
                      <PropiedadCardGrid
                        property={p}
                        isSelected={p.id === selectedId}
                        variant="mobile"
                        priority={i < 2}
                        distanceKm={nearbyOrigin ? distanceToProperty(p, nearbyOrigin.lat, nearbyOrigin.lng) : null}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className={`relative w-full md:w-[52%] ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          {shouldRenderMap && (
            <PropiedadesMap
              properties={propertiesForMap}
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
              onNearbyOrigin={handleNearbyOrigin}
              nearbyActive={nearbyOrigin != null}
            />
          )}
          {/* Chip "modo cercanía" — cerrable, sobre el mapa, no tapa el contador. */}
          {nearbyOrigin && (
            <div
              className="absolute z-[1000] flex items-center gap-2 bg-[#1A5C38] text-white shadow-lg"
              style={{
                top: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 12px 8px 14px',
                borderRadius: 999,
                fontFamily: "'Raleway', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                maxWidth: 'calc(100% - 24px)',
              }}
            >
              <Locate className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                Mostrando propiedades a menos de <span style={{ fontVariantNumeric: 'tabular-nums' }}>{GEO_NEARBY_RADIUS_KM}</span> km de tu ubicación
              </span>
              <button
                onClick={clearNearby}
                aria-label="Quitar filtro por cercanía"
                className="flex-shrink-0 ml-1 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
          onClick={() => setViewManually(mobileView === 'list' ? 'map' : 'list')}
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
          <Link
            href={`/propiedades/${generatePropertySlug(selectedProperty)}`}
            className="relative block bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {/* Photo — 16:9 (más bajo y compacto) */}
            <div className="relative w-full aspect-[16/9] bg-gray-100">
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
                      background: operationBadgeColor(op),
                      color: '#fff', fontFamily: "'Raleway', system-ui, sans-serif",
                      fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
                      padding: '5px 10px', borderRadius: 6,
                    }}>
                    {op}
                  </span>
                ) : null
              })()}
              {/* Close button — stopPropagation para no navegar al Link padre */}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); closeBottomSheet() }}
                aria-label="Cerrar"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
              {/* Share button — al lado del X */}
              <PropertyShareButton
                propertyId={selectedProperty.id}
                slug={generatePropertySlug(selectedProperty)}
                title={selectedProperty.publication_title || selectedProperty.address || ''}
                priceLabel={formatPrice(selectedProperty)}
                top={10}
                right={48}
                size={32}
              />
            </div>

            {/* Body — tap en cualquier parte abre la ficha completa */}
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
                {propertyTypeLabelById(selectedProperty.type?.id)}{selectedProperty.type?.name && (selectedProperty.fake_address || selectedProperty.address) ? ' · ' : ''}{selectedProperty.fake_address || selectedProperty.address}
              </p>
              <p style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedProperty.location?.short_location || selectedProperty.location?.name || ''}
              </p>
            </div>
          </Link>
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
