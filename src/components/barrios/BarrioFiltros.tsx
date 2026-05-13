'use client'

import { useMemo } from 'react'
import type { Barrio, BarrioTier, BarrioZona } from '@/lib/barrios'
import { BARRIOS, TAG_LABELS } from '@/lib/barrios'

export interface FiltrosState {
  tier: BarrioTier | 'todos'
  zona: BarrioZona | 'todas'
  loteDesdeMin: number
  tags: string[]
}

interface Props {
  value: FiltrosState
  onChange: (next: FiltrosState) => void
}

const TIERS: { value: FiltrosState['tier']; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'premium', label: 'Premium' },
  { value: 'consolidado', label: 'Consolidado' },
  { value: 'en-desarrollo', label: 'En desarrollo' },
]

const ZONAS: { value: FiltrosState['zona']; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'funes', label: 'Funes' },
  { value: 'roldan', label: 'Roldán' },
]

const TAGS_FILTRABLES = [
  'laguna',
  'golf',
  'nautico',
  'playa',
  'tenis',
  'paddle',
  'futbol',
  'grupo-electrogeno',
  'tierras-altas',
  'lotes-grandes',
  'accesible',
  'premium',
  'consolidado',
  'diseño-estudio-bo',
]

export default function BarrioFiltros({ value, onChange }: Props) {
  const allowedTags = useMemo(() => {
    const set = new Set<string>()
    for (const b of BARRIOS as Barrio[]) for (const t of b.tags) set.add(t)
    return TAGS_FILTRABLES.filter((t) => set.has(t))
  }, [])

  const toggleTag = (tag: string) => {
    onChange({
      ...value,
      tags: value.tags.includes(tag)
        ? value.tags.filter((t) => t !== tag)
        : [...value.tags, tag],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Tipo</h4>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...value, tier: t.value })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                value.tier === t.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-brand-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Zona</h4>
        <div className="flex flex-wrap gap-2">
          {ZONAS.map((z) => (
            <button
              key={z.value}
              type="button"
              onClick={() => onChange({ ...value, zona: z.value })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                value.zona === z.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-brand-600'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Lote desde
          <span className="ml-1 font-numeric tabular-nums text-stone-700">
            {value.loteDesdeMin ? `${value.loteDesdeMin} m²` : '— sin mín'}
          </span>
        </h4>
        <input
          type="range"
          min={0}
          max={1500}
          step={100}
          value={value.loteDesdeMin}
          onChange={(e) => onChange({ ...value, loteDesdeMin: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
        <div className="mt-1 flex justify-between text-[10px] text-stone-500 font-numeric tabular-nums">
          <span>0</span>
          <span>1.500 m²</span>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Características
        </h4>
        <div className="flex flex-wrap gap-2">
          {allowedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                value.tags.includes(tag)
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-brand-600'
              }`}
            >
              {TAG_LABELS[tag] ?? tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
