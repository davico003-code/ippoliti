/* eslint-disable @next/next/no-img-element */
'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  type TokkoProperty,
  getMainPhoto,
  formatPrice,
  propertyTypeLabelById,
  getTotalSurface,
  generatePropertySlug,
} from '@/lib/tokko'
import type { Zona } from '@/lib/zonas' // used for ZonaFlyTo
import { DEFAULT_CENTER, DEFAULT_ZOOM, type FlyToTarget } from '@/lib/map-config'
import PropertyShareButton from './PropertyShareButton'
import { trackEvent } from '@/lib/analytics'

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

    // Min price (las unidades "Sin Precio" en Tokko no aportan su monto)
    const prices = units
      .filter(u => u.web_price !== false)
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

function createCraneIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#1A5C38;color:white;
      width:32px;height:32px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid white;
    "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V8l7-6 7 6v12"/><path d="M9 20v-6h6v6"/><path d="M12 2v6"/><path d="M8 8h8"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

// ─── Short price label for map bubbles ────────────────────────────────────────

function shortPrice(property: TokkoProperty): string {
  // "Sin Precio" en Tokko: la burbuja no muestra el monto
  if (property.web_price === false) return 'Consultar'
  const op = property.operations?.[0]
  if (!op?.prices?.[0]) return 'Consultar'
  const p = op.prices[0]
  if (!p.price || p.price === 0) return 'Consultar'

  const currency = p.currency === 'USD' ? 'U$S' : '$'

  if (p.price >= 1_000_000) {
    const m = (p.price / 1_000_000).toFixed(1).replace('.0', '')
    return `${currency} ${m}M`
  }
  if (p.price >= 1_000) {
    const k = Math.round(p.price / 1_000)
    return `${currency} ${k}K`
  }
  return `${currency} ${p.price.toLocaleString('es-AR')}`
}

// ─── Price bubble DivIcon ─────────────────────────────────────────────────────

function createPriceBubble(label: string, selected: boolean, hovered: boolean = false) {
  // selected > hovered (sin "selected"). Hover más claro y con outline amarillo.
  const bg = selected ? '#145030' : hovered ? '#2D7A4F' : '#1A5C38'
  const scale = selected || hovered ? 'transform:scale(1.1);' : ''
  const zExtra = selected ? 'z-index:9999;' : hovered ? 'z-index:5000;' : ''
  const shadow = selected
    ? 'box-shadow:0 4px 14px rgba(0,0,0,0.35);'
    : hovered
    ? 'box-shadow:0 4px 14px rgba(26,92,56,0.45);'
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.25);'
  const border = hovered && !selected
    ? '2px solid #FBBF24'
    : '2px solid rgba(255,255,255,0.9)'

  const html = `
    <div style="
      position:relative;display:inline-block;${zExtra}${scale}
      transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
    ">
      <div style="
        background:${bg};color:#fff;
        font-family:'Poppins',system-ui,sans-serif;
        font-weight:700;font-size:11px;
        padding:4px 8px;border-radius:6px;
        white-space:nowrap;line-height:1.2;
        border:${border};
        ${shadow}
        cursor:pointer;
      ">${label}</div>
      <div style="
        width:0;height:0;margin:0 auto;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:6px solid ${bg};
      "></div>
    </div>`

  // Estimate width based on character count
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

// ─── Cluster icon ─────────────────────────────────────────────────────────────

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  const label = count > 99 ? '99+' : String(count)

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:#0D3620;color:#fff;
        font-family:'Poppins',system-ui,sans-serif;
        font-weight:800;font-size:13px;
        width:44px;height:44px;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid rgba(255,255,255,0.9);
        box-shadow:0 3px 12px rgba(0,0,0,0.3);
        cursor:pointer;
      ">${label}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

