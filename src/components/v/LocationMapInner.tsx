'use client'

// Mapa de ubicación con pin clásico + toggle Mapa / Satélite.
// Las coords ya vienen con offset 30-50m del lib (FichaSnapshot.lat/lng son
// las coords offseteadas, no las reales). Zoom 16, scroll-wheel desactivado
// para no chocar con el scroll vertical de la página.
//
// Tiles:
//   - Mapa: OSM standard, sin API key.
//   - Satélite: ESRI World Imagery, sin API key (uso público con atribución).

import { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type View = 'street' | 'satellite'

const TILE_CONFIG: Record<View, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
}

export default function LocationMapInner({ lat, lng }: { lat: number; lng: number }) {
  const [view, setView] = useState<View>('street')
  const cfg = TILE_CONFIG[view]

  return (
    <div
      className="locmap-wrap"
      style={{
        position: 'relative',
        height: 350,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          key={view}
          url={cfg.url}
          attribution={cfg.attribution}
          maxZoom={view === 'satellite' ? 19 : 19}
        />
        <Marker position={[lat, lng]} icon={defaultIcon} />
      </MapContainer>

      {/* Toggle Mapa / Satélite — arriba a la derecha sobre el mapa */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          padding: 3,
          display: 'flex',
          gap: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          fontFamily: 'inherit',
        }}
        role="group"
        aria-label="Tipo de mapa"
      >
        <ToggleBtn active={view === 'street'} onClick={() => setView('street')} label="Mapa" />
        <ToggleBtn active={view === 'satellite'} onClick={() => setView('satellite')} label="Satélite" />
      </div>

      <style>{`
        @media (min-width: 768px) {
          .locmap-wrap { height: 450px !important; }
        }
      `}</style>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '6px 12px',
        background: active ? '#1A1A1A' : 'transparent',
        color: active ? '#fff' : '#1A1A1A',
        border: 'none',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 120ms, color 120ms',
      }}
    >
      {label}
    </button>
  )
}
