/* eslint-disable @next/next/no-img-element */
'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  translatePropertyType,
  getTotalSurface,
} from '@/lib/tokko'
import type { Zona } from '@/lib/zonas' // used for ZonaFlyTo

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

// ─── Auto fit bounds to show all properties ──────────────────────────────────

const DEFAULT_CENTER: [number, number] = [-32.95, -60.75]
const DEFAULT_ZOOM = 11

function FitBounds({ properties }: { properties: TokkoProperty[] }) {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
      // Mobile: always use fixed default encuadre
      if (window.innerWidth < 768) {
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
        return
      }
      // Desktop: fit to data
      if (!properties || properties.length === 0) return
      const coords = properties
        .filter(p => p.geo_lat && p.geo_long)
        .map(p => [parseFloat(p.geo_lat!), parseFloat(p.geo_long!)] as [number, number])
      if (coords.length === 0) return
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 })
      setTimeout(() => { if (map.getZoom() < 11) map.setZoom(11) }, 150)
    }, 300)
  }, [properties, map])
  return null
}

// ─── Map fly-to controller ────────────────────────────────────────────────────

function MapFlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 16, { duration: 0.7, easeLinearity: 0.4 })
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
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.2);animation:locPulse 2s ease-out infinite"></div>
      <div style="width:14px;height:14px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);position:relative;z-index:1"></div>
    </div>
    <style>@keyframes locPulse{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2.2);opacity:0}}</style>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function LocateButton() {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [marker, setMarker] = useState<L.Marker | null>(null)

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      setToast('Tu navegador no soporta geolocalización')
      setTimeout(() => setToast(''), 3000)
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 14, { duration: 1 })
        if (marker) marker.remove()
        const m = L.marker([latitude, longitude], { icon: createUserLocationMarker(), zIndexOffset: 2000 }).addTo(map)
        setMarker(m)
        setLoading(false)
      },
      () => {
        setLoading(false)
        setToast('Activá la ubicación en tu navegador')
        setTimeout(() => setToast(''), 3000)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [map, marker])

  return (
    <>
      <div
        style={{ position: 'absolute', bottom: 100, right: 10, zIndex: 1000 }}
      >
        <button
          onClick={handleClick}
          title="Mi ubicación"
          style={{
            width: 40, height: 40,
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {loading ? (
            <div style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function ZonaFlyTo({ zona }: { zona: Zona }) {
  const map = useMap()
  useEffect(() => {
    const zoom = zona.tipo === 'barrio_cerrado' ? 16 : zona.tipo === 'barrio' ? 14 : 13
    map.setView([zona.centro.lat, zona.centro.lng], zoom)
  }, [map, zona])
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
  flyToCenter: [number, number] | null
  onBoundsSearch?: (bounds: L.LatLngBounds) => void
  activeZona?: Zona | null
  onMapMove?: () => void
}

export default function PropiedadesMap({ properties, selectedId, hoveredId, onSelect, onDeselect, flyToCenter, onBoundsSearch, activeZona, onMapMove }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
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
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <FitBounds properties={mapped} />
      <MapFlyTo center={flyToCenter} />
      <MapStyles />
      <LocateButton />
      {onBoundsSearch && <SearchZoneButton onSearch={onBoundsSearch} />}
      {activeZona && <ZonaFlyTo zona={activeZona} />}
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
          const slug = generatePropertySlug(property)
          const typeName = translatePropertyType(property.type?.name)
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
                <div style={{ width: '270px', fontFamily: "'Raleway',system-ui,sans-serif" }}>
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
                  <a
                    href={`/propiedades/${slug}`}
                    style={{
                      display: 'block', textAlign: 'center',
                      background: '#1A5C38', color: 'white',
                      fontSize: '13px', fontWeight: 600,
                      padding: '9px 16px', borderRadius: '8px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#145030' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
                  >
                    Ver propiedad →
                  </a>
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
