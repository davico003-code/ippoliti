'use client'

// LA CALCULADORA DE UNA LANDING /tasar: el barrio ya está elegido (es la
// página), la persona pone los m² y la antigüedad (y el lote si lo sabe) y ve
// el valor de referencia al instante, con el margen real del barrio. Debajo,
// siempre, el pedido de la tasación a un corredor (/tasaciones).
// La cuenta es la de Hilo (lib/tasador/estimar.ts); si Hilo dice que en este
// barrio no se da número, no hay calculadora: solo el pedido (lo decide la página).

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { EDADES, estimar, porcentaje, resultado, tramoEdad } from '@/lib/tasador/estimar'
import type { ModeloTasador, ParamsTasador } from '@/lib/tasador/tipos'
import { HILO_DE, TEXTO_TIPO, type TipoTasar } from '@/lib/seo/tasar'

type Props = {
  tipo: TipoTasar
  barrio: string
  ciudad: string
  params: ParamsTasador
  modelo: Pick<ModeloTasador, 'curvaEdad' | 'beta'>
  mixto: boolean
  hrefPedido: string
}

const soloNumero = (s: string) => s.replace(/\D/g, '').slice(0, 6)
const n = (x: number) => x.toLocaleString('es-AR')
/** USD 950.000 (redondeado a 5 o 10 mil por la cuenta). */
const usd = (x: number) => `USD ${n(x)}`

