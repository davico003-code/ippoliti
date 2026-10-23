'use client'

// "Hacé la cuenta": cómo se paga un lote, con números reales del plano vivo.
//
// Reemplaza a la franja de la intro que mostraba "Lote desde" y "Cuota desde"
// (22-oct-2026, David: "no pongas lote desde porque en realidad queda uno solo
// barato y me lo tirás abajo"). El ejemplo es el lote que MÁS se repite entre
// los disponibles (loteTipico), con su entrega y su cuota. Es el mismo número
// que usan los anuncios ("se entra con USD 13.680"), así quien llega desde un
// anuncio encuentra lo que vio.
//
// Abajo, las 24 cuotas como una tira con la marca del fin de obra: para quien
// firma este mes, en qué cuota el barrio ya está terminado. Las fechas se
// calculan en el navegador (la página es ISR y puede servirse otro mes).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FINANCIACION_DEFAULT, FIN_DE_OBRA, cuotaDelFinDeObra } from '@/lib/distrito-roldan/financiacion'
import { usePlanoVivo } from './usePlanoVivo'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const mesDe = (base: Date, cuota: number) => {
  const d = new Date(base.getFullYear(), base.getMonth() + cuota, 1)
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}
const num = (n: number) => Math.round(n).toLocaleString('es-AR')

function Monto({ valor, className }: { valor: number | null | undefined; className: string }) {
  return (
    <p className={`flex items-baseline gap-2 font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums] ${className}`}>
      <span className="text-[0.36em] font-bold tracking-normal">USD</span>
      {valor == null ? (
        <span className="inline-block h-[0.8em] w-[3.2em] animate-pulse rounded-lg bg-current opacity-10 motion-reduce:animate-none" aria-hidden />
      ) : (
        num(valor)
      )}
    </p>
  )
}

