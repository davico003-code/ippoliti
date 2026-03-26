/* eslint-disable @next/next/no-img-element */
'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
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

function createPriceBubble(label: string, selected: boolean) {
  const bg = selected ? '#145030' : '#1A5C38'
  const scale = selected ? 'transform:scale(1.1);' : ''
  const zExtra = selected ? 'z-index:9999;' : ''
  const shadow = selected
    ? 'box-shadow:0 4px 14px rgba(0,0,0,0.35);'
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.25);'

  const html = `
    <div style="
      position:relative;display:inline-block;${zExtra}${scale}
      transition:transform .15s ease, box-shadow .15s ease;
    ">
      <div style="
        background:${bg};color:#fff;
        font-family:'Poppins',system-ui,sans-serif;
        font-weight:700;font-size:11px;
        padding:4px 8px;border-radius:6px;
        white-space:nowrap;line-height:1.2;
        border:2px solid rgba(255,255,255,0.9);
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

function FitBounds({ properties }: { properties: TokkoProperty[] }) {
  const map = useMap()
  useEffect(() => {
    if (!properties || properties.length === 0) return
    const coords = properties
      .filter(p => p.geo_lat && p.geo_long)
      .map(p => [parseFloat(p.geo_lat!), parseFloat(p.geo_long!)] as [number, number])
    if (coords.length === 0) return
    setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 })
      // Don't zoom out further than 11 (Rosario/Funes area)
      setTimeout(() => { if (map.getZoom() < 11) map.setZoom(11) }, 100)
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

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  properties: TokkoProperty[]
  selectedId: number | null
  onSelect: (id: number) => void
  flyToCenter: [number, number] | null
}

export default function PropiedadesMap({ properties, selectedId, onSelect, flyToCenter }: Props) {
  const mapped = useMemo(() =>
    properties.filter(p => {
      if (!p.geo_lat || !p.geo_long) return false
      return !isNaN(parseFloat(p.geo_lat)) && !isNaN(parseFloat(p.geo_long))
    }),
  [properties])

  return (
    <MapContainer
      center={[-32.9167, -60.8167]}
      zoom={13}
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

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        iconCreateFunction={createClusterIcon}
      >
        {mapped.map(property => {
          const lat = parseFloat(property.geo_lat!)
          const lng = parseFloat(property.geo_long!)
          const isSelected = property.id === selectedId
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
              icon={createPriceBubble(priceLabel, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelect(property.id) }}
            >
              <Popup maxWidth={300} className="ippoliti-popup">
                <div style={{ width: '270px', fontFamily: "'Raleway',system-ui,sans-serif" }}>
                  {photo && (
                    <div style={{ margin: '-10px -20px 12px', height: '160px', overflow: 'hidden', position: 'relative' }}>
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
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, margin: '0 0 4px' }}>
                    {property.publication_title || property.address}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '18px', fontWeight: 800, color: '#1A5C38',
                      fontFamily: "'Poppins',system-ui,sans-serif", fontVariantNumeric: 'tabular-nums',
                    }}>
                      {fullPrice}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    {area != null && area > 0 && (
                      <span style={{ fontFamily: "'Poppins',system-ui,sans-serif" }}>{area} m²</span>
                    )}
                    {property.room_amount > 0 && (
                      <span>{property.room_amount} dorm.</span>
                    )}
                    {property.bathroom_amount > 0 && (
                      <span>{property.bathroom_amount} baño{property.bathroom_amount > 1 ? 's' : ''}</span>
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
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
