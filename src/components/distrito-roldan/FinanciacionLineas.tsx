'use client'

// Financiación por tipo de lote, como la publica el panel de agentes.
//
// Antes la landing decía "30% y 24 cuotas" para todo, pero los comerciales
// van con otra (hoy 50% y 12). Se renderiza en el servidor con los valores
// de respaldo y, si el plano vivo publicó otros, se actualiza.
//
// 22-oct-2026: sin "Cuotas desde" (regla de David: nada que ancle en el lote
// más barato). La cuenta con números está en SeccionLaCuenta.

import { FINANCIACION_DEFAULT, type FinanciacionTipo, type TipoLote } from '@/lib/distrito-roldan/financiacion'
import { usePlanoVivo } from './usePlanoVivo'

const TIPOS: { tipo: TipoLote; nombre: string }[] = [
  { tipo: 'residencial', nombre: 'Residenciales' },
  { tipo: 'comercial', nombre: 'Comerciales' },
]

function useFinanciacion(): Record<TipoLote, FinanciacionTipo> {
  const plano = usePlanoVivo()
  return plano
    ? { residencial: plano.residencial.fin, comercial: plano.comercial.fin }
    : FINANCIACION_DEFAULT
}

/** Dos tarjetas (residencial / comercial) para el cierre, con el plan y el
 *  descuento de contado. */
export function FinanciacionTarjetas() {
  const fin = useFinanciacion()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TIPOS.map(({ tipo, nombre }) => {
        const f = fin[tipo]
        return (
          <div key={tipo} className="rounded-2xl border border-white/20 bg-white/[0.06] px-5 py-5 backdrop-blur-sm sm:px-6">
            <p className="text-sm font-semibold text-dr-oro">Lotes {nombre.toLowerCase()}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-dr-claro [font-variant-numeric:tabular-nums] sm:text-[28px]">
              {f.anticipoPct}&nbsp;% + {f.cuotas}&nbsp;cuotas
            </p>
            <p className="mt-1 text-sm text-white/70">Cuotas fijas en dólares</p>
            {f.contadoTxt && (
              <p className="mt-4 border-t border-white/[0.15] pt-3 text-sm text-white/[0.85]">Contado: {f.contadoTxt}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
