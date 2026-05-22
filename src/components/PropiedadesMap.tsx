/* eslint-disable @next/next/no-img-element */
'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  translatePropertyType,
  getTotalSurface,
  generatePropertySlug,
} from '@/lib/tokko'
import type { Zona } from '@/lib/zonas' // used for ZonaFlyTo
import PropertyShareButton from './PropertyShareButton'

// ─── Development grouping ─────────────────────────────────────────────────────

interface DevGroup {
  devId: number
  devName: string
  units: TokkoProperty[]
  lat: number
  lng: number
  minPrice: string
  dormRange: string
  slug: string
}

function groupByDevelopment(properties: TokkoProperty[]): { standalone: TokkoProperty[]; devGroups: DevGroup[] } {
  const devMap = new Map<number, TokkoProperty[]>()
  const standalone: TokkoProperty[] = []

  for (const p of properties) {
    if (p.development?.id) {
      const existing = devMap.get(p.development.id) || []
      existing.push(p)
      devMap.set(p.development.id, existing)
    } else {
      standalone.push(p)
    }
  }

  const devGroups: DevGroup[] = []
  devMap.forEach((units, devId) => {
    const first = units.find(u => u.geo_lat && u.geo_long && !isNaN(parseFloat(u.geo_lat!)))
    if (!first) { standalone.push(...units); return }

    // Min price
    const prices = units
      .map(u => u.operations?.[0]?.prices?.[0]?.price)
      .filter((p): p is number => !!p && p > 0)
      .sort((a, b) => a - b)
    const currency = units[0]?.operations?.[0]?.prices?.[0]?.currency || 'USD'
    const minPrice = prices.length > 0
      ? `${currency === 'USD' ? 'U$S' : '$'} ${prices[0] >= 1000 ? Math.round(prices[0] / 1000) + 'K' : prices[0].toLocaleString('es-AR')}`
      : 'Consultar'

    // Dorm range
    const dorms = units.map(u => u.suite_amount || u.room_amount || 0).filter(d => d > 0).sort((a, b) => a - b)
    const uniqueDorms = Array.from(new Set(dorms))
    const dormRange = uniqueDorms.length === 0 ? '' :
      uniqueDorms.length === 1 ? `${uniqueDorms[0]} dorm.` :
      `${uniqueDorms[0]} a ${uniqueDorms[uniqueDorms.length - 1]} dorm.`

    // Slug
    const devName = first.development?.name || `Emprendimiento ${devId}`
    const slugBase = devName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    const slug = `${devId}-${slugBase}`

    devGroups.push({
      devId,
      devName,
      units,
      lat: parseFloat(first.geo_lat!),
      lng: parseFloat(first.geo_long!),
      minPrice,
      dormRange,
      slug,
    })
  })

  return { standalone, devGroups }
}

// ─── Short price label for map bubbles ────────────────────────────────────────
//
// Spec /propiedades (Zillow-style pins):
//   < 1.000.000 USD   → "U$S 999K" (redondeo a miles, sin decimales)
//   1.000.000 - 9.999.999 USD → "U$S 1.15M" (2 decimales hasta 1, 1 decimal acá)
//                      → spec dice 1 decimal, ej "U$S 1.15M" parece typo del
//                        usuario; voy con 1 decimal (ej "U$S 1.1M"). Para 1.15M
//                        muestra "U$S 1.2M" (redondeo).
//   >= 10.000.000 USD → "U$S 12M" (sin decimales)
//   ARS o sin precio público → "Consultar"

export function formatPriceCompact(property: TokkoProperty): string {
  const op = property.operations?.[0]
  if (!op?.prices?.[0]) return 'Consultar'
  const p = op.prices[0]
  if (!p.price || p.price === 0) return 'Consultar'
  // ARS → Consultar (spec: pin no expone precio en ARS por estabilidad cambiaria)
  if (p.currency !== 'USD') return 'Consultar'

  if (p.price >= 10_000_000) {
    return `U$S ${Math.round(p.price / 1_000_000)}M`
  }
  if (p.price >= 1_000_000) {
    const m = (p.price / 1_000_000).toFixed(1).replace('.0', '')
    return `U$S ${m}M`
  }
  if (p.price >= 1_000) {
    return `U$S ${Math.round(p.price / 1_000)}K`
  }
  return `U$S ${p.price.toLocaleString('es-AR')}`
}

