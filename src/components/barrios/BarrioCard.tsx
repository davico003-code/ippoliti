'use client'

import Link from 'next/link'
import type { Barrio } from '@/lib/barrios'
import { TAG_LABELS } from '@/lib/barrios'
import BarrioImage from './BarrioImage'

const TIER_LABEL: Record<Barrio['tier'], { label: string; cls: string }> = {
  premium: { label: 'Premium', cls: 'bg-gold-500 text-navy-900' },
  consolidado: { label: 'Consolidado', cls: 'bg-brand-600 text-white' },
  'en-desarrollo': { label: 'En desarrollo', cls: 'bg-stone-200 text-stone-800' },
}

interface Props {
  barrio: Barrio
  showRazones?: string[]
}

export default function BarrioCard({ barrio, showRazones }: Props) {
  const tier = TIER_LABEL[barrio.tier]
  return (
    <Link
      href={`/barrios-privados/${barrio.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <BarrioImage
          src={barrio.imagenes.hero}
          nombre={barrio.nombre}
          className="object-cover transition group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${tier.cls}`}
        >
          {tier.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-raleway text-xl font-semibold text-navy-700">{barrio.nombre}</h3>
        <p className="text-sm leading-relaxed text-stone-600 line-clamp-2">
          {barrio.miradaBroker.titular}
        </p>

        {showRazones && showRazones.length > 0 && (
          <ul className="space-y-1 text-sm text-brand-700">
            {showRazones.slice(0, 3).map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-brand-600">✓</span>
                <span className="flex-1">{r}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-xs">
          {barrio.datosDuros.cantidadLotes && (
            <div>
              <dt className="text-stone-500">Lotes</dt>
              <dd className="font-numeric font-medium tabular-nums text-navy-700">
                {barrio.datosDuros.cantidadLotes}
              </dd>
            </div>
          )}
          {barrio.datosDuros.medidaLoteDesde && (
            <div>
              <dt className="text-stone-500">Desde</dt>
              <dd className="font-numeric font-medium tabular-nums text-navy-700">
                {barrio.datosDuros.medidaLoteDesde} m²
              </dd>
            </div>
          )}
          {barrio.datosDuros.hectareasTotales && (
            <div>
              <dt className="text-stone-500">Ha</dt>
              <dd className="font-numeric font-medium tabular-nums text-navy-700">
                {barrio.datosDuros.hectareasTotales}
              </dd>
            </div>
          )}
        </dl>

        {barrio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {barrio.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-700"
              >
                {TAG_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        )}

        <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:gap-2 transition-all">
          Ver barrio →
        </span>
      </div>
    </Link>
  )
}