export default function SeccionLaCuenta() {
  const plano = usePlanoVivo()
  const res = plano?.residencial
  const fin = res?.fin ?? FINANCIACION_DEFAULT.residencial
  const tipico = res?.tipico
  // undefined = cargando; null = el plano no respondió (se muestra la regla sin montos).
  const sinMontos = plano === null || (plano !== undefined && !tipico)

  const [hoy, setHoy] = useState<Date | null>(null)
  useEffect(() => setHoy(new Date()), [])
  const cuotaFin = hoy ? cuotaDelFinDeObra(hoy, fin.cuotas) : null

  return (
    <section id="proyecto" className="relative overflow-hidden bg-dr-fondo px-6 py-20 md:py-32">
      <div aria-hidden className="absolute -right-24 top-16 h-96 w-96 text-dr-tinta/[0.07]">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="5">
          <path d="M98 101C57 94 30 65 24 24c41 6 70 33 74 77Z" />
          <path d="M103 97c7-40 36-67 77-72-7 41-35 69-77 72Z" />
          <path d="M101 106c39 9 64 39 67 80-40-9-66-38-67-80Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,540px)] lg:items-center lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-etiqueta">Hacé la cuenta</p>
            <h2 className="mt-5 max-w-[16ch] text-balance text-[clamp(38px,5.4vw,76px)] font-extrabold leading-[1] tracking-[-0.035em] text-dr-tinta">
              Entrás con el {fin.anticipoPct}&nbsp;%. Lo demás, en {fin.cuotas} cuotas fijas en dólares.
            </h2>
            <p className="mt-7 max-w-[50ch] text-pretty text-lg leading-8 text-dr-tinta/80">
              Financiación propia del desarrollo: la cuota no cambia de la primera a la última. Y como es un barrio abierto,
              no hay expensas.
            </p>
          </div>

          {/* El ticket: un lote real del plano, con sus tres números. */}
          <div className="rounded-[32px] bg-dr-superficie p-7 shadow-[0_40px_90px_-40px_rgba(52,85,68,.55)] ring-1 ring-dr-tinta/[0.08] sm:p-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-dr-tinta/25 pb-5">
              <p className="text-sm font-bold text-dr-etiqueta">
                {sinMontos ? 'Lotes residenciales' : `Ejemplo · lote de ${tipico?.sup ? `${num(tipico.sup)} m²` : 'tipo'}`}
              </p>
              {!sinMontos && (
                <p className="text-sm text-dr-tinta/70 [font-variant-numeric:tabular-nums]">
                  Precio de lista {tipico ? `USD ${num(tipico.precio)}` : '…'}
                </p>
              )}
            </div>

            <div className="py-7">
              <p className="text-sm font-semibold text-dr-tinta/70">Entrega del {fin.anticipoPct}&nbsp;%</p>
              {sinMontos ? (
                <p className="mt-2 text-[clamp(40px,5vw,64px)] font-extrabold leading-none tracking-[-0.04em] text-dr-tinta">{fin.anticipoPct}&nbsp;%</p>
              ) : (
                <Monto valor={tipico?.entrega} className="mt-2 text-[clamp(44px,6vw,76px)] text-dr-tinta" />
              )}
            </div>

            <div className="border-t border-dr-tinta/[0.12] pt-7">
              <p className="text-sm font-semibold text-dr-tinta/70">+ {fin.cuotas} cuotas fijas de</p>
              {sinMontos ? (
                <p className="mt-2 text-[clamp(32px,4vw,48px)] font-extrabold leading-none tracking-[-0.035em] text-dr-acento">en dólares</p>
              ) : (
                <div className="mt-2 flex items-baseline gap-2">
                  <Monto valor={tipico?.cuota} className="text-[clamp(40px,5.2vw,64px)] text-dr-acento" />
                  <span className="text-base font-semibold text-dr-acento/80">por mes</span>
                </div>
              )}
            </div>

            {fin.contadoTxt && (
              <p className="mt-7 rounded-2xl bg-dr-fondo px-4 py-3 text-sm text-dr-tinta">
                <span className="font-bold">Pagando de contado:</span> {fin.contadoTxt}.
              </p>
            )}

            <Link
              href="/distrito-roldan-precios"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-dr-tinta underline decoration-dr-acento decoration-2 underline-offset-[6px] transition-colors hover:text-dr-acento"
            >
              Cada lote tiene su cuenta: miralos en el plano
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Las cuotas como tira, con el fin de obra marcado. */}
        <div className="mt-20 md:mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-[clamp(22px,2.6vw,34px)] font-bold leading-tight tracking-[-0.02em] text-dr-tinta">
              {cuotaFin && cuotaFin <= fin.cuotas / 2
                ? 'Antes de la mitad de las cuotas, el barrio ya está terminado.'
                : cuotaFin
                  ? `En la cuota ${cuotaFin}, el barrio ya está terminado.`
                  : 'Tu plan, mes a mes.'}
            </p>
            <p className="text-sm text-dr-tinta/60">Si firmás este mes</p>
          </div>

          <div className="relative mt-14 flex items-stretch gap-1.5 sm:gap-2">
            <div className="flex w-14 shrink-0 items-center justify-center rounded-lg bg-dr-tinta text-[10px] font-bold uppercase text-dr-fondo sm:w-24 sm:text-xs sm:tracking-wide">
              Entrega
            </div>
            <ol className="relative grid flex-1 gap-[3px] sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${fin.cuotas}, minmax(0, 1fr))` }}>
              {Array.from({ length: fin.cuotas }, (_, i) => {
                const n = i + 1
                const esFin = n === cuotaFin
                return (
                  <li
                    key={n}
                    aria-label={`Cuota ${n}${hoy ? `, ${mesDe(hoy, n)}` : ''}${esFin ? `: barrio terminado` : ''}`}
                    className={`relative h-12 rounded-md transition-colors sm:h-16 ${esFin ? 'bg-[#B35E21]' : cuotaFin && n < cuotaFin ? 'bg-dr-tinta/45' : 'bg-dr-tinta/20'}`}
                  >
                    {esFin && (
                      <span
                        className={`absolute bottom-full mb-2 flex flex-col ${
                          n <= 4 ? 'left-0 items-start' : n > fin.cuotas - 4 ? 'right-0 items-end' : 'left-1/2 -translate-x-1/2 items-center'
                        }`}
                      >
                        <span className="whitespace-nowrap rounded-full bg-[#B35E21] px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:text-sm">
                          {FIN_DE_OBRA.texto[0].toUpperCase() + FIN_DE_OBRA.texto.slice(1)} · barrio terminado
                        </span>
                        <span className="h-2 w-px bg-[#B35E21]" />
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="mt-3 flex justify-between pl-[62px] text-xs text-dr-tinta/60 [font-variant-numeric:tabular-nums] sm:pl-[104px] sm:text-sm">
            <span>Cuota 1{hoy ? ` · ${mesDe(hoy, 1)}` : ''}</span>
            <span>
              Cuota {fin.cuotas}
              {hoy ? ` · ${mesDe(hoy, fin.cuotas)}` : ''}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
