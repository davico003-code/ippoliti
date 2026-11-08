import type { TokkoProperty } from '@/lib/tokko'
import { cuentaDelLote, usd } from '@/lib/cuenta-lote/calcular'
import { loteDeLaPropiedad } from '@/lib/cuenta-lote/de-propiedad'
import type { CuentaDeBarrio } from '@/lib/cuenta-lote/tipos'
import TilesCuenta from '../cuenta-lote/TilesCuenta'
import { ESTILO_TITULO_SECCION, TITULO_SECCION } from './titulo-seccion'

// "La cuenta de este lote" en la ficha (David, 8-nov-2026): lo que nadie le
// muestra al que va a invertir en un lote. Cuánto le cuesta por mes tenerlo
// parado y cuánto en cinco años como % del lote, cómo viene la tierra del
// barrio, y si le conviene construirlo. Los números por barrio vienen de Hilo
// (medianas del mercado + expensas del barrio); el precio y la expensa son los
// de este lote cuando están.

const P = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"

const MES = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })

export default function CuentaDelLote({ property, cuenta, className = '' }: { property: TokkoProperty; cuenta: CuentaDeBarrio; className?: string }) {
  const lote = loteDeLaPropiedad(property)
  const { tenencia, expensasOrigen, base } = cuentaDelLote(cuenta, lote)
  const { barrio, dolar, costoObraUsdM2 } = cuenta
  if (!tenencia && !barrio.tierra && !barrio.construir) return null

  const detalleTenencia =
    expensasOrigen === 'lote'
      ? base === 'lote' ? 'Expensas cargadas en este lote, sobre su precio.' : 'Expensas cargadas en este lote, sobre el lote típico del barrio.'
      : base === 'lote' ? 'Expensas del barrio, sobre el precio de este lote.' : 'Expensas del barrio, sobre el lote típico.'
  const actualizado = barrio.expensas.actualizado ? MES.format(new Date(`${barrio.expensas.actualizado}T12:00:00Z`)) : null

  return (
    <section id="cuenta-lote" className={className}>
      <h2 className={TITULO_SECCION} style={{ ...ESTILO_TITULO_SECCION, marginBottom: 4 }}>La cuenta de este lote</h2>
      <p className="text-[14px] mb-4" style={{ fontFamily: P, color: 'var(--tinta-mute)' }}>
        Lo que conviene saber antes de comprar un lote en {barrio.nombre}.
      </p>
      <TilesCuenta tenencia={tenencia} tierra={barrio.tierra} construir={barrio.construir} nombreBarrio={barrio.nombre} anios={cuenta.aniosTenencia} detalleTenencia={detalleTenencia} />
      <p className="mt-3 text-[13px] leading-snug" style={{ fontFamily: P, color: 'var(--tinta-mute)' }}>
        {tenencia && dolar ? `Expensas${actualizado && expensasOrigen === 'barrio' ? ` a ${actualizado}` : ''}, a dólar oficial de ${dolar.valor.toLocaleString('es-AR')}; sin impuesto inmobiliario ni tasas. ` : ''}
        {barrio.construir ? `Obra a ${usd(costoObraUsdM2)} el m², llave en mano. ` : ''}
        Precios publicados en el barrio, no de cierre.
      </p>
    </section>
  )
}
