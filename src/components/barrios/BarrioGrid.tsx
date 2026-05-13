'use client'

import { useMemo, useState } from 'react'
import type { Barrio } from '@/lib/barrios'
import BarrioCard from './BarrioCard'
import BarrioFiltros, { type FiltrosState } from './BarrioFiltros'

const TIER_ORDER: Record<Barrio['tier'], number> = {
  premium: 0,
  consolidado: 1,
  'en-desarrollo': 2,
}

const defaultFiltros: FiltrosState = {
  tier: 'todos',
  zona: 'todas',
  loteDesdeMin: 0,
  tags: [],
}

interface Props {
  barrios: Barrio[]
}

export default function BarrioGrid({ barrios }: Props) {
  const [filtros, setFiltros] = useState<FiltrosState>(defaultFiltros)
  const [openFiltros, setOpenFiltros] = useState(false)

  const filtrados = useMemo(() => {
    return barrios
      .filter((b) => filtros.tier === 'todos' || b.tier === filtros.tier)
      .filter((b) => filtros.zona === 'todas' || b.zona === filtros.zona)
      .filter((b) => !filtros.loteDesdeMin || (b.datosDuros.medidaLoteDesde ?? 0) >= filtros.loteDesdeMin)
      .filter((b) => !filtros.tags.length || filtros.tags.every((t) => b.tags.includes(t)))
      .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])
  }, [barrios, filtros])

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <BarrioFiltros value={filtros} onChange={setFiltros} />
        </div>
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpenFiltros(true)}
          className="w-full rounded-lg border border-stone-300 bg-white py-3 text-sm font-medium text-navy-700"
        >
          Filtrar barrios
          {(filtros.tags.length || filtros.tier !== 'todos' || filtros.zona !== 'todas' || filtros.loteDesdeMin > 0) && (
            <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">activo</span>
          )}
        </button>
        {openFiltros && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpenFiltros(false)}>
            <div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-raleway text-lg font-semibold text-navy-700">Filtros</h3>
                <button
                  type="button"
                  onClick={() => setOpenFiltros(false)}
                  className="text-sm text-stone-500"
                >
                  Cerrar
                </button>
              </div>
              <BarrioFiltros value={filtros} onChange={setFiltros} />
              <button
                type="button"
                onClick={() => setOpenFiltros(false)}
                className="mt-5 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white"
              >
                Ver {filtrados.length} {filtrados.length === 1 ? 'barrio' : 'barrios'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-numeric tabular-nums text-sm text-stone-600">
            {filtrados.length} {filtrados.length === 1 ? 'barrio' : 'barrios'} encontrados
          </p>
          {(filtros.tags.length > 0 || filtros.tier !== 'todos' || filtros.zona !== 'todas' || filtros.loteDesdeMin > 0) && (
            <button
              type="button"
              onClick={() => setFiltros(defaultFiltros)}
              className="text-sm text-brand-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        {filtrados.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-10 text-center text-sm text-stone-600">
            Ningún barrio coincide con esos filtros. Probá ajustarlos.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((b) => (
              <BarrioCard key={b.slug} barrio={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
