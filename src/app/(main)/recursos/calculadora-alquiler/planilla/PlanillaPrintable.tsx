'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  calcularCostosIngreso,
  type Moneda,
  type TipoFiscal,
  type FormaPagoHonorarios,
} from '@/lib/calculadora-alquiler'

type Frecuencia = 'trimestral' | 'cuatrimestral'
type Indice = 'ICL' | 'IPC'

const fmtArs = (n: number) => `$ ${Math.round(n).toLocaleString('es-AR')}`
const fmtUsd = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
const fmt = (n: number, m: Moneda) => (m === 'USD' ? fmtUsd(n) : fmtArs(n))

const WHATSAPP_NUM = '5493413415159'
const WHATSAPP_DISPLAY = '+54 9 341 341 5159'

// CSS portado de _referencias/planilla-alquiler-A4.html. Embebido como string
// para que las reglas globales (oculta navbar/footer del sitio + estilos del
// documento + @page A4) viajen junto al component sin depender de globals.css.
// Layout comprimido para entrar SIEMPRE en una sola hoja A4 al imprimir
// (Cmd+P → Guardar como PDF). Paddings, tipografías y márgenes ajustados;
// info-grid en 3 columnas; @page con margins de 10mm/12mm.
const PLANILLA_CSS = `
/* Oculta el shell del sitio (navbar, footer, popups, scroll, whatsapp flotante).
   El layout root no se puede sobrescribir, pero podemos ocultar todo lo que no
   sea la planilla. <main> queda visible y dentro solo se muestra el documento. */
body > *:not(main):not(script) { display: none !important; }
main > *:not(.planilla-page) { display: none !important; }
main { padding: 0 !important; margin: 0 !important; max-width: none !important; }

:root {
  --tinta: #1C1C1E;
  --tinta-soft: #3A3A3D;
  --tinta-mute: #6E6E72;
  --line: #D8D8D2;
  --line-soft: #ECECE6;
  --paper: #FFFFFF;
  --si-green: #1A5C38;
  --si-green-tint: #F1F6F3;
}

html, body {
  background: #fff !important;
  font-family: 'Raleway', system-ui, sans-serif;
  color: var(--tinta);
  line-height: 1.3;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* CTA de impresión: visible en pantalla, fuera del flujo (no afecta la altura
   de la hoja), oculto al imprimir vía .no-print. */
.planilla-print-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.4px;
  color: #fff;
  background: var(--si-green);
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
}
.planilla-print-btn:hover { background: #14492c; }

.planilla-page {
  width: 794px;
  min-height: 1123px;
  background: var(--paper);
  margin: 0 auto;
  padding: 32px 38px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.planilla-page * { box-sizing: border-box; margin: 0; padding: 0; }

.planilla-page .header {
  text-align: left;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--si-green);
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.planilla-page .header-logo { height: 28px; width: auto; display: block; }
.planilla-page .header-meta {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--tinta-mute);
  text-align: right;
  line-height: 1.4;
}

.planilla-page .doc-title { margin-bottom: 7px; }
.planilla-page .doc-eyebrow {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--si-green);
  margin-bottom: 3px;
}
.planilla-page .doc-h1 {
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: var(--tinta);
  letter-spacing: -0.5px;
  line-height: 1.15;
}

.planilla-page .hero {
  margin-bottom: 9px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--line);
}
.planilla-page .hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.planilla-page .hero-cell { display: flex; flex-direction: column; }
.planilla-page .hero-label {
  font-family: 'Raleway', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--tinta-mute);
  margin-bottom: 4px;
}
.planilla-page .hero-value {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 19px;
  color: var(--tinta);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.planilla-page .hero-value.ajuste { font-size: 14px; font-weight: 600; }
.planilla-page .hero-value .per {
  font-size: 13px;
  font-weight: 500;
  color: var(--tinta-mute);
  margin-left: 4px;
}
.planilla-page .hero-sub {
  font-family: 'Raleway', sans-serif;
  font-size: 12px;
  color: var(--tinta-soft);
  margin-top: 3px;
  font-weight: 500;
}

.planilla-page .total {
  margin-bottom: 8px;
  padding: 10px 16px;
  background: var(--si-green-tint);
  border-top: 3px solid var(--si-green);
  border-bottom: 1px solid var(--si-green);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.planilla-page .total-label {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--si-green);
}
.planilla-page .total-amount {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 23px;
  color: var(--si-green);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.planilla-page .total-amount-extra {
  font-size: 13px;
  font-weight: 600;
  margin-left: 8px;
}

.planilla-page .section { margin-bottom: 8px; }
.planilla-page .section-head {
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--si-green);
}
.planilla-page .section-title {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--si-green);
}

.planilla-page .tabla { width: 100%; border-collapse: collapse; }
.planilla-page .tabla tr { border-bottom: 1px solid var(--line-soft); }
.planilla-page .tabla tr:last-child { border-bottom: none; }
.planilla-page .tabla td { padding: 4px 0; vertical-align: middle; }
.planilla-page .tabla .label {
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 11px;
  color: var(--tinta);
  line-height: 1.25;
}
.planilla-page .tabla .label-sub {
  display: block;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 9.5px;
  color: var(--tinta-mute);
  margin-top: 1px;
  line-height: 1.3;
}
.planilla-page .tabla .value {
  text-align: right;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--tinta);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  line-height: 1.2;
}
.planilla-page .tabla .value-sub {
  display: block;
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  color: var(--tinta-mute);
  font-weight: 400;
  margin-top: 1px;
}

.planilla-page .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px 14px;
  margin-bottom: 6px;
}
.planilla-page .info-block { border-left: 3px solid var(--si-green); padding-left: 12px; }
.planilla-page .info-block-title {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--si-green);
  margin-bottom: 4px;
  line-height: 1.3;
}
.planilla-page .info-block-content {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  line-height: 1.3;
  color: var(--tinta-soft);
}
.planilla-page .info-block-content strong { color: var(--tinta); font-weight: 700; }
.planilla-page .info-block-content ol {
  list-style: none;
  counter-reset: opcion;
  padding: 0;
  margin: 0;
}
.planilla-page .info-block-content ol li {
  counter-increment: opcion;
  padding-left: 18px;
  position: relative;
  margin-bottom: 3px;
}
.planilla-page .info-block-content ol li::before {
  content: counter(opcion) ".";
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: var(--si-green);
}

.planilla-page .disclaimer {
  border: 1px solid var(--tinta);
  padding: 8px 12px;
  margin-bottom: 6px;
}
.planilla-page .disclaimer-title {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--tinta);
  margin-bottom: 4px;
}
.planilla-page .disclaimer-text {
  font-family: 'Raleway', sans-serif;
  font-size: 9.5px;
  line-height: 1.3;
  color: var(--tinta-soft);
}

.planilla-page .footer {
  margin-top: auto;
  padding-top: 7px;
  border-top: 2px solid var(--si-green);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;
}
.planilla-page .footer-logo { height: 18px; width: auto; display: block; margin-bottom: 3px; }
.planilla-page .footer-tagline {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  color: var(--tinta-mute);
  font-weight: 500;
  letter-spacing: 0.8px;
}
.planilla-page .footer-web {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  color: var(--tinta-soft);
  margin-top: 3px;
  font-weight: 500;
}
.planilla-page .footer-contact { text-align: right; }
.planilla-page .footer-contact-label {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--tinta-mute);
  margin-bottom: 2px;
}
.planilla-page .footer-contact-value {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: var(--si-green);
  font-variant-numeric: tabular-nums;
}
.planilla-page .footer-contact-link {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  color: var(--tinta-mute);
  margin-top: 2px;
}

.planilla-fallback {
  max-width: 480px;
  margin: 96px auto;
  padding: 32px;
  font-family: 'Raleway', sans-serif;
  text-align: center;
}
.planilla-fallback h1 {
  font-size: 22px;
  font-weight: 800;
  color: var(--tinta);
  margin-bottom: 12px;
}
.planilla-fallback p {
  font-size: 14px;
  color: var(--tinta-soft);
  margin-bottom: 18px;
}
.planilla-fallback a {
  color: var(--si-green);
  font-weight: 700;
  text-decoration: underline;
}

@page { size: A4; margin: 8mm; }
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }
  body > *:not(main):not(script) { display: none !important; }
  main > *:not(.planilla-page) { display: none !important; }
  .no-print { display: none !important; }
  /* min-height: 0 es el fix clave — la caja deja de forzar el alto de A4 y se
     ajusta al contenido, eliminando la página 2 fantasma. El llenado de la
     hoja se logra con tipografía/espaciado, no forzando altura. */
  .planilla-page {
    box-shadow: none;
    margin: 0 !important;
    padding: 12mm 14mm !important;
    max-height: none !important;
    min-height: 0 !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
    line-height: 1.4 !important;
    font-size: 12px !important;
  }
  /* Sin margen residual debajo del último bloque (footer). */
  .planilla-page > *:last-child { margin-bottom: 0 !important; }
  /* Evitar que un bloque se parta entre páginas. */
  .planilla-page .section,
  .planilla-page .info-grid,
  .planilla-page .disclaimer,
  .planilla-page .footer {
    page-break-inside: avoid !important;
  }
  /* Rebalanceo print: usar toda la altura útil de la hoja con tipografías
     legibles (mínimo 11-12px) y secciones con más respiración. */
  .planilla-page .section { margin-bottom: 14px !important; }
  .planilla-page .section-title { font-size: 13px !important; }
  .planilla-page .tabla .label { font-size: 12px !important; }
  .planilla-page .tabla .label-sub { font-size: 10.5px !important; }
  .planilla-page .tabla .value { font-size: 14px !important; line-height: 1.3 !important; }
  .planilla-page .hero-value { font-size: 22px !important; line-height: 1.3 !important; }
  .planilla-page .hero-value.ajuste { font-size: 16px !important; }
  .planilla-page .hero-sub { font-size: 12px !important; }
  .planilla-page .total { padding: 16px 20px !important; }
  .planilla-page .total-amount { font-size: 28px !important; line-height: 1.3 !important; }
  .planilla-page .disclaimer { padding: 12px 16px !important; }
  .planilla-page .disclaimer-text { font-size: 11px !important; }
  .planilla-page .info-grid { gap: 12px 20px !important; }
  .planilla-page .info-block-content { font-size: 11px !important; }
  /* Espacio respirable entre el último bloque y el footer (sin margin-top:auto). */
  .planilla-page .footer { margin-top: 24px !important; padding-top: 14px !important; }
}
`