// ─── Encuadre inicial fijo ───────────────────────────────────────────────────
//
// DEFAULT_CENTER/DEFAULT_ZOOM viven en @/lib/map-config (módulo sin leaflet)
// para que PropiedadesView pueda importarlos sin romper el code-splitting.
// Cuando el usuario filtra por Ubicación, ZonaFlyTo lo lleva a la zona;
// cuando limpia el filtro, este componente no re-dispara (solo corre al montar).

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
// FlyToTarget vive en @/lib/map-config (ver nota arriba).

// Ejecuta `fly` solo si el mapa tiene tamaño real. Si está oculto (vista lista
// en mobile → contenedor 0×0), Leaflet proyecta a NaN y tira excepción; en ese
// caso esperamos al evento `resize` (que dispara al pasar a vista mapa).
function whenMapSized(map: ReturnType<typeof useMap>, fly: () => void): (() => void) | undefined {
  const size = map.getSize()
  if (size.x > 0 && size.y > 0) { fly(); return undefined }
  const onResize = () => {
    const s = map.getSize()
    if (s.x > 0 && s.y > 0) { map.off('resize', onResize); fly() }
  }
  map.on('resize', onResize)
  return () => map.off('resize', onResize)
}

function MapFlyTo({ center }: { center: FlyToTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    const [lat, lng] = center
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const zoom = center[2] ?? 16
    return whenMapSized(map, () => map.flyTo([lat, lng], zoom, { duration: 0.7, easeLinearity: 0.4 }))
  }, [center, map])
  return null
}

// ─── Hover style injector ─────────────────────────────────────────────────────

