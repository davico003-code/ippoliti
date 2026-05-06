'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { events } from '@/lib/analytics'
import {
  calcularCostosIngreso,
  detectarTipoFiscal,
  getMesesDefault,
  type Moneda,
} from '@/lib/calculadora-alquiler'

interface Props {
  alquiler: number
  moneda: 'ARS' | 'USD'
  tipoPropiedad: string
}

const fmtArs = (n: number) =>
  `$ ${Math.round(n).toLocaleString('es-AR')}`
const fmtUsd = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtUsdInt = (n: number) =>
  `US$ ${Math.round(n).toLocaleString('es-AR')}`

export default function CostosIngresoMini({ alquiler, moneda, tipoPropiedad }: Props) {
  const tipoFiscal = useMemo(() => detectarTipoFiscal(tipoPropiedad), [tipoPropiedad])
  const isComercio = tipoFiscal === 'comercio'

  // Vivienda fija en 24m (default UX). Comercio inicia en 24m con toggle 24/36.
  const [mesesElegidos, setMesesElegidos] = useState<24 | 36>(24)
  const meses = isComercio ? mesesElegidos : 24

  const [cotizacion, setCotizacion] = useState<number>(1430)

  useEffect(() => {
    // cache: 'force-cache' aprovecha el HTTP cache del browser entre fichas
    // dentro de la misma sesión (cuando el usuario abre varias propiedades
    // seguidas, no se vuelve a pegar a dolarapi.com en cada una).
    // next.revalidate es no-op en client; queda anotado por si el fetch se
    // mueve a server side en el futuro.
    fetch('https://dolarapi.com/v1/dolares/oficial', { cache: 'force-cache', next: { revalidate: 3600 } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const venta = d?.venta
        if (typeof venta === 'number' && venta > 0) setCotizacion(venta)
      })
      .catch(() => {})
  }, [])

  const c = useMemo(
    () =>
      calcularCostosIngreso({
        alquiler,
        meses,
        moneda: moneda as Moneda,
        tipo: tipoFiscal,
        cotizacion,
      }),
    [alquiler, meses, moneda, tipoFiscal, cotizacion],
  )

  // Defensive: no renderizar si datos inválidos
  if (!Number.isFinite(alquiler) || alquiler <= 0) return null
  if (moneda !== 'ARS' && moneda !== 'USD') return null

  // Link a calculadora completa con prefill. Si comercio, usa la elección
  // del usuario; si vivienda, getMesesDefault() devuelve 24.
  const mesesParaLink = isComercio ? meses : getMesesDefault(tipoFiscal)
  const calculadoraHref =
    `/recursos/calculadora-alquiler` +
    `?alquiler=${alquiler}` +
    `&meses=${mesesParaLink}` +
    `&moneda=${moneda}` +
    `&tipo=${tipoFiscal}`

  const eyebrowStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--tinta-mute)',
    fontFamily: "'Raleway', system-ui, sans-serif",
  }

  return (
    <section
      aria-label="Resumen de costos iniciales"
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100"
    >
      <h2
        className="m-0 mb-4"
        style={{
          ...eyebrowStyle,
          fontSize: 12,
          color: 'var(--si-green)',
          letterSpacing: '0.1em',
        }}
      >
        Costos iniciales estimativos
      </h2>

      {isComercio && (
        <div className="mb-4">
          <p style={{ ...eyebrowStyle, marginBottom: 6 }}>Plazo del contrato</p>
          <div
            role="group"
            aria-label="Plazo del contrato"
            className="inline-grid gap-1 p-0.5 rounded-lg"
            style={{
              gridTemplateColumns: 'repeat(2, minmax(60px, 1fr))',
              background: '#FAFAF7',
              border: '1px solid var(--line)',
            }}
          >
            {([24, 36] as const).map(m => {
              const active = mesesElegidos === m
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMesesElegidos(m)}
                  className="rounded-md transition-all"
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Raleway', system-ui, sans-serif",
                    background: active ? 'var(--si-green)' : 'transparent',
                    color: active ? '#fff' : 'var(--tinta-soft)',
                    boxShadow: active ? '0 1px 3px rgba(26, 92, 56, 0.25)' : 'none',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  {m}m
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1 — Total al ingresar */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#FAFAF7', border: '1px solid var(--line)' }}
        >
          <div style={eyebrowStyle}>Total al ingresar</div>
          {moneda === 'USD' ? (
            <>
              <div
                className="font-poppins tabular-nums"
                style={{ fontSize: 22, fontWeight: 700, color: 'var(--tinta)', lineHeight: 1.1, marginTop: 6 }}
              >
                {fmtUsd(c.totalSubMonedaContrato)}
              </div>
              <div
                className="font-poppins tabular-nums"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--tinta-soft)', marginTop: 2 }}
              >
                + {fmtArs(c.totalSubARS)} en pesos
              </div>
            </>
          ) : (
            <div
              className="font-poppins tabular-nums"
              style={{ fontSize: 24, fontWeight: 700, color: 'var(--tinta)', lineHeight: 1.1, marginTop: 6 }}
            >
              {fmtArs(c.totalSubMonedaContrato)}
            </div>
          )}
          <div
            className="font-poppins"
            style={{ fontSize: 11, color: 'var(--tinta-mute)', marginTop: 6, lineHeight: 1.4 }}
          >
            primer mes + costos iniciales
          </div>
        </div>

        {/* Card 2 — Depósito en garantía (accent USD) */}
        <div
          className="rounded-xl p-4"
          style={{
            background: '#FAFAF7',
            border: '1px solid var(--line)',
            borderLeft: '3px solid var(--usd)',
          }}
        >
          <div style={{ ...eyebrowStyle, color: 'var(--usd)' }}>Depósito en garantía</div>
          <div
            className="font-poppins tabular-nums"
            style={{ fontSize: 24, fontWeight: 700, color: 'var(--tinta)', lineHeight: 1.1, marginTop: 6 }}
          >
            {fmtUsdInt(c.depositoUSD)}
          </div>
          <div
            className="font-poppins"
            style={{ fontSize: 11, color: 'var(--tinta-mute)', marginTop: 6, lineHeight: 1.4 }}
          >
            estimativo · 1 mes
          </div>
          <div
            className="font-poppins tabular-nums"
            style={{ fontSize: 12, color: 'var(--tinta-soft)', marginTop: 2 }}
          >
            ≈ {fmtArs(c.depositoEquivARS)}
          </div>
        </div>
      </div>

      <p
        className="font-poppins"
        style={{ fontSize: 11, color: 'var(--tinta-mute)', marginTop: 12, lineHeight: 1.4 }}
      >
        Valores estimativos no contractuales. Pueden cambiar sin previo aviso. Cálculo automático.
      </p>

      <Link
        href={calculadoraHref}
        onClick={() => events.fichaPropiedadCalculadoraClick()}
        className="inline-flex items-center gap-1 mt-2"
        style={{
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--si-green)',
        }}
      >
        Ver desglose completo →
      </Link>
    </section>
  )
}
