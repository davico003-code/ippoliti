'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const OFFICES = [
  {
    name: 'Oficina Histórica Roldán',
    address: '1ro de Mayo 258, Roldán',
    lat: -32.8952,
    lng: -60.9024,
    mapsUrl: 'https://maps.google.com/?q=1ro+de+Mayo+258+Roldan+Santa+Fe',
  },
  {
    name: 'Oficina Ventas Roldán',
    address: 'Catamarca 775, Roldán',
    lat: -32.8965,
    lng: -60.9010,
    mapsUrl: 'https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe',
  },
  {
    name: 'Oficina Funes + Galería de Arte',
    address: 'Hipólito Yrigoyen 2643, Funes',
    lat: -32.9128,
    lng: -60.8289,
    mapsUrl: 'https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe',
  },
]

function createMarker() {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="45" viewBox="0 0 30 42" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.444 15 27 15 27S30 25.444 30 15C30 6.716 23.284 0 15 0z" fill="#1A5C38" stroke="white" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`,
    iconSize: [32, 45],
    iconAnchor: [16, 45],
    popupAnchor: [0, -45],
  })
}

export default function OfficesMap() {
  return (
    <div className="w-full h-[380px] rounded-xl overflow-hidden relative z-0">
      <MapContainer
        center={[-32.904, -60.865]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        {OFFICES.map(office => (
          <Marker key={office.name} position={[office.lat, office.lng]} icon={createMarker()}>
            <Popup>
              <div style={{ fontFamily: "'Raleway',system-ui,sans-serif", minWidth: '180px' }}>
                <p style={{ fontWeight: 800, fontSize: '14px', color: '#1A5C38', margin: '0 0 4px' }}>
                  {office.name}
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px' }}>
                  {office.address}
                </p>
                <a
                  href={office.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center',
                    background: '#1A5C38', color: 'white',
                    fontSize: '12px', fontWeight: 600,
                    padding: '7px 14px', borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                >
                  Ver en Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