function MapStyles() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    if (!container.querySelector('#price-bubble-styles')) {
      const style = document.createElement('style')
      style.id = 'price-bubble-styles'
      style.textContent = `
        .leaflet-marker-icon:hover { z-index: 9999 !important; }
        .leaflet-marker-icon:hover > div > div:first-child {
          background: #2D7A4F !important;
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.35) !important;
        }
        .marker-cluster-animated {
          transition: transform 0.3s ease;
        }
      `
      container.appendChild(style)
    }
  }, [map])
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
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}}` }} />
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
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

    const doFly = () => {
      if (coords.length === 0) {
        const c = zona.centro
        if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) return
        const zoom = zona.tipo === 'barrio_cerrado' ? 16 : zona.tipo === 'barrio' ? 14 : 13
        map.flyTo([c.lat, c.lng], zoom, { duration: 1.2 })
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
    }
    // Guarda anti-NaN: no volar si el mapa está oculto (tamaño 0); esperar resize.
    return whenMapSized(map, doFly)
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

// ─── Capa satelital (Esri World Imagery) ────────────────────────────────────
//
// Dos vías de activación:
// - Auto: con zoom ≥ 17 el mapa de calles ya no aporta (manzanas vacías en
//   Funes/Roldán) y pasa solo a satelital; al alejarse a ≤ 15 vuelve a mapa.
// - Manual: el botón fija la elección del usuario y el auto deja de decidir.

const SAT_AUTO_ON = 17
const SAT_AUTO_OFF = 15

function AutoSatellite({ satellite, setSatellite, manualRef }: {
  satellite: boolean
  setSatellite: (v: boolean) => void
  manualRef: React.MutableRefObject<boolean>
}) {
  const map = useMap()
  useEffect(() => {
    const handler = () => {
      if (manualRef.current) return
      const z = map.getZoom()
      if (!satellite && z >= SAT_AUTO_ON) {
        setSatellite(true)
        trackEvent('mapa_satelite', { modo: 'auto', zoom: z })
      } else if (satellite && z <= SAT_AUTO_OFF) {
        setSatellite(false)
      }
    }
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map, satellite, setSatellite, manualRef])
  return null
}

function SatelliteToggle({ satellite, setSatellite, manualRef }: {
  satellite: boolean
  setSatellite: (v: boolean) => void
  manualRef: React.MutableRefObject<boolean>
}) {
  const handleClick = useCallback(() => {
    manualRef.current = true
    const next = !satellite
    setSatellite(next)
    if (next) trackEvent('mapa_satelite', { modo: 'manual' })
  }, [satellite, setSatellite, manualRef])

  return (
    <div style={{ position: 'absolute', bottom: 148, right: 10, zIndex: 1000 }}>
      <button
        onClick={handleClick}
        title={satellite ? 'Ver mapa' : 'Ver satélite'}
        aria-label={satellite ? 'Cambiar a vista mapa' : 'Cambiar a vista satelital'}
        aria-pressed={satellite}
        style={{
          width: 40, height: 40,
          background: satellite ? '#1A5C38' : 'white',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          border: satellite ? '1px solid #1A5C38' : '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={satellite ? '#fff' : '#374151'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
          <polyline points="2 15.5 12 22 22 15.5" />
        </svg>
      </button>
    </div>
  )
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
}

export default function PropiedadesMap({ properties, selectedId, hoveredId, onSelect, onDeselect, onOpenDetail, flyToCenter, onBoundsSearch, activeZona, onMapMove, onNearbyOrigin, nearbyActive }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [satellite, setSatellite] = useState(false)
  // true una vez que el usuario eligió capa a mano: el auto-switch deja de decidir
  const satManualRef = useRef(false)
  const mapped = useMemo(() =>
    properties.filter(p => {
      if (!p.geo_lat || !p.geo_long) return false
      return !isNaN(parseFloat(p.geo_lat)) && !isNaN(parseFloat(p.geo_long))
    }),
  [properties])

  const { standalone, devGroups } = useMemo(() => groupByDevelopment(mapped), [mapped])

  const craneIcon = useMemo(() => createCraneIcon(), [])

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom
    >
      {satellite ? (
        <>
          <TileLayer
            key="sat"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Maxar, Earthstar Geographics'
            maxNativeZoom={19}
            maxZoom={20}
          />
          <TileLayer
            key="sat-places"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={19}
            maxZoom={20}
          />
          <TileLayer
            key="sat-roads"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={19}
            maxZoom={20}
          />
        </>
      ) : (
        <TileLayer
          key="base"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />
      )}
      <ZoomControl position="bottomright" />
      <AutoSatellite satellite={satellite} setSatellite={setSatellite} manualRef={satManualRef} />
      <SatelliteToggle satellite={satellite} setSatellite={setSatellite} manualRef={satManualRef} />
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
          <div style={{ width: 14, height: 14, background: '#1A5C38', borderRadius: '50%', border: '1.5px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 20V8l7-6 7 6v12"/></svg>
          </div>
          <span style={{ color: '#666' }}>Emprendimiento</span>
        </div>
      </div>

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        iconCreateFunction={createClusterIcon}
      >
        {/* Standalone properties */}
        {standalone.map(property => {
          const lat = parseFloat(property.geo_lat!)
          const lng = parseFloat(property.geo_long!)
          const isSelected = property.id === selectedId
          const isHovered = property.id === hoveredId
          const priceLabel = shortPrice(property)
          const photo = getMainPhoto(property)
          const fullPrice = formatPrice(property)
          const typeName = propertyTypeLabelById(property.type?.id)
          const area = getTotalSurface(property)

          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
              icon={createPriceBubble(priceLabel, isSelected, isHovered)}
              zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
              eventHandlers={{
                click: () => onSelect(property.id),
                popupclose: () => onDeselect?.(),
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
                    Ver propiedad →
                  </button>
                </div>
              </Popup>}
            </Marker>
          )
        })}
      </MarkerClusterGroup>

      {/* Development markers — outside cluster group */}
      {devGroups.map(g => (
        <Marker
          key={`dev-${g.devId}`}
          position={[g.lat, g.lng]}
          icon={craneIcon}
          zIndexOffset={500}
        >
          <Popup maxWidth={260} className="ippoliti-popup">
            <div style={{ width: '230px', fontFamily: "'Raleway',system-ui,sans-serif", padding: '2px 0' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1A5C38', display: 'block', marginBottom: 4 }}>
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
      ))}
    </MapContainer>
  )
}