// ─── Price bubble DivIcon ─────────────────────────────────────────────────────
//
// Estilo Zillow: pill rectangular con triangulito hacia abajo, precio adentro.
//   Default → bg verde brand, texto blanco
//   Hover (sync con card o mouse en pin) → bg #0F2419, scale 1.05, transition 150ms (CSS)
//   Selected (click o sync con card) → bg blanco, texto verde, border 2px verde
//   "kind" controla la paleta: 'property' (verde brand) vs 'dev' (dorado).
//
// El bounce sync con card lo aplica una clase CSS inyectada por MapStyles,
// que se monta cuando hoveredId === id. No hace falta hacer nada acá.

type PinKind = 'property' | 'dev'

function createPriceBubble(label: string, selected: boolean, hovered: boolean, kind: PinKind = 'property') {
  // Colores por kind
  const baseBg     = kind === 'dev' ? '#D4A24C' : '#1A5C38'
  const hoverBg    = kind === 'dev' ? '#9C7935' : '#0F2419'
  const accentText = kind === 'dev' ? '#7A5F2A' : '#1A5C38' // para estado selected (texto sobre bg blanco)

  // Estado selected: bg blanco + texto del color brand + border 2px brand
  const bg     = selected ? '#FFFFFF' : hovered ? hoverBg : baseBg
  const color  = selected ? accentText : '#FFFFFF'
  const border = selected ? `2px solid ${baseBg}` : '1px solid rgba(255,255,255,0.85)'
  const scale  = hovered ? 'transform:scale(1.05);' : ''
  // Bounce cuando hovered: se ejecuta al re-renderizar el divIcon con
  // hovered=true (ej. sync con card). Como Leaflet hace setIcon → swap del
  // inner DOM, la animation arranca de cero cada vez que entra a este estado.
  const bounce = hovered ? 'animation:si-pin-bounce 0.6s ease-in-out;' : ''
  const zExtra = selected ? 'z-index:9999;' : hovered ? 'z-index:5000;' : ''
  const shadow = selected
    ? `box-shadow:0 4px 14px ${kind === 'dev' ? 'rgba(212,162,76,0.45)' : 'rgba(26,92,56,0.45)'};`
    : 'box-shadow:0 2px 6px rgba(0,0,0,0.22);'
  // Triangulito: hereda bg (sólido). Cuando selected (bg blanco), el triangulito
  // muestra el color brand para mantener la coherencia con el border.
  const arrowColor = selected ? baseBg : bg

  const html = `
    <div style="
      position:relative;display:inline-block;${zExtra}${scale}${bounce}
      transition:transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
    ">
      <div style="
        background:${bg};color:${color};
        font-family:'Poppins',system-ui,sans-serif;
        font-weight:600;font-size:12px;
        font-variant-numeric:tabular-nums;
        padding:4px 8px;border-radius:4px;
        white-space:nowrap;line-height:1.2;
        border:${border};
        ${shadow}
        cursor:pointer;
      ">${label}</div>
      <div style="
        width:0;height:0;margin:0 auto;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:6px solid ${arrowColor};
      "></div>
    </div>`

  // Width estimate (chars * ~7px + padding)
  const charW = 7
  const w = Math.max(label.length * charW + 24, 60)

  return L.divIcon({
    className: '',
    html,
    iconSize: [w, 34],
    iconAnchor: [w / 2, 34],
    popupAnchor: [0, -36],
  })
}

// ─── Encuadre inicial fijo ───────────────────────────────────────────────────
//
// Centroide entre Funes, Roldán y Fisherton para que arranquen los 3 polos
// del corredor oeste visibles. NO depende de los resultados del listado —
// la posición es estable a través de recargas y filtros que no aplican zona.
// Cuando el usuario filtra por Ubicación, ZonaFlyTo lo lleva a la zona;
// cuando limpia el filtro, este componente no re-dispara (solo corre al montar).

export const DEFAULT_CENTER: [number, number] = [-32.9145, -60.8200]
export const DEFAULT_ZOOM = 12

