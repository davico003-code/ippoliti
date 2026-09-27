'use client'

// Financiación por tipo de lote, como la publica el panel de agentes.
//
// Antes la landing decía "30% y 24 cuotas" para todo, pero los comerciales
// van con otra (hoy 50% y 12). Se renderiza en el servidor con los valores
// de respaldo y, si el plano vivo publicó otros, se actualiza.

import { FINANCIACION_DEFAULT, type FinanciacionTipo, type TipoLote } from '@/lib/distrito-roldan/financiacion'
import { usePlanoVivo, usd } from './usePlanoVivo'

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

/** Una línea por tipo, para el texto de la intro. */
export default function FinanciacionLineas({ className }: { className?: string }) {
  const fin = useFinanciacion()
  return (
    <div className={className}>
      {TIPOS.map(({ tipo, nombre }) => (
        <p key={tipo}>
          {nombre}: {fin[tipo].anticipoPct}% de entrega y {fin[tipo].cuotas} cuotas fijas en dólares.
        </p>
      ))}
    </div>
  )
}

/** Dos tarjetas (residencial / comercial) para el cierre, con el contado y la
 *  cuota desde cuando hay precios publicados. */
export function FinanciacionTarjetas() {
  const plano = usePlanoVivo()
  const fin = useFinanciacion()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TIPOS.map(({ tipo, nombre }) => {
        const f = fin[tipo]
        const cuotaDesde = plano?.[tipo].cuotaDesde
        return (
          <div key={tipo} className="border border-white/20 bg-white/[0.04] px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-[#BB8D3F]">Lotes {nombre.toLowerCase()}</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#F8F1E6] [font-variant-numeric:tabular-nums]">
              {f.anticipoPct}% + {f.cuotas} cuotas
            </p>
            <p className="mt-1 text-sm text-white/70">Cuotas fijas en dólares</p>
            <div className="mt-4 min-h-[44px] space-y-1 border-t border-white/[0.15] pt-3 text-sm text-white/[0.85]">
              {cuotaDesde != null && (
                <p>
                  Cuotas desde <span className="font-semibold [font-variant-numeric:tabular-nums]">{usd(cuotaDesde)}</span> por mes
                </p>
              )}
              {f.contadoTxt && <p>Contado: {f.contadoTxt}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
