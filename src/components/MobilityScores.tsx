'use client'

import { useEffect, useState } from 'react'
import { Footprints, Bus, Bike } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Score {
  value: number
  label: string
  icon: LucideIcon
  color: string
}

function getLabel(score: number): string {
  if (score >= 76) return 'Excelente'
  if (score >= 51) return 'Muy bueno'
  if (score >= 26) return 'Aceptable'
  return 'Dependiente de auto'
}

export default function MobilityScores({ lat, lng }: { lat: number; lng: number }) {
  const [scores, setScores] = useState<Score[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const walkQuery = `
      node["amenity"~"supermarket|pharmacy|restaurant|bank|cafe|school"](around:500,${lat},${lng});
      node["shop"~"supermarket|convenience|bakery"](around:500,${lat},${lng});
      node["leisure"="park"](around:500,${lat},${lng});
      way["leisure"="park"](around:500,${lat},${lng});
    `
    const transitQuery = `node["highway"="bus_stop"](around:500,${lat},${lng});`
    const bikeQuery = `way["highway"="cycleway"](around:1000,${lat},${lng});`

    const queries = [
      { key: 'walk', q: `[out:json][timeout:8];(${walkQuery});out;` },
      { key: 'transit', q: `[out:json][timeout:8];(${transitQuery});out;` },
      { key: 'bike', q: `[out:json][timeout:8];(${bikeQuery});out;` },
    ]

    Promise.all(
      queries.map(({ key, q }) =>
        fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(q)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then(r => r.json())
          .then(data => ({ key, count: (data.elements || []).length }))
          .catch(() => ({ key, count: 0 }))
      )
    ).then(results => {
      const walk = results.find(r => r.key === 'walk')?.count || 0
      const transit = results.find(r => r.key === 'transit')?.count || 0
      const bike = results.find(r => r.key === 'bike')?.count || 0

      // Score: min(count * factor, 100)
      const walkScore = Math.min(Math.round(walk * 5), 100)
      const transitScore = Math.min(Math.round(transit * 12), 100)
      const bikeScore = Math.min(Math.round(bike * 8), 100)

      setScores([
        { value: walkScore, label: 'Caminabilidad', icon: Footprints, color: '#1A5C38' },
        { value: transitScore, label: 'Transporte público', icon: Bus, color: '#2563eb' },
        { value: bikeScore, label: 'Ciclabilidad', icon: Bike, color: '#ea580c' },
      ])
    }).finally(() => setLoading(false))
  }, [lat, lng])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-poppins">C&oacute;mo moverse</h2>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
          Analizando movilidad...
        </div>
      </div>
    )
  }

  if (!scores || scores.every(s => s.value === 0)) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-poppins">C&oacute;mo moverse</h2>
      <p className="text-gray-400 text-sm mb-6 font-poppins">Calculado seg&uacute;n cercan&iacute;a a servicios, transporte y ciclov&iacute;as</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {scores.map(score => {
          const Icon = score.icon
          const desc = getLabel(score.value)
          return (
            <div key={score.label} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                  <circle cx="40" cy="40" r="35" fill="none" stroke={score.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(score.value / 100) * 220} 220`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black font-numeric" style={{ color: score.color }}>{score.value}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon size={14} color={score.color} />
                <span className="text-sm font-bold text-gray-900 font-poppins">{score.label}</span>
              </div>
              <p className="text-xs text-gray-400 font-poppins">{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
