'use client'

// Nearby places via Overpass (OpenStreetMap).
// Optimizations:
//   • 4 parallel per-category fetches → each category renders as it arrives
//     (streaming visual).
//   • localStorage cache per coordinate bucket (4 decimals) with 1h TTL.
//   • IntersectionObserver — the component waits to fetch until it enters
//     the viewport (the section often lives below the fold).
//   • 5s timeout per request via AbortController.
//   • Fallback mirror (overpass.kumi.systems) on 5xx / network errors.
//   • Skeleton loader instead of spinner.
import { useEffect, useRef, useState } from 'react'
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
  /** Overpass radius in meters. */
  radius: number
  /** Overpass tag filter for both node+way queries. */
  overpass: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'school', label: 'Escuelas', icon: School, color: '#1A5C38', radius: 2000, overpass: 'amenity=school' },
  { key: 'hospital', label: 'Hospitales', icon: Hospital, color: '#dc2626', radius: 1000, overpass: 'amenity=hospital' },
  { key: 'supermarket', label: 'Supermercados', icon: ShoppingCart, color: '#ea580c', radius: 1000, overpass: 'shop=supermarket' },
  { key: 'park', label: 'Plazas y parques', icon: Trees, color: '#16a34a', radius: 1000, overpass: 'leisure=park' },
]

const PRIVATE_PATTERNS = /\b(san |santa |sagrado|nuestra|instituto|colegio|privad|parish|parroquial)/i
const TIMEOUT_MS = 5000
const CACHE_TTL_MS = 60 * 60 * 1000 // 1h
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
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

function cacheKey(lat: number, lng: number, catKey: string) {
  return `si_nearby_${catKey}_${lat.toFixed(4)}_${lng.toFixed(4)}`
}
function readCache(key: string): Place[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { t: number; v: Place[] }
    if (!parsed || typeof parsed.t !== 'number') return null
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null
    return parsed.v
  } catch { return null }
}
function writeCache(key: string, places: Place[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: places }))
  } catch { /* quota */ }
}

function queryFor(cat: CategoryDef, lat: number, lng: number): string {
  const [k, v] = cat.overpass.split('=')
  return `[out:json][timeout:8];(node["${k}"="${v}"](around:${cat.radius},${lat},${lng});way["${k}"="${v}"](around:${cat.radius},${lat},${lng}););out center 30;`
}

async function fetchCategory(cat: CategoryDef, lat: number, lng: number, signal: AbortSignal): Promise<Place[]> {
  const key = cacheKey(lat, lng, cat.key)
  const cached = readCache(key)
  if (cached) return cached

  const body = `data=${encodeURIComponent(queryFor(cat, lat, lng))}`
  let data: { elements?: Array<{ tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }> } | null = null

  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal,
      })
      if (!r.ok) continue
      data = await r.json()
      break
    } catch { /* try next */ }
  }
  if (!data || !Array.isArray(data.elements)) return []

  const places: Place[] = []
  for (const el of data.elements) {
    const tags = el.tags || {}
    const elLat = el.lat ?? el.center?.lat
    const elLng = el.lon ?? el.center?.lon
    if (!elLat || !elLng) continue
    const name = tags.name
    if (!name) continue
    const dist = Math.round(haversineMeters(lat, lng, elLat, elLng))

    if (cat.key === 'school') {
      const isPrivate = tags['operator:type'] === 'private' || PRIVATE_PATTERNS.test(name)
      const access: 'Público' | 'Privado' = isPrivate ? 'Privado' : 'Público'
      const isced = tags['isced:level'] || tags['school:type'] || ''
      const nameLower = name.toLowerCase()
      let level = 'Escuela'
      let levelColor = '#6b7280'
      if (/jard[ií]n|inicial|infantil|preescolar/i.test(nameLower) || isced === '0') { level = 'Inicial'; levelColor = '#16a34a' }
      else if (/primari[ao]|elemental/i.test(nameLower) || isced === '1') { level = 'Primario'; levelColor = '#2563eb' }
      else if (/secundari[ao]|bachiller|t[eé]cnic|medio/i.test(nameLower) || isced === '2' || isced === '3') { level = 'Secundario'; levelColor = '#ea580c' }
      else if (/universid|facultad|instituto\s+(superior|terciario)/i.test(nameLower) || isced === '4' || isced === '5' || isced === '6') { level = 'Terciario'; levelColor = '#7c3aed' }
      places.push({ name, distance: dist, category: 'school', level, levelColor, access })
    } else {
      places.push({ name, distance: dist, category: cat.key })
    }
  }
  places.sort((a, b) => a.distance - b.distance)
  const top = places.slice(0, 5)
  writeCache(key, top)
  return top
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {CATEGORIES.map((c, i) => (
        <div key={i}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map(j => (
              <div key={j} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="h-3 w-40 bg-gray-100 rounded" />
                <div className="h-3 w-10 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [places, setPlaces] = useState<Record<string, Place[]>>({})
  const [doneCats, setDoneCats] = useState<Set<string>>(new Set())
  const [error, setError] = useState(false)

  // Lazy: only fetch once the section enters the viewport
  useEffect(() => {
    if (visible) return
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        setVisible(true)
        io.disconnect()
      }
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  // Fetch categories in parallel with a timeout, stream results as they arrive
  useEffect(() => {
    if (!visible) return
    setError(false)
    setDoneCats(new Set())
    setPlaces({})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const tasks = CATEGORIES.map(cat =>
      fetchCategory(cat, lat, lng, controller.signal)
        .then(result => {
          setPlaces(prev => ({ ...prev, [cat.key]: result }))
          setDoneCats(prev => { const next = new Set(prev); next.add(cat.key); return next })
        })
        .catch(() => {
          setDoneCats(prev => { const next = new Set(prev); next.add(cat.key); return next })
        })
    )

    Promise.allSettled(tasks).finally(() => {
      clearTimeout(timer)
      // If nothing came back and none of the cats had cache, flag error.
      setPlaces(current => {
        const any = Object.values(current).some(arr => arr.length > 0)
        if (!any) setError(true)
        return current
      })
    })

    return () => { controller.abort(); clearTimeout(timer) }
  }, [visible, lat, lng])

  const loading = visible && doneCats.size < CATEGORIES.length
  const hasAny = Object.values(places).some(arr => arr.length > 0)

  return (
    <div ref={rootRef}>
      {!visible && <Skeleton />}

      {visible && loading && !hasAny && <Skeleton />}

      {visible && error && !hasAny && (
        <p className="text-gray-400 text-sm font-poppins">
          Servicio de lugares cercanos temporalmente no disponible. Probá recargar en unos minutos.
        </p>
      )}

      {visible && hasAny && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {CATEGORIES.map(cat => {
            const items = places[cat.key]
            if (!items || items.length === 0) return null
            const Icon = cat.icon
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}15` }}>
                    <Icon size={18} color={cat.color} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 font-poppins">{cat.label}</h3>
                </div>
                <ul className="space-y-1">
                  {items.map((p, i) => (
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
      )}
    </div>
  )
}
