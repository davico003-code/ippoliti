'use client'

// "Cómo se paga": el gancho de la landing. Se elige 1 o 2 dormitorios y se ven
// las tres formas lado a lado — contado, cuotas sin anticipo y el mix con
// entrega inicial — con la cuota mensual ya calculada.

import { useState } from 'react'
import { Banknote, CalendarRange, Layers } from 'lucide-react'
import { TN_PRECIOS, cuotaMensual, usd } from '@/lib/tierra-nueva'
import WaCta from './WaCta'

const OPCIONES = [
  { id: 1, label: '1 dormitorio', precios: TN_PRECIOS.unDorm },
  { id: 2, label: '2 dormitorios', precios: TN_PRECIOS.dosDorm },
] as const

export default function ComoSePaga() {
  const [sel, setSel] = useState<1 | 2>(1)
  const { precios, label } = OPCIONES.find((o) => o.id === sel)!
  const cuota = cuotaMensual(precios.financiado)
  const n = TN_PRECIOS.cuotas

  return (
    <div>
      <div role="tablist" aria-label="Tipo de departamento" className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {OPCIONES.map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={sel === o.id}
            onClick={() => setSel(o.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors md:px-7 ${
              sel === o.id ? 'bg-[#1A5C38] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {/* Cuotas sin anticipo: la estrella */}
        <article className="relative order-first flex flex-col overflow-hidden rounded-3xl bg-[#0B2A19] p-7 text-white shadow-xl md:order-none md:col-start-2 md:row-start-1 md:-my-3 md:p-8">
          <span className="absolute right-5 top-5 rounded-full bg-[#7FD1A3] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0B2A19]">
            Sin anticipo
          </span>
          <CalendarRange className="h-7 w-7 text-[#7FD1A3]" strokeWidth={1.8} />
          <h3 className="mt-4 text-lg font-bold text-white/85">
            <span className="font-numeric">{n}</span> cuotas fijas en dólares
          </h3>
          <p className="mt-4 text-sm text-white/60">Cuota mensual</p>
          <p className="font-numeric text-5xl font-black leading-none tracking-tight md:text-6xl">{usd(cuota)}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Precio financiado <span className="font-numeric font-bold text-white">{usd(precios.financiado)}</span>. Empezás a
            pagar hoy y la cuota no cambia nunca.
          </p>
          <div className="mt-auto pt-6">
            <WaCta
              origen={`pago-cuotas-${sel}d`}
              label="Quiero este plan"
              text={`Hola! Me interesa un departamento de ${label} en Tierra Nueva en ${n} cuotas fijas en dólares sin anticipo.`}
              className="w-full"
            />
          </div>
        </article>

        <article className="flex flex-col rounded-3xl border border-gray-200 bg-white p-7 md:col-start-1 md:row-start-1">
          <Banknote className="h-7 w-7 text-[#1A5C38]" strokeWidth={1.8} />
          <h3 className="mt-4 text-lg font-bold text-gray-900">De contado</h3>
          <p className="mt-4 text-sm text-gray-500">Precio final</p>
          {precios.contado ? (
            <p className="font-numeric text-4xl font-black leading-none tracking-tight text-gray-900 md:text-5xl">
              {usd(precios.contado)}
            </p>
          ) : (
            <p className="text-3xl font-black leading-none tracking-tight text-gray-900">Consultá</p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {precios.contado ? (
              <>
                El mejor precio: <span className="font-numeric font-bold text-gray-900">{usd(precios.financiado - precios.contado)}</span>{' '}
                menos que financiado.
              </>
            ) : (
              'Pagando de contado el precio baja. Pedinos el valor del día.'
            )}
          </p>
        </article>

        <article className="flex flex-col rounded-3xl border border-gray-200 bg-white p-7 md:col-start-3 md:row-start-1">
          <Layers className="h-7 w-7 text-[#1A5C38]" strokeWidth={1.8} />
          <h3 className="mt-4 text-lg font-bold text-gray-900">Entrega + cuotas</h3>
          <p className="mt-4 text-sm text-gray-500">A tu medida</p>
          <p className="text-2xl font-black leading-tight tracking-tight text-gray-900">Lo armamos juntos</p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Ponés una entrega inicial y el saldo en <span className="font-numeric">{n}</span> cuotas fijas. Cuanto más
            entregás, más baja el precio total.
          </p>
        </article>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-gray-400">
        Valores de referencia en dólares para la unidad más económica de cada tipo, con cochera incluida. Sujetos a
        disponibilidad y a cambios del desarrollador.
      </p>
    </div>
  )
}