interface ParsedInput {
  ok: true
  alquiler: number
  meses: number
  moneda: Moneda
  tipo: TipoFiscal
  frecuencia: Frecuencia
  indice: Indice
  cotizacion: number
  incluirAdmin: boolean
  formaPago: FormaPagoHonorarios
}

interface ParsedError {
  ok: false
  reason: string
}

function parseInput(sp: URLSearchParams | null): ParsedInput | ParsedError {
  if (!sp) return { ok: false, reason: 'Faltan parámetros' }
  const alquiler = Number(sp.get('alquiler'))
  const meses = Number(sp.get('meses'))
  const cotizacion = Number(sp.get('cotizacion')) || 1430
  const monedaRaw = sp.get('moneda')
  const tipoRaw = sp.get('tipo')
  const frecuenciaRaw = sp.get('frecuencia')
  const indiceRaw = sp.get('indice')
  // Gasto admin: ?admin=no lo excluye (default incluir). Legacy: ?sinAdmin=1.
  const incluirAdmin = sp.get('admin') !== 'no' && sp.get('sinAdmin') !== '1'
  // Forma de pago honorarios: ?pago=1pago. Legacy: ?honoCuotas=1.
  const formaPago: FormaPagoHonorarios =
    sp.get('pago') === '1pago' || sp.get('honoCuotas') === '1' ? '1pago' : '3cuotas'

  if (!Number.isFinite(alquiler) || alquiler <= 0)
    return { ok: false, reason: 'El monto del alquiler es inválido.' }
  if (!Number.isFinite(meses) || meses < 1)
    return { ok: false, reason: 'La duración del contrato es inválida.' }
  const moneda: Moneda = monedaRaw === 'USD' ? 'USD' : 'ARS'
  const tipo: TipoFiscal = tipoRaw === 'comercio' ? 'comercio' : 'vivienda'
  const frecuencia: Frecuencia =
    frecuenciaRaw === 'trimestral' ? 'trimestral' : 'cuatrimestral'
  const indice: Indice = indiceRaw === 'IPC' ? 'IPC' : 'ICL'

  return {
    ok: true,
    alquiler,
    meses: Math.round(meses),
    moneda,
    tipo,
    frecuencia,
    indice,
    cotizacion,
    incluirAdmin,
    formaPago,
  }
}

