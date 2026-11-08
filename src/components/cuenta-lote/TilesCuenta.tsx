import { Hammer, Hourglass, TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react'
import { diaMes, m2, pct, usd } from '@/lib/cuenta-lote/calcular'
import type { Construir, Tenencia, Tierra } from '@/lib/cuenta-lote/tipos'

// Los tres números de "La cuenta del lote", iguales en la ficha del lote y en
// la página del barrio: tenerlo parado, la tierra y construir vs comprar.
// Letra mínima 13 px (lectores mayores, regla de David). Sin React de cliente.

const P = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"
const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const VERDE = '#1A5C38'
const NUM = { fontFamily: P, fontVariantNumeric: 'tabular-nums' as const }

function Tile({ icono: Icono, titulo, numero, detalle, verde = false, ancho = false }: {
  icono: LucideIcon
  titulo: string
  numero: string
  detalle: string
  verde?: boolean
  ancho?: boolean
}) {
  const color = verde ? VERDE : 'var(--foreground)'
  return (
    <div className={`rounded-2xl p-4 ${ancho ? 'sm:col-span-2' : ''}`} style={{ background: verde ? `${VERDE}12` : '#F6F8F6' }}>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ fontFamily: P, color: verde ? VERDE : 'var(--tinta-mute)' }}>
        <Icono size={16} strokeWidth={2} aria-hidden="true" />
        {titulo}
      </p>
      <p className="mt-1.5 text-[26px] font-extrabold leading-none" style={{ ...NUM, color }}>{numero}</p>
      <p className="mt-1.5 text-[13px] leading-snug" style={{ fontFamily: R, color: verde ? VERDE : 'var(--tinta-soft)' }}>{detalle}</p>
    </div>
  )
}

export default function TilesCuenta({ tenencia, tierra, construir, nombreBarrio, anios, detalleTenencia }: {
  tenencia: Tenencia | null
  tierra: Tierra | null
  construir: Construir | null
  nombreBarrio: string
  anios: number
  /** Qué precio y qué expensa se usaron ("Expensas del barrio, sobre el precio de este lote"). */
  detalleTenencia: string
}) {
  if (!tenencia && !tierra && !construir) return null
  const IconoTierra = tierra ? (tierra.variacionPct > 0.5 ? TrendingUp : tierra.variacionPct < -0.5 ? TrendingDown : Minus) : Minus
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tenencia && (
        <Tile
          icono={Hourglass}
          titulo="Tenerlo parado"
          numero={`${usd(tenencia.mensualUsd)} /mes`}
          detalle={`${anios} años: ${usd(tenencia.cincoAniosUsd)} = ${pct(tenencia.cincoAniosPct).replace('+', '')} del lote. ${detalleTenencia}`}
        />
      )}
      {tierra && (
        <Tile
          icono={IconoTierra}
          titulo={tierra.nivel === 'barrio' ? `La tierra en ${nombreBarrio}` : 'La tierra en Funes'}
          numero={pct(tierra.variacionPct, 1)}
          detalle={`${tierra.usdM2Inicio} → ${tierra.usdM2Hoy} USD/m² de lote desde el ${diaMes(tierra.desde)}.`}
        />
      )}
      {construir && (
        <Tile
          icono={Hammer}
          titulo="Si lo construís"
          numero={pct(construir.diferenciaPct)}
          detalle={
            construir.diferenciaPct < 0
              ? `Lote típico más obra (${m2(construir.casaM2)}) sale ${usd(construir.loteMasObraUsd)}, contra ${usd(construir.casaHechaUsd)} la casa hecha típica de ${nombreBarrio}.`
              : `Lote típico más obra (${m2(construir.casaM2)}) sale ${usd(construir.loteMasObraUsd)}; la casa hecha típica de ${nombreBarrio} está en ${usd(construir.casaHechaUsd)}: acá conviene comprar hecha.`
          }
          verde
          ancho
        />
      )}
    </div>
  )
}
