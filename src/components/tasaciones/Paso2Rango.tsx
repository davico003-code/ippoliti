'use client'

// Paso 2: lo que se pide por propiedades parecidas. Nivel 1-3 muestra el rango;
// nivel 4 no muestra ningún número.

import type { BarrioTasacion, ComparablesResponse, TipoTasacion } from '@/lib/tasacion/types'
import { fmtMiles, TEXTO_TIPO, tituloComparables } from '@/lib/tasacion/formato'
import DotPlot from './DotPlot'
import { BarraFija, cls, IconoFlecha, TarjetaEquipo, Volver } from './ui'

interface Props {
  resultado: ComparablesResponse
  barrio: BarrioTasacion
  tipo: TipoTasacion
  onPedir: () => void
  onVolver: () => void
  tituloRef: React.RefObject<HTMLHeadingElement>
}

function valorMuestra(m: ComparablesResponse['muestras'][number], unidad: ComparablesResponse['unidad']): number {
  if (unidad === 'usd_m2' && m.m2Lote) return m.precio / m.m2Lote
  return m.precio
}

export default function Paso2Rango({ resultado: r, barrio, tipo, onPedir, onVolver, tituloRef }: Props) {
  const t = TEXTO_TIPO[tipo]
  const titulo = tituloComparables(r, tipo, barrio)
  const esM2 = r.unidad === 'usd_m2'

  const textoEquipo = `El número exacto depende del estado, la orientación y lo que se vendió de verdad, no lo que se pide. Un tasador del equipo lo calcula y te lo manda por WhatsApp. Sin compromiso.`

  if (r.nivel === 4 || !r.rango) {
    return (
      <>
        <Volver onClick={onVolver}>Cambiar datos</Volver>
        <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h2} outline-none focus-visible:outline-none`}>
          {titulo}
        </h1>
        <div className="mt-3.5 flex items-start gap-3 rounded-[18px] border-[1.5px] border-[#F3E2BF] bg-[#FFF7E8] px-3.5 py-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-[22px] w-[22px] flex-none text-[#B7791F]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <path d="M12 16.5h.01" />
          </svg>
          <p className="text-[15px] font-medium leading-[1.45] text-[#3C4A42]">
            Todavía no tenemos suficientes {t.plural} parecid{tipo === 'casa' ? 'as' : 'os'} en <b className="font-bold text-[#121A15]">{barrio.nombre}</b>. Un tasador del equipo te lo calcula.
          </p>
        </div>
        <TarjetaEquipo
          titulo={`¿Cuánto vale ${t.tuCasa}?`}
          texto={`Con lo que se vendió de verdad en ${barrio.nombre} y alrededor, no con lo que se pide. Un tasador del equipo lo calcula y te lo manda por WhatsApp. Sin compromiso.`}
        />
        <BarraFija>
          <button type="button" onClick={onPedir} className={cls.cta}>
            Pedir mi tasación <IconoFlecha />
          </button>
          <p className={`${cls.fine} mt-1.5`}>Sin compromiso. Te lo mandamos por WhatsApp.</p>
        </BarraFija>
      </>
    )
  }

  const { min, max } = r.rango
  const valores = r.precios && r.precios.length >= 2 ? r.precios : Array.from(new Set([min, max, ...r.muestras.map((m) => valorMuestra(m, r.unidad))]))
  const puntosCompletos = valores.length === r.n
  const etiquetaPlot = `${r.n} ${t.plural} entre USD ${fmtMiles(min)} y ${fmtMiles(max)}${esM2 ? ' el m²' : ''}`

  return (
    <>
      <Volver onClick={onVolver}>Cambiar datos</Volver>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h2} outline-none focus-visible:outline-none`}>
        {titulo}
      </h1>

      {/* Rango: el elemento dominante */}
      <p className="mt-3.5 flex items-baseline gap-x-1.5 whitespace-nowrap font-poppins text-[clamp(24px,8.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#121A15]">
        <span className="relative -top-px mr-0.5 text-[0.41em] font-semibold tracking-[0.1em] text-[#17613C]">USD</span>
        <span>{fmtMiles(min)}</span>
        <span className="relative -top-[0.09em] text-[0.82em] font-medium text-[#7C877F]">–</span>
        <span>{fmtMiles(max)}</span>
        {esM2 && <span className="text-[0.47em] font-semibold text-[#7C877F]">el m²</span>}
      </p>
      <p className="mt-2 text-[14px] font-medium leading-[1.4] text-[#3C4A42]">
        Es lo que se pide, {r.descripcion}
        {r.periodo ? (
          <>
            , <b className="font-bold text-[#121A15]">{r.periodo}</b>
          </>
        ) : null}
        .
      </p>

      {/* Dot plot */}
      <div className="mt-5">
        <DotPlot valores={valores} min={min} max={max} etiqueta={etiquetaPlot} />
        <p className="mt-1 text-center text-[11.5px] font-semibold text-[#7C877F]">
          {puntosCompletos ? (
            <>
              Cada punto es una de esas <span className="font-poppins">{r.n}</span> {t.plural}
            </>
          ) : (
            <>
              Entre estos valores hay <span className="font-poppins">{r.n}</span> {t.plural}; marcamos las que te mostramos abajo
            </>
          )}
        </p>
      </div>

      {/* Muestras */}
      {r.muestras.length > 0 && (
        <>
          <ul className="mt-3 grid grid-cols-3 gap-2" aria-label={`${r.muestras.length} de esas ${r.n} ${t.plural}, tal como están publicadas`}>
            {r.muestras.map((m, i) => (
              <li key={i} className="relative overflow-hidden rounded-[14px] border-[1.5px] border-[#E1E6E1] bg-white px-2.5 pb-2.5 pt-3">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#D7E8DD]" />
                <p className="whitespace-nowrap font-poppins text-[14.5px] font-semibold tracking-[-0.01em] text-[#121A15]">
                  <span className="mr-0.5 text-[9.5px] font-bold tracking-[0.06em] text-[#17613C]">USD</span>
                  {fmtMiles(m.precio)}
                </p>
                <p className="mt-1 text-[12px] font-semibold leading-[1.35] text-[#7C877F]">
                  {tipo === 'lote' ? (
                    <>
                      {m.m2Lote != null && (
                        <>
                          <span className="font-poppins font-semibold text-[#3C4A42]">{fmtMiles(m.m2Lote)}</span> m² de lote
                          <br />
                        </>
                      )}
                      {m.m2Lote ? (
                        <>
                          USD <span className="font-poppins font-semibold text-[#3C4A42]">{fmtMiles(m.precio / m.m2Lote)}</span>/m²
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {m.m2Cubiertos != null && (
                        <>
                          <span className="font-poppins font-semibold text-[#3C4A42]">{fmtMiles(m.m2Cubiertos)}</span> m² cub.
                          <br />
                        </>
                      )}
                      {m.dormitorios != null && (
                        <>
                          <span className="font-poppins font-semibold text-[#3C4A42]">{m.dormitorios}</span> dormitorio{m.dormitorios === 1 ? '' : 's'}
                        </>
                      )}
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-center text-[12px] font-medium text-[#7C877F]">
            {r.muestras.length === 3 ? 'Tres' : r.muestras.length === 2 ? 'Dos' : 'Una'} de esas <span className="font-poppins">{r.n}</span>, tal como están publicadas. Sin direcciones.
          </p>
        </>
      )}

      <TarjetaEquipo titulo={tipo === 'casa' ? '¿Y la tuya?' : '¿Y el tuyo?'} texto={textoEquipo} />

      <BarraFija>
        <button type="button" onClick={onPedir} className={cls.cta}>
          Pedir mi tasación <IconoFlecha />
        </button>
        <p className={`${cls.fine} mt-1.5`}>Sin compromiso. Te lo mandamos por WhatsApp.</p>
      </BarraFija>
    </>
  )
}
