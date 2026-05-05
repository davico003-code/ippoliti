'use client'

import {
  type Moneda,
  type TipoFiscal,
  type CalcularOutput,
} from '@/lib/calculadora-alquiler'

type Frecuencia = 'trimestral' | 'cuatrimestral'
type Indice = 'ICL' | 'IPC'

interface Props {
  alquiler: number
  meses: number
  moneda: Moneda
  tipo: TipoFiscal
  frecuencia: Frecuencia
  indice: Indice
  c: CalcularOutput
}

const fmtArs = (n: number) =>
  `$ ${Math.round(n).toLocaleString('es-AR')}`
const fmtUsd = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtUsdInt = (n: number) =>
  `US$ ${Math.round(n).toLocaleString('es-AR')}`
const fmt = (n: number, m: Moneda) => (m === 'USD' ? fmtUsd(n) : fmtArs(n))

const WHATSAPP_ADMIN_NUM = '5493413415159'
const WHATSAPP_ADMIN_DISPLAY = '+54 9 341 341 5159'

// Hex inlineados — html2canvas trabaja mejor sin var() para captura estática.
const C = {
  green: '#1A5C38',
  greenDark: '#0F3D24',
  usd: '#0E4A7B',
  tinta: '#1C1C1E',
  tintaSoft: '#4A4845',
  tintaMute: '#8B847A',
  line: '#E5DFD2',
  cream: '#FAFAF7',
  creamFooter: '#F4EEDF',
  warnBg: '#FFF8E6',
  warnBorder: '#D4A93B',
  warnText: '#6B5316',
  warnTextDark: '#4A3A0F',
} as const

const FONT_BODY = "'Raleway', system-ui, sans-serif"
const FONT_NUM = "'Poppins', system-ui, sans-serif"

