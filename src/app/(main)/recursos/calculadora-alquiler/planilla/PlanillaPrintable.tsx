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

// Documento A4 estilo "hoja de cards": fondo verdoso muy claro, cards blancas
// con hairlines, totales unificados en una sola banda verde. Embebido como
// string para que las reglas globales (oculta navbar/footer del sitio +
// estilos del documento + @page A4) viajen junto al component sin depender de
// globals.css. Comprimido para entrar SIEMPRE en una sola hoja A4 al imprimir
// (Cmd+P → Guardar como PDF).
const PLANILLA_CSS = `
/* Oculta el shell del sitio (navbar, footer, popups, scroll, whatsapp flotante).
   El layout root no se puede sobrescribir, pero podemos ocultar todo lo que no
   sea la planilla. El template compartido agrega .si-page-enter entre <main>
   y el documento, por eso neutralizamos esa caja sin ocultar sus hijos. */
body > *:not(main):not(script) { display: none !important; }
main > .si-page-enter { display: contents !important; }
main { padding: 0 !important; margin: 0 !important; max-width: none !important; }

:root {
  --tinta: #1C1C1E;
  --tinta-soft: #3A3A3D;
  --tinta-mute: #6E6E72;
  --line: #E0E6E1;
  --paper: #F4F7F5;
  --card: #FFFFFF;
  --si-green: #1A5C38;
  --si-green-dark: #0F3D25;
  --si-green-tint: #EAF2ED;
}

html, body {
  background: var(--paper) !important;
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
  padding: 26px 34px 18px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.planilla-page * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Header ─────────────────────────────────────────────────────────── */
.planilla-page .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.planilla-page .header-logo { height: 26px; width: auto; display: block; }
.planilla-page .header-meta {
  font-family: 'Raleway', sans-serif;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--tinta-mute);
  text-align: right;
  line-height: 1.5;
}

/* ── Título ─────────────────────────────────────────────────────────── */
.planilla-page .doc-eyebrow {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--si-green);
  margin-bottom: 4px;
}
.planilla-page .doc-h1 {
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: var(--tinta);
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.planilla-page .doc-sub {
  font-family: 'Raleway', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--tinta-mute);
  margin-top: 4px;
  margin-bottom: 12px;
}

/* ── Cards de datos (alquiler / ajuste) ─────────────────────────────── */
.planilla-page .datos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.planilla-page .dato-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}
.planilla-page .dato-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--si-green-tint);
  color: var(--si-green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 15px;
  margin-top: 2px;
}
.planilla-page .dato-icon svg { display: block; }
.planilla-page .dato-label {
  font-family: 'Raleway', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--si-green);
  margin-bottom: 3px;
}
.planilla-page .dato-valor {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 19px;
  color: var(--tinta);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
  line-height: 1.15;
}
.planilla-page .dato-valor .per {
  font-family: 'Raleway', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--tinta-mute);
  margin-left: 6px;
  letter-spacing: 0;
}
.planilla-page .dato-sub {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: var(--tinta-mute);
  margin-top: 3px;
}

/* ── Banda unificada de totales ─────────────────────────────────────── */
.planilla-page .total-card {
  background: linear-gradient(135deg, var(--si-green) 0%, var(--si-green-dark) 100%);
  color: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 18px;
  align-items: center;
  margin-bottom: 14px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.planilla-page .total-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255,255,255,0.28);
}
.planilla-page .total-label {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 9.5px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.85);
  margin-bottom: 4px;
}
.planilla-page .total-valor {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.6px;
  line-height: 1.1;
}
.planilla-page .total-sub {
  font-family: 'Raleway', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  margin-top: 4px;
}

/* ── Secciones ──────────────────────────────────────────────────────── */
.planilla-page .section { margin-bottom: 12px; }
.planilla-page .section-title {
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--si-green);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--si-green);
  margin-bottom: 8px;
}

/* ── Desglose: card con filas numeradas y montos en pill ────────────── */
.planilla-page .desglose-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 4px 16px;
}
.planilla-page .fila {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid #EEF1EE;
}
.planilla-page .fila:last-child { border-bottom: none; }
.planilla-page .fila-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--si-green-tint);
  color: var(--si-green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 10.5px;
}
.planilla-page .fila-label {
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 11.5px;
  color: var(--tinta);
  line-height: 1.25;
}
.planilla-page .fila-sub {
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 9.5px;
  color: var(--tinta-mute);
  margin-top: 1px;
  line-height: 1.3;
}
.planilla-page .fila-valor {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: var(--tinta);
  font-variant-numeric: tabular-nums;
  background: var(--si-green-tint);
  border-radius: 8px;
  padding: 4px 12px;
  white-space: nowrap;
}

/* ── ¿Qué pagás cada mes? — cards ───────────────────────────────────── */
.planilla-page .meses-grid {
  display: grid;
  gap: 12px;
}
.planilla-page .meses-grid.tres { grid-template-columns: 1fr 1fr 1fr; }
.planilla-page .meses-grid.dos { grid-template-columns: 1fr 1fr; }
.planilla-page .mes-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 11px 14px;
}
.planilla-page .mes-card.destacado {
  background: var(--si-green-tint);
  border: 1.5px solid var(--si-green);
}
.planilla-page .mes-label {
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 9.5px;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--si-green);
}
.planilla-page .mes-sub {
  font-family: 'Raleway', sans-serif;
  font-size: 9.5px;
  font-weight: 500;
  color: var(--tinta-mute);
  margin-top: 1px;
}
.planilla-page .mes-valor {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: var(--tinta);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.4px;
  margin-top: 6px;
  line-height: 1.15;
}
.planilla-page .mes-desc {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  font-weight: 400;
  color: var(--tinta-mute);
  margin-top: 5px;
  line-height: 1.35;
}

/* ── Condiciones — 3 cards con lista ────────────────────────────────── */
.planilla-page .cond-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.planilla-page .cond-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}
.planilla-page .cond-head {
  background: var(--si-green-tint);
  padding: 7px 13px;
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 9px;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: var(--si-green);
  line-height: 1.35;
}
.planilla-page .cond-body {
  padding: 8px 13px 10px;
  font-family: 'Raleway', sans-serif;
  font-size: 9.5px;
  color: var(--tinta-soft);
  line-height: 1.35;
}
.planilla-page .cond-body strong { color: var(--tinta); font-weight: 700; }
.planilla-page .cond-item {
  position: relative;
  padding-left: 12px;
  margin-bottom: 4px;
}
.planilla-page .cond-item:last-child { margin-bottom: 0; }
.planilla-page .cond-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--si-green);
}
.planilla-page .cond-item.numerado { padding-left: 20px; }
.planilla-page .cond-item.numerado::before {
  content: attr(data-num);
  width: 14px;
  height: 14px;
  top: 0;
  background: var(--si-green-tint);
  color: var(--si-green);
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 8.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Disclaimer + footer ────────────────────────────────────────────── */
.planilla-page .disclaimer {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 9px 14px;
  margin-bottom: 10px;
}
.planilla-page .disclaimer-title {
  font-family: 'Raleway', sans-serif;
  font-weight: 800;
  font-size: 9px;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--tinta-mute);
  margin-bottom: 3px;
}
.planilla-page .disclaimer-text {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  line-height: 1.4;
  color: var(--tinta-mute);
}

.planilla-page .footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--line);
  text-align: center;
}
.planilla-page .footer-line {
  font-family: 'Raleway', sans-serif;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--tinta-mute);
}
.planilla-page .footer-contact {
  font-family: 'Raleway', sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: var(--tinta-soft);
  margin-top: 3px;
}
.planilla-page .footer-contact strong {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: var(--si-green);
  font-variant-numeric: tabular-nums;
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

@page { size: A4; margin: 6mm; }
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
  }
  body > *:not(main):not(script) { display: none !important; }
  main > .si-page-enter { display: contents !important; }
  .no-print { display: none !important; }
  /* min-height: 0 es el fix clave — la caja deja de forzar el alto de A4 y se
     ajusta al contenido, eliminando la página 2 fantasma. */
  .planilla-page {
    box-shadow: none;
    width: auto !important;
    margin: 0 !important;
    padding: 6mm 8mm !important;
    max-height: none !important;
    min-height: 0 !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }
  .planilla-page > *:last-child { margin-bottom: 0 !important; }
  .planilla-page .section,
  .planilla-page .datos-grid,
  .planilla-page .total-card,
  .planilla-page .cond-grid,
  .planilla-page .disclaimer,
  .planilla-page .footer {
    page-break-inside: avoid !important;
  }
  /* Espacio entre el último bloque y el footer (sin margin-top:auto). */
  .planilla-page .footer { margin-top: 14px !important; }
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

  const tipoLabel = tipo === 'vivienda' ? 'Vivienda permanente' : 'Comercio'
  const monedaLabel = moneda === 'USD' ? 'en dólares' : 'en pesos'
  const docSub = `${tipoLabel} · contrato de ${meses} meses · ${monedaLabel}`
  const ajusteTitle =
    moneda === 'USD'
      ? 'Anual'
      : `Cada ${frecuencia === 'cuatrimestral' ? '4' : '3'} meses por ${indice}`
  const ajusteSub =
    moneda === 'USD'
      ? 'Los contratos en dólares se ajustan una vez al año, pactado entre las partes.'
      : indice === 'ICL'
        ? 'Índice oficial publicado por el BCRA'
        : 'Índice oficial publicado por INDEC'

  const totalUsd = moneda === 'USD' ? c.totalSubMonedaContrato : 0
  const totalArs = moneda === 'USD' ? c.totalSubARS : c.totalSubMonedaContrato
  const totalIngreso = moneda === 'USD' ? fmtUsd(totalUsd) : fmtArs(totalArs)
  const totalConDeposito =
    moneda === 'USD' ? fmtUsd(totalUsd + alquiler) : fmtArs(totalArs + alquiler)
  const extraArs = moneda === 'USD' ? ` + ${fmtArs(totalArs)} en pesos` : ''

  const selladoSub =
    tipo === 'vivienda'
      ? 'Vivienda · exento en Santa Fe'
      : 'Comercio · 0,25% del total del contrato'

  const ajusteFinalContrato =
    moneda === 'USD'
      ? 'ajuste anual por contrato'
      : `ajuste ${frecuencia} por ${indice}`

  const mes23 = alquiler + c.honoEnMes23 + c.admin
  const mes4 = alquiler + c.admin
  const adminDesc = c.mostrarAdmin ? ' + administración' : ''

  // Filas del desglose — el depósito cierra la lista para que el total con
  // depósito de la banda verde se lea completo en un solo lugar.
  const filas: { label: string; sub: string; valor: string }[] = [
    {
      label: 'Primer mes de alquiler',
      sub: 'Alquiler del mes en que ingresás',
      valor: fmt(alquiler, moneda),
    },
    {
      label: c.mostrarMeses23 ? 'Honorarios · 1ª cuota de 3' : 'Honorarios · totales + IVA',
      sub: `Total honorarios ${fmt(c.honoTotal, moneda)} · alquiler × meses × 5% × IVA`,
      valor: fmt(c.honoEnMes1, moneda),
    },
    { label: 'Sellado', sub: selladoSub, valor: fmtArs(c.sellado) },
    {
      label: 'Verificación de garantes',
      sub: 'Pago único · chequeo de documentación',
      valor: fmtArs(c.verificacion),
    },
    ...(c.mostrarAdmin
      ? [
          {
            label: 'Gasto administrativo',
            sub: '3% del alquiler + IVA · regulado por COCIR',
            valor: fmt(c.admin, moneda),
          },
        ]
      : []),
    {
      label: 'Depósito de garantía · 1 mes de alquiler',
      sub: 'Se entrega al ingresar. Se devuelve al finalizar el contrato.',
      valor: fmt(alquiler, moneda),
    },
  ]

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
            alt="SI INMOBILIARIA"
          />
          <div className="header-meta">
            Funes · Roldán · Rosario
            <br />
            Desde 1983 · {fechaStr}
          </div>
        </header>

        <div className="doc-eyebrow">Estimación de costos</div>
        <h1 className="doc-h1">Costos iniciales para alquilar</h1>
        <div className="doc-sub">{docSub}</div>

        <div className="datos-grid">
          <div className="dato-card">
            <div className="dato-icon">$</div>
            <div>
              <div className="dato-label">Alquiler mensual</div>
              <div className="dato-valor">
                {fmt(alquiler, moneda)}
                <span className="per">por mes</span>
              </div>
              <div className="dato-sub">Valor base del contrato</div>
            </div>
          </div>
          <div className="dato-card">
            <div className="dato-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </div>
            <div>
              <div className="dato-label">Ajuste del alquiler</div>
              <div className="dato-valor">{ajusteTitle}</div>
              <div className="dato-sub">{ajusteSub}</div>
            </div>
          </div>
        </div>

        {/* Totales unificados: ingreso y con depósito en una sola banda */}
        <div className="total-card">
          <div>
            <div className="total-label">Costos de ingreso</div>
            <div className="total-valor">{totalIngreso}</div>
            <div className="total-sub">
              Alquiler + gastos iniciales{extraArs}
            </div>
          </div>
          <div className="total-divider" />
          <div>
            <div className="total-label">Costos de ingreso + depósito</div>
            <div className="total-valor">{totalConDeposito}</div>
            <div className="total-sub">
              Incluye {fmt(alquiler, moneda)} reembolsables{extraArs}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Desglose del monto al ingresar</div>
          {!incluirAdmin && (
            <div className="fila-sub" style={{ fontStyle: 'italic', marginBottom: 4 }}>
              Sin gasto administrativo: SI solo confecciona el contrato.
            </div>
          )}
          <div className="desglose-card">
            {filas.map((fila, i) => (
              <div className="fila" key={fila.label}>
                <div className="fila-num">{i + 1}</div>
                <div>
                  <div className="fila-label">{fila.label}</div>
                  <div className="fila-sub">{fila.sub}</div>
                </div>
                <div className="fila-valor">{fila.valor}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">¿Qué pagás cada mes?</div>
          <div className={`meses-grid ${c.mostrarMeses23 ? 'tres' : 'dos'}`}>
            <div className="mes-card destacado">
              <div className="mes-label">Mes 1</div>
              <div className="mes-sub">Día que ingresás</div>
              <div className="mes-valor">
                {moneda === 'USD' ? fmtUsd(totalUsd) : fmtArs(totalArs)}
              </div>
              <div className="mes-desc">
                Alquiler + {c.mostrarMeses23 ? '1ª cuota de honorarios' : 'honorarios'} + sellado +
                garantes{adminDesc}
              </div>
            </div>
            {c.mostrarMeses23 && (
              <div className="mes-card">
                <div className="mes-label">Meses 2 y 3</div>
                <div className="mes-sub">Cuotas restantes</div>
                <div className="mes-valor">{fmt(mes23, moneda)}</div>
                <div className="mes-desc">
                  Alquiler + 2ª/3ª cuota de honorarios{adminDesc}
                </div>
              </div>
            )}
            <div className="mes-card">
              <div className="mes-label">
                Desde el mes {c.mostrarMeses23 ? 4 : 2}
              </div>
              <div className="mes-sub">Pago habitual</div>
              <div className="mes-valor">{fmt(mes4, moneda)}</div>
              <div className="mes-desc">
                Alquiler{adminDesc} · {ajusteFinalContrato}
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Condiciones y gastos a tener en cuenta</div>
          <div className="cond-grid">
            <div className="cond-card">
              <div className="cond-head">Garantías · Opción 1 ó 2</div>
              <div className="cond-body">
                <div className="cond-item numerado" data-num="1">
                  <strong>1 garantía propietaria</strong> + 3 últimos recibos de sueldo
                </div>
                <div className="cond-item numerado" data-num="2">
                  <strong>4 últimos recibos de sueldo</strong>
                </div>
              </div>
            </div>
            <div className="cond-card">
              <div className="cond-head">Seguro requerido al ingresar</div>
              <div className="cond-body">
                <div className="cond-item">Incendio</div>
                <div className="cond-item">Daños por piedras</div>
                <div className="cond-item">
                  Responsabilidad civil hacia vecinos (linderos)
                </div>
              </div>
            </div>
            <div className="cond-card">
              <div className="cond-head">Gastos mensuales del inquilino</div>
              <div className="cond-body">
                <div className="cond-item">Tasa General de Inmuebles (TGI)</div>
                <div className="cond-item">Aguas Santafesinas · API</div>
                <div className="cond-item">Luz · Gas</div>
                <div className="cond-item">Expensas si la propiedad las paga</div>
              </div>
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
            <p style={{ marginTop: 3 }}>
              Te recomendamos consultarnos antes de firmar el contrato. Por esta
              misma razón, este cálculo no tiene carácter contractual.
            </p>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-line">
            SI INMOBILIARIA · Desde 1983 acompañando decisiones importantes
          </div>
          <div className="footer-contact">
            Administración · WhatsApp <strong>{WHATSAPP_DISPLAY}</strong> ·
            wa.me/{WHATSAPP_NUM} · siinmobiliaria.com
          </div>
        </footer>
      </div>
    </>
  )
}
