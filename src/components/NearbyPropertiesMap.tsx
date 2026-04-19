'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'

export interface NearbyProperty {
  id: number
  lat: number
  lng: number
  title: string
  price: string
  slug: string
}

function createPriceBubble(price: string) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:inline-block" class="price-bubble">
      <div style="
        background:#1A5C38;color:#fff;
        font-family:'Poppins',system-ui,sans-serif;
        font-weight:700;font-size:11px;
        padding:4px 8px;border-radius:6px;
        white-space:nowrap;line-height:1.2;
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        cursor:pointer;
      ">${price}</div>
      <div style="
        width:0;height:0;margin:0 auto;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:5px solid #1A5C38;
      "></div>
    </div>`,
    iconSize: [Math.max(price.length * 7 + 24, 60), 32],
    iconAnchor: [Math.max(price.length * 7 + 24, 60) / 2, 32],
    popupAnchor: [0, -34],
  })
}

function createCurrentMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:#E63946;border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function SetView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

interface Props {
  lat: number
  lng: number
  nearbyProperties: NearbyProperty[]
}

export default function NearbyPropertiesMap({ lat, lng, nearbyProperties }: Props) {
  if (nearbyProperties.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden max-w-full">
      <h2 style={{ fontFamily: "'Raleway', system-ui, sans-serif" }} className="text-[18px] font-extrabold text-gray-900 mb-1">Otras propiedades en la zona</h2>
      <p className="text-gray-500 text-[13px] mb-4 font-poppins">Explorá propiedades cercanas en el mapa · {nearbyProperties.length} propiedad{nearbyProperties.length !== 1 ? 'es' : ''}</p>

      <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
        <style>{`
          .nearby-map .leaflet-marker-icon:hover { z-index: 9999 !important; }
          .nearby-map .leaflet-marker-icon:hover > div > div:first-child {
            background: #2D7A4F !important;
            transform: scale(1.12);
            box-shadow: 0 4px 14px rgba(0,0,0,0.35) !important;
          }
          @media (max-width: 768px) {
            .nearby-map .leaflet-marker-icon .price-bubble > div { display: none !important; }
            .nearby-map .leaflet-marker-icon .price-bubble::after {
              content: '';
              display: block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #1A5C38;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              margin: 0 auto;
            }
          }
        `}</style>
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl
          className="nearby-map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />
          <SetView center={[lat, lng]} />

          {/* Current property — red dot */}
          <Marker position={[lat, lng]} icon={createCurrentMarker()} />

          {/* Nearby properties — price bubbles */}
          {nearbyProperties.map(np => (
            <Marker key={np.id} position={[np.lat, np.lng]} icon={createPriceBubble(np.price)}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Poppins, sans-serif' }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#1A5C38', margin: '0 0 4px' }}>{np.price}</p>
                  <p style={{ fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.4 }}>{np.title}</p>
                  <Link
                    href={`/propiedades/${np.slug}`}
                    style={{ display: 'block', textAlign: 'center', background: '#1A5C38', color: 'white', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: '8px', textDecoration: 'none' }}
                  >
                    Ver propiedad →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-poppins">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#E63946] border-2 border-white shadow-sm" />
          Esta propiedad
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#1A5C38] border border-white shadow-sm" />
          Otras propiedades
        </div>
      </div>
    </div>
  )
}
