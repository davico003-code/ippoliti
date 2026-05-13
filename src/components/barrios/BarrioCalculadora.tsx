'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  scoreBarrios,
  PRESUPUESTO_OPTIONS,
  PRIORIDAD_OPTIONS,
  COMPOSICION_OPTIONS,
  type Presupuesto,
  type Prioridad,
  type Composicion,
  type BarrioMatch,
} from '@/lib/barrios/calculadora'
import BarrioImage from './BarrioImage'
import { trackEvent } from '@/lib/analytics'

type Step = 1 | 2 | 3 | 4

export default function BarrioCalculadora() {
  const [step, setStep] = useState<Step>(1)
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [prioridades, setPrioridades] = useState<Prioridad[]>([])
  const [composicion, setComposicion] = useState<Composicion | null>(null)
  const [resultados, setResultados] = useState<BarrioMatch[]>([])

  const togglePrioridad = (p: Prioridad) => {
    setPrioridades((curr) => {
      if (curr.includes(p)) return curr.filter((x) => x !== p)
      if (curr.length >= 2) return [curr[1], p]
      return [...curr, p]
    })
  }

  const calcular = () => {
    if (!presupuesto || !composicion) return
    const res = scoreBarrios({ presupuesto, prioridades, composicion })
    setResultados(res)
    setStep(4)
    trackEvent('barrios_calculadora_complete', {
      presupuesto,
      prioridades: prioridades.join(','),
      composicion,
      resultados: res.map((r) => r.barrio.slug).join(','),
    })
  }

  const reset = () => {
    setStep(1)
    setPresupuesto(null)
    setPrioridades([])
    setComposicion(null)
    setResultados([])
  }

  return (
    <div className="rounded-2xl bg-stone-50 p-6 md:p-10">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition ${
              step >= (s as Step) ? 'bg-brand-600' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Paso 1 / 3</p>
          <h3 className="mb-6 font-raleway text-2xl font-semibold text-navy-700">
            ¿Cuál es tu presupuesto para el lote?
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {PRESUPUESTO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPresupuesto(opt.value)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  presupuesto === opt.value
                    ? 'border-brand-600 bg-white shadow'
                    : 'border-stone-200 bg-white hover:border-brand-600'
                }`}
              >
                <span className="font-numeric text-lg font-medium tabular-nums text-navy-700">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!presupuesto}
            onClick={() => setStep(2)}
            className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-8"
          >
            Continuar →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Paso 2 / 3</p>
          <h3 className="mb-2 font-raleway text-2xl font-semibold text-navy-700">
            ¿Qué priorizás? (hasta 2)
          </h3>
          <p className="mb-6 text-sm text-stone-600">
            Seleccionadas: {prioridades.length}/2
          </p>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {PRIORIDAD_OPTIONS.map((opt) => {
              const active = prioridades.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => togglePrioridad(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    active
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-stone-200 bg-white hover:border-brand-600'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>{opt.emoji}</span>
                  <span className="text-xs font-medium text-navy-700">{opt.label}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-stone-300 px-6 py-3 text-sm text-stone-700"
            >
              ← Atrás
            </button>
            <button
              type="button"
              disabled={prioridades.length === 0}
              onClick={() => setStep(3)}
              className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-8"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Paso 3 / 3</p>
          <h3 className="mb-6 font-raleway text-2xl font-semibold text-navy-700">
            ¿Cómo se compone tu hogar?
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {COMPOSICION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setComposicion(opt.value)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  composicion === opt.value
                    ? 'border-brand-600 bg-white shadow'
                    : 'border-stone-200 bg-white hover:border-brand-600'
                }`}
              >
                <span className="text-base font-medium text-navy-700">{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-stone-300 px-6 py-3 text-sm text-stone-700"
            >
              ← Atrás
            </button>
            <button
              type="button"
              disabled={!composicion}
              onClick={calcular}
              className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-8"
            >
              Ver mis barrios →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-raleway text-2xl font-semibold text-navy-700">
              Tu match
            </h3>
            <button type="button" onClick={reset} className="text-sm text-brand-700 underline">
              Volver a empezar
            </button>
          </div>

          {resultados.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <p className="mb-4 text-stone-700">
                No encontramos un barrio claro con esa combinación. Hablemos directo, te orientamos
                en 10 minutos.
              </p>
              <Link
                href="https://wa.me/5493412101694?text=Hola%2C%20us%C3%A9%20la%20calculadora%20de%20barrios%20y%20quiero%20que%20me%20orienten"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white"
              >
                Hablar con un broker
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {resultados.map((r, idx) => (
                <div
                  key={r.barrio.slug}
                  className="grid gap-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200 md:grid-cols-[200px_1fr]"
                >
                  <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                    <BarrioImage
                      src={r.barrio.imagenes.hero}
                      nombre={r.barrio.nombre}
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
                      #{idx + 1} match
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-raleway text-xl font-semibold text-navy-700">
                      {r.barrio.nombre}
                    </h4>
                    <p className="mb-3 text-sm italic text-stone-600">
                      {r.barrio.miradaBroker.titular}
                    </p>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                      Recomendado porque:
                    </p>
                    <ul className="mb-4 space-y-1 text-sm text-stone-700">
                      {r.razones.map((razon) => (
                        <li key={razon} className="flex gap-2">
                          <span className="text-brand-600">✓</span>
                          <span>{razon}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/barrios-privados/${r.barrio.slug}`}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                      >
                        Ver detalle
                      </Link>
                      <Link
                        href={`https://wa.me/5493412101694?text=${encodeURIComponent(
                          `Hola, vi en la calculadora que ${r.barrio.nombre} matchea con lo que busco. ¿Me avisan cuando entren lotes?`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent('barrios_whatsapp_click', {
                            slug: r.barrio.slug,
                            ubicacion: 'calculadora',
                          })
                        }
                        className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
                      >
                        Avísenme lotes acá
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
