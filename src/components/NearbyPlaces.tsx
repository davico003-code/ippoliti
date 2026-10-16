'use client'

// Lugares cercanos (OpenStreetMap). Los pide a /api/cercanos, que consulta
// Overpass desde el servidor y lo guarda un año (ver lib/cercanos.ts): antes el
// navegador le pedía a Overpass directo y, con los servidores públicos
// saturados, todas las fichas mostraban "temporalmente no disponible".
// IntersectionObserver: la sección suele estar abajo, se pide al acercarse.
import { useEffect, useRef, useState } from 'react'
import { School, Hospital, ShoppingCart, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LugarFicha as Place } from '@/lib/cercanos'

interface CategoryDef {
  key: string
  label: string
  icon: LucideIcon
  color: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'school', label: 'Escuelas', icon: School, color: '#1A5C38' },
  { key: 'hospital', label: 'Hospitales', icon: Hospital, color: '#dc2626' },
  { key: 'supermarket', label: 'Supermercados', icon: ShoppingCart, color: '#ea580c' },
  { key: 'park', label: 'Plazas y parques', icon: Trees, color: '#16a34a' },
]

// La primera vez de una coordenada el servidor puede tardar ~20 s (Overpass).
const TIMEOUT_MS = 30000

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
  const [done, setDone] = useState(false)
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

  useEffect(() => {
    if (!visible) return
    let vivo = true
    setError(false)
    setDone(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    fetch(`/api/cercanos?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { ficha?: Record<string, Place[]> }) => { if (vivo) setPlaces(d.ficha ?? {}) })
      .catch(() => { if (vivo) setError(true) })
      .finally(() => { clearTimeout(timer); if (vivo) setDone(true) })
    return () => { vivo = false; controller.abort(); clearTimeout(timer) }
  }, [visible, lat, lng])

  const loading = visible && !done
  const hasAny = Object.values(places).some(arr => arr.length > 0)

  return (
    <div ref={rootRef}>
      {!visible && <Skeleton />}

      {visible && loading && !hasAny && <Skeleton />}

      {visible && error && (
        <p className="text-gray-400 text-sm font-poppins">
          Servicio de lugares cercanos temporalmente no disponible. Probá recargar en unos minutos.
        </p>
      )}

      {visible && done && !error && !hasAny && (
        <p className="text-gray-400 text-sm font-poppins">
          No hay escuelas, hospitales, supermercados ni plazas cargados en el mapa cerca de esta propiedad.
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
