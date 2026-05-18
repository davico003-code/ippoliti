'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { type LatLngBoundsExpression } from 'leaflet'
import { trackEvent } from '@/lib/analytics'
import type { HubTier } from './BarrioHubCardImage'

const FUNES_CENTER: [number, number] = [-32.92, -60.83]

const TIER_COLOR: Record<HubTier, string> = {
  premium: '#1A5C38',
  consolidado: '#4A7C5C',
  joven: '#B8935A',
  desarrollo: '#8B5A2B',
}

const TIER_BADGE: Record<HubTier, { label: string; bg: string; color: string }> = {
  premium: { label: 'PREMIUM', bg: '#1A5C38', color: '#FFFFFF' },
  consolidado: { label: 'CONSOLIDADO', bg: '#DCE9E1', color: '#1A5C38' },
  joven: { label: 'VIDA JOVEN', bg: '#F4E9D5', color: '#7A5A1E' },
  desarrollo: { label: 'EN DESARROLLO', bg: '#FDF1E4', color: '#8B5A2B' },
}

export interface MapaBarrio {
  slug: string
  nombre: string
  tier: HubTier
  descripcion: string
  lat: number
  lng: number
}

function iniciales(nombre: string): string {
  const palabras = nombre
    .replace(/[^a-zA-Záéíóúñ ]/gi, '')
    .trim()
    .split(/\s+/)
  if (palabras.length >= 2) return (palabras[0]![0]! + palabras[1]![0]!).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

function makeIcon(barrio: MapaBarrio): L.DivIcon {
  const color = TIER_COLOR[barrio.tier]
  const ini = iniciales(barrio.nombre)
  return L.divIcon({
    className: 'barrio-marker-wrapper',
    html: `<div class="barrio-marker barrio-marker-${barrio.tier}" style="background:${color}">${ini}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function FitBounds({ markers }: { markers: MapaBarrio[] }) {
  const map = useMap()
  useEffect(() => {
    if (markers.length === 0) return
    const bounds: LatLngBoundsExpression = markers.map((m) => [m.lat, m.lng])
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [map, markers])
  return null
}

interface Props {
  barrios: MapaBarrio[]
}

export default function BarrioMapa({ barrios }: Props) {
  return (
    <div
      className="barrio-mapa-container"
      style={{ position: 'relative', height: '100%', width: '100%' }}
    >
      <MapContainer
        center={FUNES_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <FitBounds markers={barrios} />
        {barrios.map((b) => {
          const badge = TIER_BADGE[b.tier]
          return (
            <Marker
              key={b.slug}
              position={[b.lat, b.lng]}
              icon={makeIcon(b)}
              eventHandlers={{
                click: () =>
                  trackEvent('barrios_mapa_interact', {
                    slug: b.slug,
                    action: 'marker_click',
                  }),
              }}
            >
              <Popup className="barrio-mapa-popup">
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: badge.bg,
                    color: badge.color,
                    marginBottom: 8,
                  }}
                >
                  {badge.label}
                </span>
                <p
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontWeight: 600,
                    fontSize: 16,
                    color: '#0F0F0F',
                    margin: '0 0 4px',
                    lineHeight: 1.2,
                  }}
                >
                  {b.nombre}
                </p>
                <p
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    color: '#6B7280',
                    margin: '0 0 10px',
                    lineHeight: 1.4,
                  }}
                >
                  {b.descripcion}
                </p>
                <Link
                  href={`/barrios-privados/${b.slug}`}
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1A5C38',
                    textDecoration: 'none',
                  }}
                  className="barrio-mapa-popup-link"
                >
                  Conocer el barrio →
                </Link>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      <style>{`
        .barrio-marker-wrapper { background: transparent !important; border: none !important; }
        .barrio-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-family: 'Raleway', sans-serif;
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
          transition: transform 180ms ease;
          cursor: pointer;
        }
        .barrio-marker:hover { transform: scale(1.15); }
        .barrio-mapa-popup .leaflet-popup-content-wrapper {
          width: 240px;
          border-radius: 10px;
          padding: 0;
        }
        .barrio-mapa-popup .leaflet-popup-content {
          margin: 14px 16px 12px;
          width: auto !important;
        }
        .barrio-mapa-popup .leaflet-popup-tip { background: #fff; }
        .barrio-mapa-popup-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
