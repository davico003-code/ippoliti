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

// Eyebrow verde reusable para secciones internas.
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: C.green,
}

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

  const mes23 = alquiler + c.honoCuota + c.admin
  const mes4 = alquiler + c.admin

  const desglose = [
    {
      label: 'Primer mes',
      small: 'alquiler',
      smallExtra: null as string | null,
      value: fmt(alquiler, moneda),
    },
    {
      label: 'Honorarios',
      small: '1ª cuota de 3',
      smallExtra: `total ${fmt(c.honoTotal, moneda)}`,
      value: fmt(c.honoCuota, moneda),
    },
    {
      label: 'Sellado',
      small: selladoSmall,
      smallExtra: null,
      value: fmtArs(c.sellado),
    },
    {
      label: 'Garantes',
      small: 'verificación',
      smallExtra: null,
      value: fmtArs(c.verificacion),
    },
    {
      label: 'Administrativo',
      small: 'por mes',
      smallExtra: null,
      value: fmt(c.admin, moneda),
    },
  ]

  const timeline = [
    {
      label: 'Mes 1',
      small: 'ingreso completo',
      value: moneda === 'USD' ? fmtUsd(totalUsd) : fmtArs(totalArs),
      sub: moneda === 'USD' ? `+ ${fmtArs(totalArs)} en pesos` : null,
    },
    {
      label: 'Mes 2-3',
      small: 'alquiler + cuota honorarios + admin',
      value: fmt(mes23, moneda),
      sub: null,
    },
    {
      label: 'Mes 4 en adelante',
      small: 'alquiler + admin',
      value: fmt(mes4, moneda),
      sub: null,
    },
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
      {/* HEADER VERDE — compacto */}
      <header
        style={{
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          padding: '50px 80px 40px',
          color: '#fff',
        }}
      >
        {/* next/image inserta URLs optimizadas que html2canvas no captura bien — usar <img> raw same-origin. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-blanco.webp"
          alt="SI Inmobiliaria"
          style={{ height: 60, width: 'auto', display: 'block' }}
        />
        <div
          style={{
            marginTop: 22,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.78)',
          }}
        >
          Costos iniciales · Alquiler permanente
        </div>
      </header>

      {/* HERO — alquiler protagonista, sin "Tu contrato" */}
      <section style={{ padding: '34px 80px 18px' }}>
        <h1
          style={{
            fontFamily: FONT_NUM,
            fontSize: 60,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1,
            color: C.tinta,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.025em',
          }}
        >
          {fmt(alquiler, moneda)}
          <span style={{ fontWeight: 500, fontSize: 32, color: C.tintaMute }}>
            {' '}/ mes
          </span>
        </h1>
        <div style={{ marginTop: 12, fontSize: 21, color: C.tintaSoft }}>
          {tipoLabel} en {monedaLabel} · {meses} meses · {ajusteLine}
        </div>
      </section>

      {/* TOTAL — compacto, sin subtítulo */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '24px 32px 26px',
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          color: '#fff',
          borderRadius: 24,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '2px',
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
                fontSize: 68,
                fontWeight: 800,
                marginTop: 6,
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
                fontSize: 26,
                fontWeight: 600,
                marginTop: 8,
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
              fontSize: 76,
              fontWeight: 800,
              marginTop: 6,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.025em',
            }}
          >
            {fmtArs(totalArs)}
          </div>
        )}
      </section>

      {/* DEPÓSITO horizontal */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '20px 32px',
          background: '#FFFFFF',
          borderRadius: 20,
          borderLeft: `5px solid ${C.usd}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ ...eyebrow, color: C.usd }}>Depósito en garantía</div>
          <div style={{ marginTop: 4, fontSize: 14, color: C.tintaSoft }}>
            estimativo · 1 mes · ≈ {fmtArs(c.depositoEquivARS)}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 44,
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
          margin: '0 60px 18px',
          padding: '22px 32px',
          background: '#FFFFFF',
          borderRadius: 20,
          border: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            ...eyebrow,
            borderBottom: `1px solid ${C.line}`,
            paddingBottom: 12,
            marginBottom: 4,
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
              padding: '12px 0',
              borderBottom:
                i === desglose.length - 1 ? 'none' : `1px dashed ${C.line}`,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.tinta }}>
                {row.label}
              </div>
              <div style={{ fontSize: 12, color: C.tintaMute, marginTop: 1 }}>
                {row.small}
              </div>
              {row.smallExtra && (
                <div
                  style={{
                    fontSize: 11,
                    color: C.tintaMute,
                    marginTop: 1,
                    fontFamily: FONT_NUM,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.smallExtra}
                </div>
              )}
            </div>
            <div
              style={{
                fontFamily: FONT_NUM,
                fontSize: 21,
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

      {/* TIMELINE — pagos mensuales */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '20px 32px',
          background: C.cream,
          borderRadius: 20,
          border: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            ...eyebrow,
            borderBottom: `1px solid ${C.line}`,
            paddingBottom: 10,
            marginBottom: 4,
          }}
        >
          Pagos mensuales
        </div>
        {timeline.map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom:
                i === arr.length - 1 ? 'none' : `1px dashed ${C.line}`,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.tinta }}>
                {row.label}
              </div>
              <div style={{ fontSize: 12, color: C.tintaMute, marginTop: 1 }}>
                {row.small}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: FONT_NUM,
                  fontSize: 19,
                  fontWeight: 700,
                  color: C.tinta,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.value}
              </div>
              {row.sub && (
                <div
                  style={{
                    fontFamily: FONT_NUM,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.tintaMute,
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 1,
                  }}
                >
                  {row.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* GARANTÍAS */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '18px 32px',
          background: C.cream,
          borderRadius: 20,
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ ...eyebrow, marginBottom: 10 }}>Garantías · opción 1 ó 2</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 16,
            color: C.tintaSoft,
            marginBottom: 6,
          }}
        >
          <span style={{ fontFamily: FONT_NUM, fontWeight: 800, color: C.green, fontSize: 20 }}>①</span>
          <span><strong style={{ color: C.tinta }}>1 garantía propietaria</strong> + 3 recibos de sueldo</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 16,
            color: C.tintaSoft,
          }}
        >
          <span style={{ fontFamily: FONT_NUM, fontWeight: 800, color: C.green, fontSize: 20 }}>②</span>
          <span><strong style={{ color: C.tinta }}>4 recibos de sueldo</strong></span>
        </div>
      </section>

      {/* GASTOS A CARGO */}
      <section
        style={{
          margin: '0 60px 14px',
          padding: '16px 32px',
          background: C.cream,
          borderRadius: 20,
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ ...eyebrow, marginBottom: 6 }}>Gastos a tu cargo (mensuales)</div>
        <div style={{ fontSize: 15, lineHeight: 1.45, color: C.tintaSoft }}>
          TGI · Aguas Santafesinas · API · Luz · Gas · Expensas (si la propiedad las paga)
        </div>
      </section>

      {/* SEGURO */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '16px 32px',
          background: C.cream,
          borderRadius: 20,
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ ...eyebrow, marginBottom: 6 }}>Seguro requerido al ingresar</div>
        <div style={{ fontSize: 15, lineHeight: 1.45, color: C.tintaSoft }}>
          Incendio · Piedras · Responsabilidad civil a linderos
        </div>
      </section>

      {/* DISCLAIMER conciso */}
      <section
        style={{
          margin: '0 60px 18px',
          padding: '16px 28px',
          background: C.warnBg,
          borderLeft: `5px solid ${C.warnBorder}`,
          borderRadius: 16,
          color: C.warnText,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: C.warnTextDark,
            marginBottom: 4,
          }}
        >
          Importante
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>
          Valores estimativos no contractuales. Pueden cambiar sin previo aviso.
          Cálculo automático e informativo.
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 'auto',
          background: C.creamFooter,
          padding: '32px 80px',
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
            style={{ height: 46, width: 'auto', display: 'block', marginBottom: 6 }}
          />
          <div style={{ fontSize: 12, color: C.tintaSoft, fontWeight: 600 }}>
            siinmobiliaria.com
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              color: C.green,
              marginBottom: 3,
            }}
          >
            Administración · WhatsApp
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
            {WHATSAPP_ADMIN_DISPLAY}
          </div>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 2 }}>
            wa.me/{WHATSAPP_ADMIN_NUM}
          </div>
        </div>
      </footer>
    </div>
  )
}
