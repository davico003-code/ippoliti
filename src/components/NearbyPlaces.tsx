'use client'

import { useEffect, useState } from 'react'

interface Place {
  name: string
  distance: number
  category: string
}

interface CategoryDef {
  key: string
  label: string
  emoji: string
  query: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'school', label: 'Escuelas', emoji: '🏫', query: 'amenity=school' },
  { key: 'hospital', label: 'Hospitales', emoji: '🏥', query: 'amenity=hospital' },
  { key: 'supermarket', label: 'Supermercados', emoji: '🛒', query: 'shop=supermarket' },
  { key: 'park', label: 'Plazas y parques', emoji: '🌳', query: 'leisure=park' },
]

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
    const queries = CATEGORIES.map(c => {
      const [tag, val] = c.query.split('=')
      return `node["${tag}"="${val}"](around:1000,${lat},${lng});way["${tag}"="${val}"](around:1000,${lat},${lng});`
    }).join('')

    const overpassQuery = `[out:json][timeout:10];(${queries});out center 50;`

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(r => r.json())
      .then(data => {
        const result: Record<string, Place[]> = {}

        for (const cat of CATEGORIES) {
          result[cat.key] = []
        }

        for (const el of data.elements || []) {
          const tags = el.tags || {}
          const elLat = el.lat ?? el.center?.lat
          const elLng = el.lon ?? el.center?.lon
          if (!elLat || !elLng) continue

          const name = tags.name
          if (!name) continue

          const dist = Math.round(haversineMeters(lat, lng, elLat, elLng))

          if (tags.amenity === 'school') result.school.push({ name, distance: dist, category: 'school' })
          else if (tags.amenity === 'hospital') result.hospital.push({ name, distance: dist, category: 'hospital' })
          else if (tags.shop === 'supermarket') result.supermarket.push({ name, distance: dist, category: 'supermarket' })
          else if (tags.leisure === 'park') result.park.push({ name, distance: dist, category: 'park' })
        }

        // Sort by distance and limit
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-poppins">Lugares cercanos</h2>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
          Buscando lugares cercanos...
        </div>
      </div>
    )
  }

  if (error || !hasAny) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-poppins">Lugares cercanos</h2>
      <p className="text-gray-400 text-sm mb-5 font-poppins">En un radio de 1 km</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CATEGORIES.filter(c => places[c.key]?.length > 0).map(cat => (
          <div key={cat.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.emoji}</span>
              <h3 className="text-sm font-bold text-[#1A5C38] uppercase tracking-wide font-poppins">{cat.label}</h3>
            </div>
            <ul className="space-y-2">
              {places[cat.key].map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  <span className="text-xs text-gray-400 font-numeric whitespace-nowrap font-poppins">{p.distance} m</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
