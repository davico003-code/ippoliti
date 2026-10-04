'use client'

// Mapa de ubicación con punto + halo (zona aproximada) y toggle Mapa / Satélite.
// Las coords ya vienen con offset 30-50m del lib (FichaSnapshot.lat/lng son
// las coords offseteadas, no las reales). Zoom 16, scroll-wheel desactivado
// y, en pantallas táctiles, sin arrastre con un dedo: el dedo scrollea la
// página, no el mapa. Alto = clase vf-mapa.
//
// Tiles:
//   - Mapa: OSM standard, sin API key.
//   - Satélite: ESRI World Imagery, sin API key (uso público con atribución).

import { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const puntoIcon = L.divIcon({
  className: 'vf-pin',
  html: '<span class="vf-pin-halo"><i></i></span>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
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
      className="vf-mapa"
      style={{
        position: 'relative',
        // Encierra los z-index de Leaflet (capas 400, controles 1000): sin esto
        // el mapa se pintaba ENCIMA de la barra fija del celu (z 40), de su
        // hoja "¿Te gusta?", del menú Compartir y del visor de fotos.
        isolation: 'isolate',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #ECECEC',
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          key={view}
          url={cfg.url}
          attribution={cfg.attribution}
          maxZoom={view === 'satellite' ? 19 : 19}
        />
        <Marker position={[lat, lng]} icon={puntoIcon} />
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

      <style dangerouslySetInnerHTML={{ __html: `
        .vf-pin { background: none; border: none; }
        .vf-pin-halo { width: 48px; height: 48px; border-radius: 50%; background: rgba(23,23,23,0.14); display: flex; align-items: center; justify-content: center; }
        .vf-pin-halo i { width: 16px; height: 16px; border-radius: 50%; background: #1A1A1A; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
      ` }} />
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
