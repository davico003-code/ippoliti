'use client'

// Paso 2: lo que se pide por propiedades parecidas (niveles 1-3). El nivel 4
// nunca llega acá: TasacionFlow lo manda directo al pedido (paso 3).

import type { BarrioTasacion, ComparablesResponse, TipoTasacion } from '@/lib/tasacion/types'
import { descripcionPartes, fmtMiles, TEXTO_TIPO, tituloComparables } from '@/lib/tasacion/formato'
import { BarraFija, cls, IconoFlecha, TarjetaEquipo, Volver } from './ui'

interface Props {
  resultado: ComparablesResponse
  barrio: BarrioTasacion
  tipo: TipoTasacion
  onPedir: () => void
  onVolver: () => void
  tituloRef: React.RefObject<HTMLHeadingElement>
}

const CANTIDAD_F: Record<number, string> = { 1: 'Una', 2: 'Dos', 3: 'Tres' }
const CANTIDAD_M: Record<number, string> = { 1: 'Uno', 2: 'Dos', 3: 'Tres' }

export default function Paso2Rango({ resultado: r, barrio, tipo, onPedir, onVolver, tituloRef }: Props) {
  // Sin rango no hay nada que mostrar acá (el flujo ya lo derivó al paso 3).
  if (!r.rango) return null

  const t = TEXTO_TIPO[tipo]
  const titulo = tituloComparables(r, tipo, barrio)
  const esM2 = r.unidad === 'usd_m2'
  const { min, max } = r.rango

  const textoEquipo = `El número exacto depende del estado, la orientación y lo que se vendió de verdad, no lo que se pide. Un tasador del equipo lo calcula y te lo manda por WhatsApp. Sin compromiso.`

  const partes = descripcionPartes(r, tipo, barrio)
  // n = 0: el rango sale de la referencia que relevó SI Inmobiliaria (ej. Kentucky lote),
  // no de avisos publicados. Decir "es lo que se pide" ahí sería inventar (control en prod, 5-sep-2026).
  const prefijo = r.n > 0 ? 'Es lo que se pide, ' : 'Es nuestra referencia, '
  const Las = t.las[0].toUpperCase() + t.las.slice(1)
  // Hilo manda "publicadas en agosto de 2026"; si la descripción ya dice "publicadas en <barrio>",
  // repetirlo suena a error ("publicadas en Vida, publicadas entre…"). Se saca la palabra, no el dato.
  // Lo mismo con n = 0: Hilo manda "referencia de agosto de 2026" y la descripción ya dice
  // "según el valor de referencia que relevó…" → queda solo el mes (5-sep-2026).
  const periodoLimpio = /publicad[ao]s/i.test(r.descripcion)
    ? r.periodo.replace(/^publicad[ao]s\s+/i, '')
    : /referencia/i.test(r.descripcion)
      ? r.periodo.replace(/^referencia\s+de\s+/i, '')
      : r.periodo
  const cuantas = (tipo === 'casa' ? CANTIDAD_F : CANTIDAD_M)[r.muestras.length] ?? String(r.muestras.length)
  const muestraTodas = r.muestras.length === r.n

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
        <span className="relative -top-[0.09em] text-[0.82em] font-medium text-[#6B766E]">–</span>
        <span>{fmtMiles(max)}</span>
        {esM2 && <span className="text-[0.47em] font-semibold text-[#6B766E]">el m²</span>}
      </p>
      <p className="mt-2 text-[14px] font-medium leading-[1.4] text-[#3C4A42]">
        {prefijo}
        {partes.map((p, i) =>
          p.fuerte ? (
            <b key={i} className="font-bold text-[#121A15]">
              {p.texto}
            </b>
          ) : (
            <span key={i}>{p.texto}</span>
          ),
        )}
        {r.periodo ? (
          <>
            , <b className="font-bold text-[#121A15]">{periodoLimpio}</b>
          </>
        ) : null}
        .
      </p>

      {/* Una frase en vez del gráfico de puntos (5-sep-2026): en prod las marcas apiladas
          parecían un glitch y empujaban la tarjeta del equipo debajo del botón fijo.
          Con n = 0 (referencia de SI Inmobiliaria) no se dice nada: no hay avisos que contar. */}
      {r.n >= 5 ? (
        <p className="mt-2.5 text-[13.5px] font-medium leading-[1.4] text-[#6B766E]">
          La mayoría de {t.las} <span className="font-poppins font-semibold text-[#3C4A42]">{r.n}</span> {t.plural} se pide entre estos valores.
        </p>
      ) : r.n >= 3 ? (
        <p className="mt-2.5 text-[13.5px] font-medium leading-[1.4] text-[#6B766E]">
          {Las} <span className="font-poppins font-semibold text-[#3C4A42]">{r.n}</span> {t.plural} {t.publicadas} están entre estos valores.
        </p>
      ) : null}

      {/* Muestras */}
      {r.muestras.length > 0 && (
        <>
          <ul className="mt-4 grid grid-cols-3 gap-2" aria-label={muestraTodas ? `${t.las} ${r.n} ${t.plural}, tal como están ${t.publicadas}` : `${r.muestras.length} de ${t.las} ${r.n} ${t.plural}, tal como están ${t.publicadas}`}>
            {r.muestras.map((m, i) => (
              <li key={i} className="relative overflow-hidden rounded-[14px] border-[1.5px] border-[#E1E6E1] bg-white px-2.5 pb-2.5 pt-3">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#D7E8DD]" />
                <p className="whitespace-nowrap font-poppins text-[14.5px] font-semibold tracking-[-0.01em] text-[#121A15]">
                  <span className="mr-0.5 text-[9.5px] font-bold tracking-[0.06em] text-[#17613C]">USD</span>
                  {fmtMiles(m.precio)}
                </p>
                {/* Dos líneas fijas, sin quiebres: las tres tarjetas quedan parejas. */}
                <p className="mt-1 whitespace-nowrap text-[12px] font-semibold leading-[1.35] text-[#6B766E]">
                  {tipo === 'lote' ? (
                    <>
                      {m.m2Lote != null && (
                        <>
                          <span className="font-poppins font-semibold text-[#3C4A42]">{fmtMiles(m.m2Lote)}</span> m²
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
          {/* "Tres de esas 3" sonaba a plantilla (control en prod, 5-sep-2026): si se muestran
              todas, se dice "Las 3"; si no, "Tres de las 6". */}
          <p className="mt-2 text-center text-[12px] font-medium text-[#6B766E]">
            {muestraTodas ? (
              <>
                {Las} <span className="font-poppins">{r.n}</span>, tal como están {t.publicadas}. Sin direcciones.
              </>
            ) : (
              <>
                {cuantas} de {t.las} <span className="font-poppins">{r.n}</span>, tal como están {t.publicadas}. Sin direcciones.
              </>
            )}
          </p>
        </>
      )}

      <TarjetaEquipo titulo={t.yLaTuya} texto={textoEquipo} />

      <BarraFija>
        <button type="button" onClick={onPedir} className={cls.cta}>
          Pedir mi tasación <IconoFlecha />
        </button>
        <p className={`${cls.fine} mt-1.5`}>Sin compromiso. Te lo mandamos por WhatsApp.</p>
      </BarraFija>
    </>
  )
}
