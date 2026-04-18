'use client'

import { useEffect, useState } from 'react'
import { School, Hospital, ShoppingCart, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Place {
  name: string
  distance: number
  category: string
  level?: string
  levelColor?: string
  access?: 'Público' | 'Privado'
}

interface CategoryDef {
  key: string
  label: string
  icon: LucideIcon
  color: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'school', label: 'Escuelas', icon: School, color: '#1A5C38' },
  { key: 'private_school', label: 'Colegios privados', icon: School, color: '#7c3aed' },
  { key: 'hospital', label: 'Hospitales', icon: Hospital, color: '#dc2626' },
  { key: 'supermarket', label: 'Supermercados', icon: ShoppingCart, color: '#ea580c' },
  { key: 'park', label: 'Plazas y parques', icon: Trees, color: '#16a34a' },
]

const PRIVATE_PATTERNS = /\b(san |santa |sagrado|nuestra|instituto|colegio|privad|parish|parroquial)/i

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function NearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
  const [places, setPlaces] = useState<Record<string, Place[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Schools in 2km (to catch private schools), rest in 1km
    const overpassQuery = `[out:json][timeout:10];(
      node["amenity"="school"](around:2000,${lat},${lng});
      way["amenity"="school"](around:2000,${lat},${lng});
      node["amenity"="hospital"](around:1000,${lat},${lng});
      way["amenity"="hospital"](around:1000,${lat},${lng});
      node["shop"="supermarket"](around:1000,${lat},${lng});
      way["shop"="supermarket"](around:1000,${lat},${lng});
      node["leisure"="park"](around:1000,${lat},${lng});
      way["leisure"="park"](around:1000,${lat},${lng});
    );out center 60;`

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ]
    const fetchWithFallback = async () => {
      for (const url of endpoints) {
        try {
          const r = await fetch(url, {
            method: 'POST',
            body: `data=${encodeURIComponent(overpassQuery)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          if (!r.ok) continue
          return await r.json()
        } catch { /* try next mirror */ }
      }
      throw new Error('All Overpass mirrors failed')
    }

    fetchWithFallback()
      .then(data => {
        const result: Record<string, Place[]> = {}
        for (const cat of CATEGORIES) result[cat.key] = []

        for (const el of data.elements || []) {
          const tags = el.tags || {}
          const elLat = el.lat ?? el.center?.lat
          const elLng = el.lon ?? el.center?.lon
          if (!elLat || !elLng) continue

          const name = tags.name
          if (!name) continue

          const dist = Math.round(haversineMeters(lat, lng, elLat, elLng))

          if (tags.amenity === 'school') {
            const isPrivate = tags['operator:type'] === 'private' || PRIVATE_PATTERNS.test(name)
            const access: 'Público' | 'Privado' = isPrivate ? 'Privado' : 'Público'

            // Determine education level
            const isced = tags['isced:level'] || tags['school:type'] || ''
            const nameLower = name.toLowerCase()
            let level = 'Escuela'
            let levelColor = '#6b7280'
            if (/jard[ií]n|inicial|infantil|preescolar/i.test(nameLower) || isced === '0') {
              level = 'Inicial'; levelColor = '#16a34a'
            } else if (/primari[ao]|elemental/i.test(nameLower) || isced === '1') {
              level = 'Primario'; levelColor = '#2563eb'
            } else if (/secundari[ao]|bachiller|t[eé]cnic|medio/i.test(nameLower) || isced === '2' || isced === '3') {
              level = 'Secundario'; levelColor = '#ea580c'
            } else if (/universid|facultad|instituto\s+(superior|terciario)/i.test(nameLower) || isced === '4' || isced === '5' || isced === '6') {
              level = 'Terciario'; levelColor = '#7c3aed'
            }

            const entry: Place = { name, distance: dist, category: 'school', level, levelColor, access }

            if (isPrivate) {
              result.private_school.push({ ...entry, category: 'private_school' })
            }
            if (dist <= 1000) {
              result.school.push(entry)
            }
          } else if (tags.amenity === 'hospital') {
            result.hospital.push({ name, distance: dist, category: 'hospital' })
          } else if (tags.shop === 'supermarket') {
            result.supermarket.push({ name, distance: dist, category: 'supermarket' })
          } else if (tags.leisure === 'park') {
            result.park.push({ name, distance: dist, category: 'park' })
          }
        }

        for (const key of Object.keys(result)) {
          result[key].sort((a, b) => a.distance - b.distance)
          result[key] = result[key].slice(0, 5)
        }

        setPlaces(result)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lat, lng])

  const hasAny = Object.values(places).some(arr => arr.length > 0)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-poppins">Lugares cercanos</h2>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
          Buscando lugares cercanos...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1 font-poppins">Lugares cercanos</h2>
        <p className="text-gray-400 text-sm font-poppins">Servicio de lugares cercanos temporalmente no disponible. Probá recargar en unos minutos.</p>
      </div>
    )
  }
  if (!hasAny) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-poppins">Lugares cercanos</h2>
      <p className="text-gray-400 text-sm mb-6 font-poppins">Escuelas, hospitales, comercios y espacios verdes en la zona</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {CATEGORIES.filter(c => places[c.key]?.length > 0).map(cat => {
          const Icon = cat.icon
          return (
            <div key={cat.key}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}15` }}>
                  <Icon size={18} color={cat.color} strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 font-poppins">{cat.label}</h3>
                {cat.key === 'private_school' && (
                  <span className="text-[10px] text-gray-400 font-poppins">hasta 2 km</span>
                )}
              </div>
              <ul className="space-y-1">
                {places[cat.key].map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {p.level && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded whitespace-nowrap text-white" style={{ background: p.levelColor }}>
                          {p.level}
                        </span>
                      )}
                      {p.access && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded whitespace-nowrap ${
                          p.access === 'Privado' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.access}
                        </span>
                      )}
                      <span className="text-sm text-gray-700 truncate">{p.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-numeric whitespace-nowrap font-poppins flex-shrink-0">{p.distance} m</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
