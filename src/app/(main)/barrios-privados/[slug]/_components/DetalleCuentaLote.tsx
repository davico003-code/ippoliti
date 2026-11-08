import { m2, usd } from '@/lib/cuenta-lote/calcular'
import type { CuentaDeBarrio } from '@/lib/cuenta-lote/tipos'
import TilesCuenta from '@/components/cuenta-lote/TilesCuenta'

// "La cuenta del lote" en la página del barrio (David, 8-nov-2026): para el
// lote típico del barrio, qué cuesta por mes tenerlo parado, cómo viene la
// tierra y si conviene construir. Misma estética que las otras secciones de
// la ficha del barrio (etiqueta verde + título liviano).

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

export default function DetalleCuentaLote({ cuenta, nombre }: { cuenta: CuentaDeBarrio | null; nombre: string }) {
  if (!cuenta) return null
  const { barrio, dolar, costoObraUsdM2 } = cuenta
  if (!barrio.tenencia && !barrio.tierra && !barrio.construir) return null
  const tipico = barrio.lote.tipicoUsd
    ? `Lote típico en ${nombre}: ${barrio.lote.m2Tipico ? `${m2(barrio.lote.m2Tipico)} · ` : ''}${usd(barrio.lote.tipicoUsd)}.`
    : null

  return (
    <section id="cuenta" className="scroll-mt-28 bg-white py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <span className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]" style={{ fontFamily: P }}>
          Para el que invierte
        </span>
        <h2 className="mb-3 mt-2 text-[1.5rem] leading-[1.15] text-[#0E1A14] md:text-[2rem]" style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em" }}>
          La cuenta del lote en {nombre}
        </h2>
        {tipico && (
          <p className="mb-6 text-[15px] text-[#4B5563]" style={{ fontFamily: P }}>{tipico}</p>
        )}
        <TilesCuenta
          tenencia={barrio.tenencia}
          tierra={barrio.tierra}
          construir={barrio.construir}
          nombreBarrio={nombre}
          anios={cuenta.aniosTenencia}
          detalleTenencia="Expensas del barrio, sobre el lote típico."
        />
        <p className="mt-4 text-[13px] leading-snug text-[#6B7280]" style={{ fontFamily: P }}>
          {barrio.tenencia && dolar ? `Expensas a dólar oficial de ${dolar.valor.toLocaleString('es-AR')}; sin impuesto inmobiliario ni tasas. ` : ''}
          {barrio.construir ? `Obra a ${usd(costoObraUsdM2)} el m², llave en mano. ` : ''}
          Precios publicados en el barrio, no de cierre.
        </p>
      </div>
    </section>
  )
}
