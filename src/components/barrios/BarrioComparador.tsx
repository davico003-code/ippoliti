'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BARRIOS, type Barrio } from '@/lib/barrios'
import { trackEvent } from '@/lib/analytics'

const MAX = 3

const FEATURE_KEYS = [
  { id: 'lotes', label: 'Cantidad de lotes' },
  { id: 'desde', label: 'Lote desde' },
  { id: 'hasta', label: 'Lote hasta' },
  { id: 'ha', label: 'Hectáreas totales' },
  { id: 'rosario', label: 'Min a Rosario' },
  { id: 'golf', label: 'Golf', amenityId: 'golf' },
  { id: 'tenis', label: 'Tenis', tag: 'tenis' },
  { id: 'paddle', label: 'Pádel', tag: 'paddle' },
  { id: 'futbol', label: 'Fútbol', tag: 'futbol' },
  { id: 'laguna', label: 'Laguna', tag: 'laguna' },
  { id: 'nautico', label: 'Acceso al agua', tag: 'nautico' },
  { id: 'comercial', label: 'Centro comercial propio', tag: 'comercial' },
  { id: 'seguridad', label: 'Seguridad 24hs' },
]

function hasFeature(b: Barrio, f: (typeof FEATURE_KEYS)[number]): string {
  if (f.id === 'lotes') return b.datosDuros.cantidadLotes ? String(b.datosDuros.cantidadLotes) : '—'
  if (f.id === 'desde') return b.datosDuros.medidaLoteDesde ? `${b.datosDuros.medidaLoteDesde} m²` : '—'
  if (f.id === 'hasta') return b.datosDuros.medidaLoteHasta ? `${b.datosDuros.medidaLoteHasta} m²` : '—'
  if (f.id === 'ha') return b.datosDuros.hectareasTotales ? `${b.datosDuros.hectareasTotales}` : '—'
  if (f.id === 'rosario')
    return b.ubicacion.distanciaCentroRosarioMin
      ? `${b.ubicacion.distanciaCentroRosarioMin} min`
      : '—'
  if (f.id === 'seguridad') return b.amenities.some((a) => a.id.includes('seguridad')) ? '✓' : '—'
  if (f.tag) return b.tags.includes(f.tag) ? '✓' : '—'
  if (f.amenityId) return b.amenities.some((a) => a.id === f.amenityId) ? '✓' : '—'
  return '—'
}

interface Props {
  defaultSlugs?: string[]
}

export default function BarrioComparador({ defaultSlugs = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSlugs.slice(0, MAX))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const param = url.searchParams.get('compare')
    if (param) {
      const parsed = param.split(',').filter((s) => BARRIOS.some((b) => b.slug === s))
      if (parsed.length) setSelected(parsed.slice(0, MAX))
    }
  }, [])

  const barriosComparados = useMemo(
    () =>
      selected
        .map((slug) => (BARRIOS as Barrio[]).find((b) => b.slug === slug))
        .filter((b): b is Barrio => Boolean(b)),
    [selected],
  )

  const toggle = (slug: string) => {
    setSelected((curr) => {
      if (curr.includes(slug)) return curr.filter((s) => s !== slug)
      if (curr.length >= MAX) return [...curr.slice(1), slug]
      return [...curr, slug]
    })
  }

  const share = async () => {
    const url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set('compare', selected.join(','))
    url.hash = 'comparador'
    const link = url.toString()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackEvent('barrios_compartir_comparativa', { slugs: selected.join(',') })
    } catch {
      window.prompt('Copiá el link de la comparativa:', link)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Elegí hasta {MAX} barrios para comparar
        </h4>
        <div className="flex flex-wrap gap-2">
          {(BARRIOS as Barrio[]).map((b) => {
            const active = selected.includes(b.slug)
            const disabled = !active && selected.length >= MAX
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => toggle(b.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : disabled
                      ? 'border-stone-200 bg-stone-50 text-stone-400'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-brand-600'
                }`}
              >
                {b.nombre}
              </button>
            )
          })}
        </div>
      </div>

      {barriosComparados.length === 0 ? (
        <p className="rounded-lg bg-stone-50 p-6 text-center text-sm text-stone-600">
          Seleccioná 2 o 3 barrios para ver la comparativa lado a lado.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-stone-200 bg-stone-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Característica
                  </th>
                  {barriosComparados.map((b) => (
                    <th
                      key={b.slug}
                      className="border-b border-stone-200 bg-stone-50 px-4 py-3 text-left font-raleway text-base text-navy-700"
                    >
                      <Link
                        href={`/barrios-privados/${b.slug}`}
                        className="text-navy-700 hover:text-brand-700"
                      >
                        {b.nombre}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_KEYS.map((f, idx) => (
                  <tr key={f.id} className={idx % 2 ? 'bg-stone-50/40' : ''}>
                    <td className="border-b border-stone-100 px-4 py-3 text-stone-700">{f.label}</td>
                    {barriosComparados.map((b) => {
                      const val = hasFeature(b, f)
                      return (
                        <td
                          key={b.slug}
                          className={`border-b border-stone-100 px-4 py-3 font-numeric tabular-nums ${
                            val === '✓'
                              ? 'text-brand-700'
                              : val === '—'
                                ? 'text-stone-400'
                                : 'text-navy-700'
                          }`}
                        >
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={share}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            {copied ? '✓ Link copiado' : 'Compartir comparativa'}
          </button>
        </>
      )}
    </div>
  )
}