function InitialView() {
  const map = useMap()
  useEffect(() => {
    // setTimeout corto para que MapContainer termine de medirse antes de
    // invalidateSize (sino el primer render queda con tiles cortadas en flex).
    const t = setTimeout(() => {
      map.invalidateSize()
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    }, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// ─── Map fly-to controller ────────────────────────────────────────────────────
//
// El tercer slot del tuple es el zoom destino. Sin él, asume 16 (zoom in a
// una propiedad seleccionada). Pasarlo explícito sirve para reset al
// encuadre inicial: [DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM].

export type FlyToTarget = [number, number] | [number, number, number]

function MapFlyTo({ center }: { center: FlyToTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    const zoom = center[2] ?? 16
    map.flyTo([center[0], center[1]], zoom, { duration: 0.7, easeLinearity: 0.4 })
  }, [center, map])
  return null
}

// ─── Hover/bounce style injector ──────────────────────────────────────────────
//
// Bounce: clase aplicada al marker cuando hoveredId === id (sync desde card).
// Se hace via L.Marker.setIcon recreando el divIcon con isHovered=true; el
// "bounce" lo activa esta clase agregada al wrapper de Leaflet via
// `marker.getElement().classList.add('si-pin-bounce')` desde el componente.

function MapStyles() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    if (!container.querySelector('#price-bubble-styles')) {
      const style = document.createElement('style')
      style.id = 'price-bubble-styles'
      style.textContent = `
        .leaflet-marker-icon:hover { z-index: 9999 !important; }
        .si-pin-bounce {
          animation: si-pin-bounce 0.6s ease-in-out;
        }
        @keyframes si-pin-bounce {
          0%, 100% { transform: translateY(0); }
          25%      { transform: translateY(-8px); }
          50%      { transform: translateY(0); }
          75%      { transform: translateY(-4px); }
        }
      `
      container.appendChild(style)
    }
  }, [map])
  return null
}

// ─── Viewport-based pin filter ───────────────────────────────────────────────
//
// Con 200+ propiedades, renderizar todos los pins simultáneamente causa lag
// en pan/zoom. Este helper escucha moveend/zoomend (throttle 150ms) y devuelve
// el subset de IDs cuyo lat/lng está dentro del bounds del mapa.
//
// Nota: NO afecta el listado lateral; ese sigue mostrando TODAS las
// propiedades. Solo filtra qué pins se dibujan en el mapa.

function ViewportPinFilter({
  points,
  onChange,
}: {
  points: { id: string | number; lat: number; lng: number }[]
  onChange: (visibleIds: Set<string | number>) => void
}) {
  const map = useMap()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const compute = () => {
      const b = map.getBounds()
      const next = new Set<string | number>()
      for (const p of points) {
        if (b.contains([p.lat, p.lng])) next.add(p.id)
      }
      onChangeRef.current(next)
    }
    // Throttle 150ms (trailing): si llegan eventos seguidos, programa un
    // solo recompute al final. Evita recomputar 60 veces durante un pan.
    const scheduleCompute = () => {
      if (timerRef.current) return
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        compute()
      }, 150)
    }
    compute() // initial
    map.on('moveend', scheduleCompute)
    map.on('zoomend', scheduleCompute)
    return () => {
      map.off('moveend', scheduleCompute)
      map.off('zoomend', scheduleCompute)
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    }
  }, [map, points])
  return null
}

// ─── User location button ────────────────────────────────────────────────────

function createUserLocationMarker() {
  // iconSize amplio para que la animación scale(3.5) no quede recortada por
  // el contenedor del divIcon de Leaflet.
  return L.divIcon({
    className: '',
    html: `<div class="user-location-marker">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
    <style>
      .user-location-marker {
        position: relative;
        width: 18px;
        height: 18px;
      }
      .user-location-dot {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        background: #1e40af;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(0,0,0,0.3);
        z-index: 2;
      }
      .user-location-pulse {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        background: rgba(30, 64, 175, 0.35);
        border-radius: 50%;
        animation: userLocationPulse 1.8s ease-out infinite;
        z-index: 1;
      }
      @keyframes userLocationPulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
      }
    </style>`,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  })
}

