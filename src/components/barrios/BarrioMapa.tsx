'use client'

import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { BARRIOS, type Barrio } from '@/lib/barrios'
import { trackEvent } from '@/lib/analytics'

// Funes centroide aproximado — usado cuando un barrio no tiene coords
const FUNES_CENTER: [number, number] = [-32.9159, -60.8073]

// Coords plausibles para barrios sin coords explícitas (manualmente curadas
// dentro del corredor de Funes). Si después David carga las exactas, este
// fallback se descarta automáticamente.
const FALLBACK_COORDS: Record<string, [number, number]> = {
  'vida-lagoon': [-32.9095, -60.7965],
  'vida-barrio-cerrado': [-32.9152, -60.7901],
  'vida-club-de-campo': [-32.9213, -60.7847],
  'vida-jardin': [-32.9075, -60.8045],
  'vida-green': [-32.9015, -60.8132],
  kentucky: [-32.9234, -60.8189],
  'funes-hills-san-marino': [-32.9182, -60.8255],
  'funes-hills-cadaques': [-32.9119, -60.8302],
  'funes-lakes': [-32.9047, -60.7889],
  'funes-hills-miraflores': [-32.9128, -60.8161],
}

const TIER_COLOR: Record<Barrio['tier'], string> = {
  Premium: '#C9A961',
  Consolidado: '#1A5C38',
  'Consolidado con vida joven': '#3D8B5C',
  'En desarrollo': '#666666',
}

function makeIcon(tier: Barrio['tier']) {
  const color = TIER_COLOR[tier]
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 30 42" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.444 15 27 15 27S30 25.444 30 15C30 6.716 23.284 0 15 0z" fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  })
}

// Puntos de interés ABC1 (coords plausibles del corredor — David puede ajustar)
const POIS = [
  { id: 'aeropuerto', label: 'Aeropuerto Rosario', lat: -32.9036, lng: -60.7853, kind: 'transporte' },
  { id: 'autopista-15', label: 'Autopista — Garita 15', lat: -32.9255, lng: -60.7945, kind: 'transporte' },
  { id: 'colegio-tarbut', label: 'Colegio Tarbut', lat: -32.9099, lng: -60.7991, kind: 'colegio' },
  { id: 'colegio-anglo', label: 'The Anglo School', lat: -32.9132, lng: -60.7843, kind: 'colegio' },
  { id: 'colegio-jeanmaire', label: 'Jean Piaget / Lasalle', lat: -32.9189, lng: -60.8222, kind: 'colegio' },
  { id: 'sanatorio-eldo', label: 'Centro de Salud Funes', lat: -32.9165, lng: -60.8156, kind: 'salud' },
  { id: 'jumbo-funes', label: 'Jumbo Funes', lat: -32.9201, lng: -60.8132, kind: 'super' },
  { id: 'la-anonima', label: 'La Anónima Funes', lat: -32.9156, lng: -60.8094, kind: 'super' },
]

const POI_KIND_COLOR: Record<string, string> = {
  transporte: '#0EA5E9',
  colegio: '#7C3AED',
  salud: '#E11D48',
  super: '#F59E0B',
}

interface Props {
  barrios?: Barrio[]
}

export default function BarrioMapa({ barrios = BARRIOS as Barrio[] }: Props) {
  const [showAccesos, setShowAccesos] = useState(true)
  const [showPOIs, setShowPOIs] = useState(true)

  const markers = useMemo(() => {
    return barrios.map((b) => {
      const c = b.ubicacion.coordenadas
      const fallback = FALLBACK_COORDS[b.slug]
      const coords: [number, number] = c ? [c.lat, c.lng] : fallback ?? FUNES_CENTER
      return { barrio: b, coords }
    })
  }, [barrios])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showAccesos}
            onChange={() => setShowAccesos((v) => !v)}
            className="accent-brand-600"
          />
          <span>Accesos (autopista / aeropuerto)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showPOIs}
            onChange={() => setShowPOIs((v) => !v)}
            className="accent-brand-600"
          />
          <span>Puntos de interés ABC1</span>
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
          <Legend color={TIER_COLOR.Premium} label="Premium" />
          <Legend color={TIER_COLOR.Consolidado} label="Consolidado" />
          <Legend color={TIER_COLOR['Consolidado con vida joven']} label="Vida joven" />
          <Legend color={TIER_COLOR['En desarrollo']} label="En desarrollo" />
        </div>
      </div>

      <div className="relative h-[460px] w-full overflow-hidden rounded-xl ring-1 ring-stone-200">
        <MapContainer
          center={FUNES_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map(({ barrio, coords }) => (
            <Marker
              key={barrio.slug}
              position={coords}
              icon={makeIcon(barrio.tier)}
              eventHandlers={{
                click: () =>
                  trackEvent('barrios_mapa_interact', {
                    slug: barrio.slug,
                    action: 'marker_click',
                  }),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-raleway text-base font-semibold text-navy-700">
                    {barrio.nombre}
                  </p>
                  <p className="text-xs text-stone-600">
                    {barrio.datosDuros.medidaLoteDesde
                      ? `Lotes desde ${barrio.datosDuros.medidaLoteDesde} m²`
                      : 'Consultar disponibilidad'}
                  </p>
                  <Link
                    href={`/barrios-privados/${barrio.slug}`}
                    className="mt-1 inline-block text-xs font-medium text-brand-700 underline"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {showPOIs && (
            <LayerGroup>
              {POIS.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={[p.lat, p.lng]}
                  radius={7}
                  pathOptions={{
                    color: POI_KIND_COLOR[p.kind] ?? '#666',
                    fillColor: POI_KIND_COLOR[p.kind] ?? '#666',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <p className="text-xs text-navy-700">
                      <span className="font-medium">{p.label}</span>
                      <br />
                      <span className="text-stone-500 capitalize">{p.kind}</span>
                    </p>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          )}

          {showAccesos && (
            <LayerGroup>
              <CircleMarker
                center={[-32.9255, -60.7945]}
                radius={10}
                pathOptions={{ color: '#1A5C38', fillColor: '#1A5C38', fillOpacity: 0.3 }}
              >
                <Popup>
                  <p className="text-xs">Autopista Rosario–Córdoba — Garita 15</p>
                </Popup>
              </CircleMarker>
            </LayerGroup>
          )}
        </MapContainer>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  )
}