export default function PlanillaPrintable() {
  const sp = useSearchParams()
  const parsed = useMemo(() => parseInput(sp), [sp])

  // Disparo automático del diálogo de impresión cuando los datos son válidos
  // y las fonts están listas. El usuario elige "Guardar como PDF" en el browser.
  useEffect(() => {
    if (!parsed.ok) return
    let cancelled = false
    const run = async () => {
      try {
        type DocWithFonts = Document & { fonts?: { ready: Promise<unknown> } }
        const docFonts = (document as DocWithFonts).fonts
        if (docFonts?.ready) await docFonts.ready
      } catch {
        // ignore
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) window.print()
        }),
      )
    }
    run()
    return () => {
      cancelled = true
    }
  }, [parsed])

  if (!parsed.ok) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PLANILLA_CSS }} />
        <div className="planilla-fallback">
          <h1>No pudimos generar la planilla</h1>
          <p>{parsed.reason}</p>
          <p>
            Volvé a la{' '}
            <a href="/recursos/calculadora-alquiler">calculadora de alquiler</a>{' '}
            y tocá &quot;Descargar planilla&quot; nuevamente.
          </p>
        </div>
      </>
    )
  }

  const { alquiler, meses, moneda, tipo, frecuencia, indice, cotizacion, incluirAdmin, formaPago } =
    parsed
  const c = calcularCostosIngreso({ alquiler, meses, moneda, tipo, cotizacion, incluirAdmin, formaPagoHonorarios: formaPago })
  const adminLabel = c.mostrarAdmin ? ' + admin' : ''

  const tipoLabel = tipo === 'vivienda' ? 'Vivienda' : 'Comercio'
  const monedaLabel = moneda === 'USD' ? 'en dólares' : 'en pesos'
  const heroSub = `${tipoLabel} · ${meses} meses · ${monedaLabel}`
  const ajusteTitle =
    moneda === 'USD'
      ? 'Anual'
      : `${frecuencia === 'cuatrimestral' ? 'Cuatrimestral' : 'Trimestral'} por ${indice}`
  const ajusteSub =
    moneda === 'USD'
      ? 'Los contratos en dólares se ajustan una vez al año, pactado entre las partes.'
      : indice === 'ICL'
        ? 'Índice oficial publicado por el BCRA.'
        : 'Índice oficial publicado por INDEC.'

  const totalUsd = moneda === 'USD' ? c.totalSubMonedaContrato : 0
  const totalArs = moneda === 'USD' ? c.totalSubARS : c.totalSubMonedaContrato

  const selladoLabelSub =
    tipo === 'vivienda'
      ? 'Vivienda · exento en Santa Fe'
      : 'Comercio · 1,2% del total del contrato'

  const ajusteFinalContrato =
    moneda === 'USD'
      ? 'ajuste anual hasta el final del contrato'
      : `ajuste ${frecuencia} por ${indice} hasta el final del contrato`

  const mes23 = alquiler + c.honoEnMes23 + c.admin
  const mes4 = alquiler + c.admin

  const fechaStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PLANILLA_CSS }} />
      <div className="planilla-page">
        <button
          type="button"
          className="planilla-print-btn no-print"
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </button>
        <header className="header">
          {/* Logo cargado desde /public, mismo origen, no requiere optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="header-logo"
            src="/logo-si-horizontal.png"
            alt="SI Inmobiliaria"
          />
          <div className="header-meta">
            Funes · Roldán · Rosario
            <br />
            Desde 1983 · {fechaStr}
          </div>
        </header>

        <div className="doc-title">
          <div className="doc-eyebrow">Estimación de costos</div>
          <h1 className="doc-h1">Costos iniciales para alquiler permanente</h1>
        </div>

        <div className="hero">
          <div className="hero-grid">
            <div className="hero-cell">
              <div className="hero-label">Alquiler mensual</div>
              <div className="hero-value">
                {fmt(alquiler, moneda)}
                <span className="per">/ mes</span>
              </div>
              <div className="hero-sub">{heroSub}</div>
            </div>
            <div className="hero-cell">
              <div className="hero-label">Ajuste del alquiler</div>
              <div className="hero-value ajuste">{ajusteTitle}</div>
              <div className="hero-sub">{ajusteSub}</div>
            </div>
          </div>
        </div>

        <div className="total">
          <div className="total-label">Monto total al ingresar</div>
          <div className="total-amount">
            {moneda === 'USD' ? (
              <>
                {fmtUsd(totalUsd)}
                <span className="total-amount-extra">
                  + {fmtArs(totalArs)} en pesos
                </span>
              </>
            ) : (
              fmtArs(totalArs)
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">Desglose del monto al ingresar</div>
          </div>
          {!incluirAdmin && (
            <div className="label-sub" style={{ fontStyle: 'italic', marginBottom: 4 }}>
              Sin gasto administrativo: SI solo confecciona el contrato.
            </div>
          )}
          <table className="tabla">
            <tbody>
              <tr>
                <td>
                  <div className="label">Primer mes de alquiler</div>
                  <div className="label-sub">
                    Alquiler del mes en que ingresás
                  </div>
                </td>
                <td className="value">{fmt(alquiler, moneda)}</td>
              </tr>
              <tr>
                <td>
                  <div className="label">
                    {c.mostrarMeses23 ? 'Honorarios · 1ª cuota de 3' : 'Honorarios · totales + IVA'}
                  </div>
                  <div className="label-sub">
                    Total honorarios {fmt(c.honoTotal, moneda)} · alquiler ×
                    meses × 5% × IVA
                  </div>
                </td>
                <td className="value">{fmt(c.honoEnMes1, moneda)}</td>
              </tr>
              <tr>
                <td>
                  <div className="label">Sellado</div>
                  <div className="label-sub">{selladoLabelSub}</div>
                </td>
                <td className="value">{fmtArs(c.sellado)}</td>
              </tr>
              <tr>
                <td>
                  <div className="label">Verificación de garantes</div>
                  <div className="label-sub">
                    Pago único · chequeo de documentación
                  </div>
                </td>
                <td className="value">{fmtArs(c.verificacion)}</td>
              </tr>
              {c.mostrarAdmin && (
                <tr>
                  <td>
                    <div className="label">Gasto administrativo</div>
                    <div className="label-sub">
                      3% del alquiler + IVA · regulado por COCIR
                    </div>
                  </td>
                  <td className="value">{fmt(c.admin, moneda)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">Depósito en garantía</div>
          </div>
          <table className="tabla">
            <tbody>
              <tr>
                <td>
                  <div className="label">Monto del depósito</div>
                  <div className="label-sub">
                    Se entrega al ingresar al inmueble. Se devuelve al
                    finalizar el contrato.
                  </div>
                </td>
                <td className="value">1 mes de alquiler</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">¿Qué pagás cada mes?</div>
          </div>
          <table className="tabla">
            <tbody>
              <tr>
                <td>
                  <div className="label">Mes 1 · día que ingresás</div>
                  <div className="label-sub">
                    Alquiler + {c.mostrarMeses23 ? '1ª cuota honorarios' : 'honorarios'} + sellado + garantes{adminLabel}
                  </div>
                </td>
                <td className="value">
                  {moneda === 'USD' ? fmtUsd(totalUsd) : fmtArs(totalArs)}
                </td>
              </tr>
              {c.mostrarMeses23 ? (
                <>
                  <tr>
                    <td>
                      <div className="label">Mes 2 y 3</div>
                      <div className="label-sub">
                        Alquiler + 2ª/3ª cuota honorarios{adminLabel}
                      </div>
                    </td>
                    <td className="value">{fmt(mes23, moneda)}</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="label">Mes 4 en adelante</div>
                      <div className="label-sub">
                        Alquiler{adminLabel} · {ajusteFinalContrato}
                      </div>
                    </td>
                    <td className="value">{fmt(mes4, moneda)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>
                    <div className="label">Mes 2 en adelante</div>
                    <div className="label-sub">
                      Alquiler{adminLabel} · {ajusteFinalContrato}
                    </div>
                  </td>
                  <td className="value">{fmt(mes4, moneda)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="info-grid">
          <div className="info-block">
            <div className="info-block-title">Garantías · Opción 1 ó 2</div>
            <div className="info-block-content">
              <ol>
                <li>
                  <strong>1 garantía propietaria</strong> + 3 últimos recibos de
                  sueldo
                </li>
                <li>
                  <strong>4 últimos recibos de sueldo</strong>
                </li>
              </ol>
            </div>
          </div>
          <div className="info-block">
            <div className="info-block-title">
              Seguro requerido al ingresar
            </div>
            <div className="info-block-content">
              Incendio · Daños por piedras · Responsabilidad civil hacia los
              vecinos (linderos).
            </div>
          </div>
          <div className="info-block">
            <div className="info-block-title">
              Gastos mensuales a cargo del inquilino
            </div>
            <div className="info-block-content">
              Tasa General de Inmuebles (TGI) · Aguas Santafesinas · API · Luz ·
              Gas · Expensas si la propiedad las paga.
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <div className="disclaimer-title">Aclaración importante</div>
          <div className="disclaimer-text">
            <p>
              Estos valores son estimaciones basadas en usos y costumbres de
              ajuste en locaciones. El ajuste pactado con el propietario puede
              ser distinto.
            </p>
            <p style={{ marginTop: 4 }}>
              Te recomendamos consultarnos siempre antes de firmar el contrato.
              Por esta misma razón, este cálculo no tiene carácter contractual.
            </p>
          </div>
        </div>

        <footer className="footer">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="footer-logo"
              src="/logo-si-horizontal.png"
              alt="SI Inmobiliaria"
            />
            <div className="footer-tagline">
              Desde 1983 · Funes · Roldán · Rosario
            </div>
            <div className="footer-web">siinmobiliaria.com</div>
          </div>
          <div className="footer-contact">
            <div className="footer-contact-label">
              Administración · WhatsApp
            </div>
            <div className="footer-contact-value">{WHATSAPP_DISPLAY}</div>
            <div className="footer-contact-link">wa.me/{WHATSAPP_NUM}</div>
          </div>
        </footer>
      </div>
    </>
  )
}