export default function ResumenStory({
  alquiler,
  meses,
  moneda,
  tipo,
  frecuencia,
  indice,
  c,
}: Props) {
  const tipoLabel = tipo === 'vivienda' ? 'Vivienda' : 'Comercio'
  const monedaLabel = moneda === 'USD' ? 'dólares' : 'pesos'
  const totalUsd = moneda === 'USD' ? c.totalSubMonedaContrato : 0
  const totalArs = moneda === 'USD' ? c.totalSubARS : c.totalSubMonedaContrato
  const selladoSmall =
    tipo === 'vivienda' ? 'exento (vivienda · Santa Fe)' : '1,2% del total contrato'
  const ajusteLine =
    moneda === 'USD' ? 'Ajuste anual' : `Ajuste ${frecuencia} por ${indice}`

  const desglose = [
    { label: 'Primer mes', small: 'alquiler', value: fmt(alquiler, moneda) },
    { label: 'Honorarios', small: '1ª cuota de 3', value: fmt(c.honoCuota, moneda) },
    { label: 'Sellado', small: selladoSmall, value: fmtArs(c.sellado) },
    { label: 'Garantes', small: 'verificación', value: fmtArs(c.verificacion) },
    { label: 'Administrativo', small: 'por mes', value: fmt(c.admin, moneda) },
  ]

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: C.cream,
        fontFamily: FONT_BODY,
        color: C.tinta,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER VERDE */}
      <header
        style={{
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          padding: '70px 80px 56px',
          color: '#fff',
        }}
      >
        {/* next/image inserta URLs optimizadas que html2canvas no captura bien — usar <img> raw same-origin. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-blanco.webp"
          alt="SI Inmobiliaria"
          style={{ height: 70, width: 'auto', display: 'block' }}
        />
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '3.5px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.78)',
          }}
        >
          Costos iniciales · Alquiler permanente
        </div>
      </header>

      {/* HERO CONTEXTO */}
      <section style={{ padding: '52px 80px 28px' }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: C.tintaMute,
          }}
        >
          Tu contrato
        </div>
        <h1
          style={{
            fontFamily: FONT_NUM,
            fontSize: 64,
            fontWeight: 800,
            margin: '14px 0 0',
            lineHeight: 1,
            color: C.tinta,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          {fmt(alquiler, moneda)}
          <span style={{ fontWeight: 500, fontSize: 36, color: C.tintaMute }}>
            {' '}/ mes
          </span>
        </h1>
        <div style={{ marginTop: 14, fontSize: 22, color: C.tintaSoft }}>
          {tipoLabel} en {monedaLabel} · {meses} meses · {ajusteLine}
        </div>
      </section>

      {/* TOTAL CARD VERDE */}
      <section
        style={{
          margin: '0 60px 28px',
          padding: '46px 56px',
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          color: '#fff',
          borderRadius: 32,
          boxShadow: '0 18px 40px rgba(15, 61, 36, 0.28)',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '2.4px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Monto total al ingresar
        </div>
        {moneda === 'USD' ? (
          <>
            <div
              style={{
                fontFamily: FONT_NUM,
                fontSize: 78,
                fontWeight: 800,
                marginTop: 10,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.025em',
              }}
            >
              {fmtUsd(totalUsd)}
            </div>
            <div
              style={{
                fontFamily: FONT_NUM,
                fontSize: 30,
                fontWeight: 600,
                marginTop: 12,
                color: 'rgba(255,255,255,0.85)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              + {fmtArs(totalArs)} en pesos
            </div>
          </>
        ) : (
          <div
            style={{
              fontFamily: FONT_NUM,
              fontSize: 86,
              fontWeight: 800,
              marginTop: 10,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.025em',
            }}
          >
            {fmtArs(totalArs)}
          </div>
        )}
        <div style={{ marginTop: 16, fontSize: 17, color: 'rgba(255,255,255,0.78)' }}>
          Pagando honorarios en 3 cuotas · {tipoLabel}
        </div>
      </section>

      {/* DEPÓSITO */}
      <section
        style={{
          margin: '0 60px 28px',
          padding: '28px 44px',
          background: '#FFFFFF',
          borderRadius: 24,
          borderLeft: `6px solid ${C.usd}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(15, 61, 36, 0.06)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '2.2px',
              textTransform: 'uppercase',
              color: C.usd,
            }}
          >
            Depósito en garantía
          </div>
          <div style={{ marginTop: 6, fontSize: 16, color: C.tintaSoft }}>
            estimativo · 1 mes · ≈ {fmtArs(c.depositoEquivARS)}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 52,
            fontWeight: 800,
            color: C.tinta,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          {fmtUsdInt(c.depositoUSD)}
        </div>
      </section>

      {/* DESGLOSE 5 FILAS */}
      <section
        style={{
          margin: '0 60px 24px',
          padding: '28px 44px',
          background: '#FFFFFF',
          borderRadius: 24,
          border: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: C.green,
            borderBottom: `1px solid ${C.line}`,
            paddingBottom: 14,
            marginBottom: 8,
          }}
        >
          Costos al ingresar — desglose
        </div>
        {desglose.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom:
                i === desglose.length - 1 ? 'none' : `1px dashed ${C.line}`,
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: C.tinta }}>
                {row.label}
              </div>
              <div style={{ fontSize: 13, color: C.tintaMute, marginTop: 2 }}>
                {row.small}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_NUM,
                fontSize: 22,
                fontWeight: 700,
                color: C.tinta,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {row.value}
            </div>
          </div>
        ))}
      </section>

      {/* DISCLAIMER */}
      <section
        style={{
          margin: '0 60px 24px',
          padding: '20px 32px',
          background: C.warnBg,
          borderLeft: `5px solid ${C.warnBorder}`,
          borderRadius: 18,
          color: C.warnText,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: C.warnTextDark,
            marginBottom: 6,
          }}
        >
          Importante
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.45 }}>
          Valores estimativos no contractuales. Pueden cambiar sin previo aviso.
          Sellado y depósito se confirman al firmar el contrato.
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 'auto',
          background: C.creamFooter,
          padding: '36px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="SI Inmobiliaria"
            style={{ height: 52, width: 'auto', display: 'block', marginBottom: 8 }}
          />
          <div style={{ fontSize: 13, color: C.tintaSoft, fontWeight: 600 }}>
            siinmobiliaria.com
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              color: C.green,
              marginBottom: 4,
            }}
          >
            Administración · WhatsApp
          </div>
          <div
            style={{
              fontFamily: FONT_NUM,
              fontSize: 26,
              fontWeight: 700,
              color: C.tinta,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {WHATSAPP_ADMIN_DISPLAY}
          </div>
          <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 2 }}>
            wa.me/{WHATSAPP_ADMIN_NUM}
          </div>
        </div>
      </footer>
    </div>
  )
}
