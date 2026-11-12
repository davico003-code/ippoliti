import { School, Hospital, ShoppingCart, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LugarFicha } from '@/lib/cercanos'

// La grilla de "Lugares cercanos". Sin estado ni efectos: la dibuja el servidor
// en la ficha cuando el dato ya está guardado (así Google y las IA leen "a 320 m
// de la Escuela X") y NearbyPlaces en el navegador cuando lo tiene que pedir.

export const CATEGORIAS_CERCANOS: Array<{ key: string; label: string; icon: LucideIcon; color: string }> = [
  { key: 'school', label: 'Escuelas', icon: School, color: '#1A5C38' },
  { key: 'hospital', label: 'Hospitales', icon: Hospital, color: '#dc2626' },
  { key: 'supermarket', label: 'Supermercados', icon: ShoppingCart, color: '#ea580c' },
  { key: 'park', label: 'Plazas y parques', icon: Trees, color: '#16a34a' },
]

// 3 por rubro y sin repetidos (21-oct-2026): eran 5, con nombres repetidos
// ("La Gallega" dos veces, dos sucursales) y letra de 14/12 px. Lo más cerca es
// lo que sirve para decidir.
const POR_RUBRO = 3
const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function cercanosPorRubro(items: LugarFicha[]): LugarFicha[] {
  const vistos = new Set<string>()
  return [...items]
    .sort((a, b) => a.distance - b.distance)
    .filter((p) => {
      const clave = normalizar(p.name)
      if (vistos.has(clave)) return false
      vistos.add(clave)
      return true
    })
    .slice(0, POR_RUBRO)
}

export const hayCercanos = (lugares: Record<string, LugarFicha[]> | null | undefined) =>
  !!lugares && Object.values(lugares).some((arr) => arr.length > 0)

export default function ListaCercanos({ lugares: places }: { lugares: Record<string, LugarFicha[]> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {CATEGORIAS_CERCANOS.map(cat => {
        const items = cercanosPorRubro(places[cat.key] ?? [])
        if (items.length === 0) return null
        const Icon = cat.icon
        return (
          <div key={cat.key}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}15` }}>
                <Icon size={18} color={cat.color} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 font-poppins">{cat.label}</h3>
            </div>
            <ul className="space-y-1">
              {items.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.level && (
                      <span className="px-1.5 py-0.5 text-[11px] font-bold rounded whitespace-nowrap text-white" style={{ background: p.levelColor }}>
                        {p.level}
                      </span>
                    )}
                    {p.access && (
                      <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded whitespace-nowrap ${
                        p.access === 'Privado' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.access}
                      </span>
                    )}
                    <span className="text-[15px] text-gray-800 truncate">{p.name}</span>
                  </div>
                  <span className="text-[13px] text-gray-500 font-numeric whitespace-nowrap font-poppins flex-shrink-0">{p.distance} m</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
