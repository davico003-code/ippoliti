'use client'

// Franja de la intro con la disponibilidad real: lotes a la venta por tipo,
// precio y cuota desde, y cuántos ya se vendieron. Sale del plano vivo (lo que
// publica el panel de agentes), así que se actualiza sola al publicar.
//
// Mientras carga reserva el mismo alto; si no hay datos vuelve a los números
// fijos del proyecto (159 / 21 / 180), que no dependen de la venta.

import { usePlanoVivo } from './usePlanoVivo'

const FIJOS = [
  { numero: '159', label: 'Lotes residenciales', detalle: 'Desde 450 m²' },
  { numero: '21', label: 'Lotes comerciales', detalle: 'Promedio 630 m²' },
  { numero: '180', label: 'Lotes totales', detalle: 'Barrio abierto' },
]

type Celda = { prefijo?: string; numero: string | null; label: string; detalle: string }

// Bordes por posición: en celular van de a 2 por fila; en escritorio, todas
// en una fila (4 con datos vivos, 3 con los fijos).
const BORDES: Record<number, string[]> = {
  4: ['', 'border-l', 'border-t lg:border-l lg:border-t-0', 'border-l border-t lg:border-t-0'],
  3: ['', 'border-l', 'col-span-2 border-t sm:col-span-1 sm:border-l sm:border-t-0'],
}

function Celdas({ celdas }: { celdas: Celda[] }) {
  return (
    <div className={`grid grid-cols-2 border-y border-[#345544]/20 ${celdas.length === 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {celdas.map((c, i) => (
        <div key={c.label} className={`border-[#345544]/20 px-4 py-6 odd:pl-0 sm:px-7 sm:py-9 ${BORDES[celdas.length][i]}`}>
          <p className="flex min-h-[1em] items-baseline gap-1.5 text-[clamp(34px,4.6vw,60px)] font-medium leading-none tracking-[-0.04em] text-[#345544] [font-variant-numeric:tabular-nums]">
            {c.numero == null ? (
              <span className="inline-block h-[0.85em] w-[2.4em] animate-pulse rounded bg-[#345544]/10 motion-reduce:animate-none" aria-hidden />
            ) : (
              <>
                {c.prefijo && <span className="text-[0.4em] font-semibold tracking-normal">{c.prefijo}</span>}
                {c.numero}
              </>
            )}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#345544] sm:text-base">{c.label}</p>
          <p className="mt-1 text-[13px] text-[#345544]/[0.65] sm:text-sm">{c.detalle}</p>
        </div>
      ))}
    </div>
  )
}

export default function DisponibilidadVivo() {
  const plano = usePlanoVivo()

  if (plano === null) return <Celdas celdas={FIJOS} />

  const res = plano?.residencial
  const com = plano?.comercial
  const numero = (n: number | null | undefined) => (n == null ? null : Math.round(n).toLocaleString('es-AR'))
  const celdas: Celda[] = [
    {
      numero: numero(res?.disponibles),
      label: 'Residenciales disponibles',
      detalle: `de ${res?.total ?? 159} · desde 450 m²`,
    },
    {
      numero: numero(com?.disponibles),
      label: 'Comerciales disponibles',
      detalle: `de ${com?.total ?? 21} · frente a Ruta 9`,
    },
    {
      prefijo: 'U$S',
      numero: plano ? numero(res?.desde) ?? '—' : null,
      label: 'Lote desde',
      detalle: 'Residencial, precio de lista',
    },
    {
      prefijo: 'U$S',
      numero: plano ? numero(res?.cuotaDesde) ?? '—' : null,
      label: 'Cuota desde',
      detalle: res ? `${res.fin.anticipoPct}% de entrega + ${res.fin.cuotas} cuotas fijas` : 'En cuotas fijas en dólares',
    },
  ]

  const pctVendido = plano && plano.total ? Math.round((plano.vendidos / plano.total) * 100) : 0

  return (
    <div>
      <Celdas celdas={celdas} />
      {/* Avance de la venta: solo cuando hay datos y ya se vendió algo. */}
      <div className="mt-6 min-h-[42px]" aria-live="polite">
        {plano && plano.vendidos > 0 && (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-[#345544]">
              <p>
                <span className="font-semibold [font-variant-numeric:tabular-nums]">
                  {plano.vendidos} de {plano.total} lotes
                </span>{' '}
                ya vendidos
              </p>
              {plano.actualizado && <p className="text-[13px] text-[#345544]/60">Actualizado: {plano.actualizado}</p>}
            </div>
            <div
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#345544]/[0.12]"
              role="img"
              aria-label={`${pctVendido}% de los lotes vendidos`}
            >
              <div className="h-full rounded-full bg-[#B35E21]" style={{ width: `${pctVendido}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