export default function TasadorBarrio({ tipo, barrio, ciudad, params: p, modelo, mixto, hrefPedido }: Props) {
  const t = TEXTO_TIPO[tipo]
  const [m2, setM2] = useState(String(p.m2Tipico))
  const [lote, setLote] = useState('')
  const [edad, setEdad] = useState<number | null>(p.antTipica != null ? tramoEdad(p.antTipica) : null)
  const ids = { m2: useId(), lote: useId() }
  const metros = Number(m2) || 0
  const anios = edad != null ? EDADES[edad].anios : null
  const valor = metros > 0 ? estimar({ tipo: HILO_DE[tipo], m2: metros, lote: Number(lote) || null, ant: tipo === 'lote' ? null : anios }, p, modelo, mixto) : null
  const r = resultado(valor, p.error)
  const conTerreno = tipo === 'casa' && mixto && p.tierraM2 != null

  // Medición: la persona cambió los datos y vio un valor (una vez por página).
  const medido = useRef(false)
  useEffect(() => {
    if (medido.current || !r || (m2 === String(p.m2Tipico) && !lote)) return
    medido.current = true
    trackEvent('tasar_valor', { barrio, tipo })
  }, [r, m2, lote, p.m2Tipico, barrio, tipo])

  return (
    <div className="rounded-[22px] border border-[#E1E6E1] bg-white p-5 shadow-[0_8px_28px_rgba(18,26,21,0.06)] sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.m2} className="block text-[16px] font-bold text-[#121A15]">
            {tipo === 'lote' ? 'Metros del lote' : 'Metros cubiertos'}
          </label>
          <div className="mt-2 flex items-center gap-2.5">
            <input
              id={ids.m2}
              inputMode="numeric"
              value={m2}
              onChange={(e) => setM2(soloNumero(e.target.value))}
              className="h-[52px] w-32 rounded-[14px] border-[1.5px] border-[#E1E6E1] px-4 text-[19px] font-bold text-[#121A15] outline-none focus:border-[#17613C]"
            />
            <span className="text-[16px] font-semibold text-[#3C4A42]">m²</span>
          </div>
          <p className="mt-1.5 text-[14px] text-[#5B6B62]">
            {tipo === 'lote' ? 'El lote típico' : tipo === 'casa' ? 'La casa típica' : 'El depto típico'} en {barrio}: {n(p.m2Tipico)} m²
          </p>
        </div>
        {conTerreno && (
          <div>
            <label htmlFor={ids.lote} className="block text-[16px] font-bold text-[#121A15]">
              Metros del terreno <span className="font-medium text-[#5B6B62]">(si los sabés)</span>
            </label>
            <div className="mt-2 flex items-center gap-2.5">
              <input
                id={ids.lote}
                inputMode="numeric"
                value={lote}
                placeholder={p.loteTipico ? String(p.loteTipico) : ''}
                onChange={(e) => setLote(soloNumero(e.target.value))}
                className="h-[52px] w-32 rounded-[14px] border-[1.5px] border-[#E1E6E1] px-4 text-[19px] font-bold text-[#121A15] outline-none placeholder:font-medium placeholder:text-[#9AA59E] focus:border-[#17613C]"
              />
              <span className="text-[16px] font-semibold text-[#3C4A42]">m²</span>
            </div>
            {p.loteTipico && !lote && <p className="mt-1.5 text-[14px] text-[#5B6B62]">Si lo dejás vacío, usamos el típico del barrio: {n(p.loteTipico)} m².</p>}
          </div>
        )}
      </div>

      {tipo !== 'lote' && (
        <fieldset className="mt-5">
          <legend className="text-[16px] font-bold text-[#121A15]">Antigüedad</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {EDADES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={edad === x.id}
                onClick={() => setEdad(x.id)}
                className={`min-h-11 rounded-full border-[1.5px] px-4 text-[14.5px] font-semibold transition-colors ${edad === x.id ? 'border-[#17613C] bg-[#17613C] text-white' : 'border-[#E1E6E1] text-[#3C4A42] hover:border-[#17613C]/50'}`}
              >
                {x.texto}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div aria-live="polite" className="mt-6 rounded-[18px] bg-[#F3F7F4] p-5">
        {!r ? (
          <p className="text-[16px] font-semibold text-[#3C4A42]">Poné los metros y te mostramos el valor de referencia.</p>
        ) : (
          <>
            <p className="text-[14px] font-bold uppercase tracking-wider text-[#17613C]">Valor de referencia</p>
            <p className="mt-1 font-raleway text-[38px] font-extrabold leading-none tracking-tight text-[#121A15] sm:text-[44px]">{usd(r.valor)}</p>
            <p className="mt-2 text-[16px] font-semibold text-[#3C4A42]">
              Entre {usd(r.desde)} y {usd(r.hasta)}
            </p>
            <p className="mt-2.5 text-[14.5px] leading-snug text-[#5B6B62]">
              {p.errorPropio
                ? `Así se pide hoy en ${barrio}: la mitad de ${t.singular === 'casa' ? 'las casas publicadas' : `los ${t.plural} publicados`} está a menos de ${porcentaje(p.error)} de esta cuenta.`
                : `En ${barrio} hay pocos avisos para medirlo aparte: en los barrios de ${ciudad}, la mitad de lo publicado está a menos de ${porcentaje(p.error)} de esta cuenta.`}{' '}
              Es precio de publicación: el de venta lo fija la tasación.
            </p>
          </>
        )}
      </div>

      {/* El pedido: siempre, debajo del número. */}
      <div className="mt-4 rounded-[18px] bg-[#17613C] p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-raleway text-[20px] font-extrabold leading-tight">¿Querés vender {t.tu}?</p>
          <p className="mt-1 text-[15px] leading-snug text-white/85">Un corredor matriculado te la tasa con lo que se vendió en {barrio}. Te escribimos por WhatsApp en menos de 24 h. Sin compromiso.</p>
        </div>
        <Link
          href={hrefPedido}
          onClick={() => trackEvent('tasar_pedido_click', { barrio, tipo })}
          className="si-tap mt-4 inline-flex h-12 flex-none items-center justify-center rounded-full bg-white px-6 text-[16px] font-bold text-[#17613C] sm:mt-0"
        >
          Pedir la tasación
        </Link>
      </div>
    </div>
  )
}