function LocateButton({
  onNearbyOrigin,
  nearbyActive,
}: {
  onNearbyOrigin?: (lat: number, lng: number) => void
  nearbyActive?: boolean
}) {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [marker, setMarker] = useState<L.Marker | null>(null)

  // Limpiar marker cuando el modo cercanía se apaga (chip cerrado).
  useEffect(() => {
    if (!nearbyActive && marker) {
      marker.remove()
      setMarker(null)
    }
  }, [nearbyActive, marker])

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      setToast('No pudimos obtener tu ubicación.')
      setTimeout(() => setToast(''), 3500)
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Zoom 14 ≈ 1km de radio visible. flyTo con duración suave.
        map.flyTo([latitude, longitude], 14, { duration: 1.2 })
        if (marker) marker.remove()
        const m = L.marker([latitude, longitude], { icon: createUserLocationMarker(), zIndexOffset: 2000 }).addTo(map)
        setMarker(m)
        setLoading(false)
        onNearbyOrigin?.(latitude, longitude)
      },
      (err) => {
        setLoading(false)
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Necesitamos acceso a tu ubicación para encontrar propiedades cerca tuyo.'
          : 'No pudimos obtener tu ubicación.'
        setToast(msg)
        setTimeout(() => setToast(''), 3500)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [map, marker, onNearbyOrigin])

  return (
    <>
      <div
        style={{ position: 'absolute', bottom: 100, right: 10, zIndex: 1000 }}
      >
        <button
          onClick={handleClick}
          title={nearbyActive ? 'Centrado en tu ubicación' : 'Centrar en mi ubicación'}
          aria-label="Centrar en mi ubicación"
          aria-pressed={nearbyActive}
          style={{
            width: 40, height: 40,
            background: nearbyActive ? '#1A5C38' : 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            border: nearbyActive ? '1px solid #1A5C38' : '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s, border 0.15s',
          }}
        >
          {loading ? (
            <div style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: nearbyActive ? '#fff' : '#3B82F6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={nearbyActive ? '#fff' : '#3B82F6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          )}
        </button>
      </div>
      {toast && (
        <div
          style={{
            position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: '#1f2937', color: 'white',
            fontSize: 12, fontWeight: 500, padding: '8px 16px',
            borderRadius: 8, whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

// ─── Search in this zone button ──────────────────────────────────────────────

function SearchZoneButton({ onSearch }: { onSearch: (bounds: L.LatLngBounds) => void }) {
  const map = useMap()

  // Listen for external refresh trigger (from bottom refresh button)
  useEffect(() => {
    const handler = () => onSearch(map.getBounds())
    window.addEventListener('si-refresh-bounds', handler)
    return () => window.removeEventListener('si-refresh-bounds', handler)
  }, [map, onSearch])

  // Desktop-only: show "Buscar en esta zona" button on map move
  const [visible, setVisible] = useState(false)
  const initial = useRef(true)

  useEffect(() => {
    const handler = () => {
      if (initial.current) { initial.current = false; return }
      setVisible(true)
    }
    map.on('moveend', handler)
    return () => { map.off('moveend', handler) }
  }, [map])

  if (!visible) return null

  return (
    <div className="hidden md:block" style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <button
        onClick={() => { onSearch(map.getBounds()); setVisible(false) }}
        style={{
          background: 'white',
          color: '#1f2937',
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: 50,
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Buscar en esta zona
      </button>
    </div>
  )
}

// ─── Zona fly-to ────────────────────────────────────────────────────────────
//
// Cuando se aplica un filtro de barrio, el mapa hace flyToBounds usando las
// coords de las propiedades filtradas (no el centroide hardcoded de la zona)
// para que el encuadre real refleje dónde están los inmuebles del listado.
// maxZoom 15 evita acercarse de más cuando hay pocos puntos pegados.
// Fallback al centroide de la zona si las propiedades no tienen coords.

function ZonaFlyTo({ zona, properties }: { zona: Zona; properties: TokkoProperty[] }) {
  const map = useMap()
  useEffect(() => {
    const coords = properties
      .filter(p => p.geo_lat && p.geo_long)
      .map(p => [parseFloat(p.geo_lat!), parseFloat(p.geo_long!)] as [number, number])
      .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng))

    if (coords.length === 0) {
      const zoom = zona.tipo === 'barrio_cerrado' ? 16 : zona.tipo === 'barrio' ? 14 : 13
      map.flyTo([zona.centro.lat, zona.centro.lng], zoom, { duration: 1.2 })
      return
    }
    if (coords.length === 1) {
      map.flyTo(coords[0]!, 15, { duration: 1.2 })
      return
    }
    map.flyToBounds(L.latLngBounds(coords), {
      padding: [60, 60],
      maxZoom: 15,
      duration: 1.2,
    })
  }, [map, zona, properties])
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Map move listener (clears mobile preview on drag) ──────────────────────

function MapMoveListener({ onMove }: { onMove: () => void }) {
  const map = useMap()
  const skipCount = useRef(0)
  useEffect(() => {
    // Skip initial load moves (fitBounds, setView)
    skipCount.current = 2
    const handler = () => {
      if (skipCount.current > 0) { skipCount.current--; return }
      onMove()
    }
    map.on('movestart', handler)
    map.on('zoomstart', handler)
    return () => { map.off('movestart', handler); map.off('zoomstart', handler) }
  }, [map, onMove])
  return null
}

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  hoveredId?: number | null
  onSelect: (id: number) => void
  onDeselect?: () => void
  onOpenDetail?: (id: number) => void
  flyToCenter: FlyToTarget | null
  onBoundsSearch?: (bounds: L.LatLngBounds) => void
  activeZona?: Zona | null
  onMapMove?: () => void
  /** Notifica al padre las coords del usuario tras un click en "Centrar". Activa modo cercanía. */
  onNearbyOrigin?: (lat: number, lng: number) => void
  /** Si true, el botón "Centrar" muestra estado activo (modo cercanía). */
  nearbyActive?: boolean
  /** Mouse enter/leave en un pin → setea hoveredId en el padre para
   *  highlightear + scrollear el card correspondiente. */
  onPinHover?: (id: number | null) => void
}

export default function PropiedadesMap({ properties, selectedId, hoveredId, onSelect, onDeselect, onOpenDetail, flyToCenter, onBoundsSearch, activeZona, onMapMove, onNearbyOrigin, nearbyActive, onPinHover }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const mapped = useMemo(() =>
    properties.filter(p => {
      if (!p.geo_lat || !p.geo_long) return false
      return !isNaN(parseFloat(p.geo_lat)) && !isNaN(parseFloat(p.geo_long))
    }),
  [properties])

  const { standalone, devGroups } = useMemo(() => groupByDevelopment(mapped), [mapped])

  // Viewport-based rendering: solo dibujar pins dentro del bounds actual.
  const allPoints = useMemo(() => [
    ...standalone.map(p => ({ id: p.id, lat: parseFloat(p.geo_lat!), lng: parseFloat(p.geo_long!) })),
    ...devGroups.map(g => ({ id: `dev-${g.devId}`, lat: g.lat, lng: g.lng })),
  ], [standalone, devGroups])
  const [visibleIds, setVisibleIds] = useState<Set<string | number>>(() => new Set())

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <InitialView />
      <MapFlyTo center={flyToCenter} />
      <MapStyles />
      <LocateButton onNearbyOrigin={onNearbyOrigin} nearbyActive={nearbyActive} />
      {onBoundsSearch && <SearchZoneButton onSearch={onBoundsSearch} />}
      {activeZona && <ZonaFlyTo zona={activeZona} properties={mapped} />}
      {onMapMove && <MapMoveListener onMove={onMapMove} />}

      {/* Legend — hidden on mobile */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'white', borderRadius: 8, padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', fontSize: 11, display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, background: '#1A5C38', borderRadius: 4, border: '1.5px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          <span style={{ color: '#666' }}>Propiedad</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, background: '#D4A24C', borderRadius: 4, border: '1.5px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          <span style={{ color: '#666' }}>Emprendimiento</span>
        </div>
      </div>

      {/* Viewport filter — listens moveend/zoomend (throttled 150ms) and
          decides which pins fall inside the current bounds. */}
      <ViewportPinFilter points={allPoints} onChange={setVisibleIds} />

      {/* Standalone properties — Zillow-style price pins, no clustering. */}
      {standalone.map(property => {
        if (!visibleIds.has(property.id)) return null
        const lat = parseFloat(property.geo_lat!)
        const lng = parseFloat(property.geo_long!)
        const isSelected = property.id === selectedId
        const isHovered  = property.id === hoveredId
        const priceLabel = formatPriceCompact(property)
        const photo      = getMainPhoto(property)
        const fullPrice  = formatPrice(property)
        const typeName   = translatePropertyType(property.type?.name)
        const area       = getTotalSurface(property)

        return (
          <Marker
            key={property.id}
            position={[lat, lng]}
            icon={createPriceBubble(priceLabel, isSelected, isHovered, 'property')}
            zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
            eventHandlers={{
              click: () => onSelect(property.id),
              popupclose: () => onDeselect?.(),
              mouseover: () => onPinHover?.(property.id),
              mouseout: () => onPinHover?.(null),
            }}
          >
            {!isMobile && <Popup maxWidth={300} className="ippoliti-popup">
              <div style={{ width: '270px', fontFamily: "'Raleway',system-ui,sans-serif", position: 'relative' }}>
                {photo && (
                  <div style={{ margin: '-10px -20px 12px', aspectRatio: '16 / 9', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={photo}
                      alt={property.publication_title || property.address}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {typeName && (
                      <span style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: 'rgba(26,92,56,0.85)', color: '#fff',
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '4px',
                      }}>
                        {typeName}
                      </span>
                    )}
                    <PropertyShareButton
                      propertyId={property.id}
                      slug={generatePropertySlug(property)}
                      title={property.publication_title || property.address || ''}
                      priceLabel={fullPrice}
                      top={8}
                      right={8}
                      size={32}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '22px', fontWeight: 800, color: '#1A5C38',
                    fontFamily: "'Poppins',system-ui,sans-serif", fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.1,
                  }}>
                    {fullPrice}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.3, margin: '0 0 8px' }}>
                  {property.publication_title || property.address}
                </h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                  {area != null && area > 0 && (
                    <span><span style={{ fontFamily: "'Poppins',system-ui,sans-serif", fontWeight: 600, color: '#0a0a0a' }}>{area}</span> m²</span>
                  )}
                  {(property.suite_amount || property.room_amount) > 0 && (
                    <span><span style={{ fontFamily: "'Poppins',system-ui,sans-serif", fontWeight: 600, color: '#0a0a0a' }}>{property.suite_amount || property.room_amount}</span> dorm.</span>
                  )}
                  {property.bathroom_amount > 0 && (
                    <span><span style={{ fontFamily: "'Poppins',system-ui,sans-serif", fontWeight: 600, color: '#0a0a0a' }}>{property.bathroom_amount}</span> baño{property.bathroom_amount > 1 ? 's' : ''}</span>
                  )}
                </div>
                <button
                  onClick={() => onOpenDetail?.(property.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    background: '#1A5C38', color: 'white',
                    fontSize: '13px', fontWeight: 600,
                    padding: '9px 16px', borderRadius: '8px',
                    border: 'none', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#145030' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
                >
                  Ver detalle →
                </button>
              </div>
            </Popup>}
          </Marker>
        )
      })}

      {/* Development markers — pill dorada con "Desde {minPrice}" */}
      {devGroups.map(g => {
        const devKey = `dev-${g.devId}`
        if (!visibleIds.has(devKey)) return null
        const label = g.minPrice === 'Consultar' ? g.devName : `Desde ${g.minPrice}`
        return (
          <Marker
            key={devKey}
            position={[g.lat, g.lng]}
            icon={createPriceBubble(label, false, false, 'dev')}
            zIndexOffset={500}
          >
            <Popup maxWidth={260} className="ippoliti-popup">
              <div style={{ width: '230px', fontFamily: "'Raleway',system-ui,sans-serif", padding: '2px 0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D4A24C', display: 'block', marginBottom: 4 }}>
                  Emprendimiento
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
                  {g.devName}
                </h3>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1A5C38', fontFamily: "'Poppins',system-ui,sans-serif", marginBottom: 8 }}>
                  Desde {g.minPrice}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666', marginBottom: 12 }}>
                  <span>{g.units.length} unidad{g.units.length !== 1 ? 'es' : ''}</span>
                  {g.dormRange && <span>{g.dormRange}</span>}
                </div>
                <a
                  href={`/emprendimientos/${g.slug}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: '#1A5C38', color: 'white',
                    fontSize: 13, fontWeight: 600,
                    padding: '9px 16px', borderRadius: 8,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#145030' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
                >
                  Ver emprendimiento →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
