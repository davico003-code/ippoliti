'use client'

// Card "Alquilar" (Sección 4) — preview del costo de ingreso.
// Usa la función REAL calcularCostosIngreso de lib/calculadora-alquiler
// (honorarios 5%, admin 3%, sellado comercial 0,25%, IVA 21%). Sin "depósito": la
// herramienta real no lo modela, así el preview coincide 1:1 con ella.
// Defaults: vivienda, 24 meses, ARS. Valores ORIENTATIVOS.

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { calcularCostosIngreso } from '@/lib/calculadora-alquiler'
import CardFoto from './CardFoto'

const fmt = (n: number) => Math.round(n).toLocaleString('es-AR')

const SEGS = [
  { key: 'primerMes', label: 'Primer mes', color: '#3d9168' },
  { key: 'honorarios', label: 'Honorarios', color: '#1A5C38' },
  { key: 'sellado', label: 'Sellado', color: '#247a4d' },
  { key: 'adminVerif', label: 'Admin. + verif.', color: '#0F3F26' },
] as const

export default function AlquilarCard() {
  const [alquiler, setAlquiler] = useState(450000)

  const r = calcularCostosIngreso({ alquiler, meses: 24, moneda: 'ARS', tipo: 'vivienda', cotizacion: 1 })
  const vals: Record<string, number> = {
    primerMes: r.primerMes,
    honorarios: r.honoCuota,
    sellado: r.sellado,
    adminVerif: r.admin + r.verificacion,
  }
  const total = SEGS.reduce((acc, s) => acc + vals[s.key], 0)
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0)

  return (
    <div className="card">
      <CardFoto src="/images/herramientas/alquilar.webp" alt="Mano sosteniendo las llaves de un nuevo hogar" minutos={1} foco="center 45%" />

      <div className="body">
        <p className="eyebrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="8" cy="15" r="4.5" /><path d="m11.2 11.8 8.8-8.8M17 6l2.5 2.5M14.5 8.5 16.5 10.5" /></svg>
          Alquiler
        </p>
        <h3>¿Estás por alquilar?</h3>
        <p className="bajada">Calculá cuánto necesitás para ingresar y cuáles son los costos.</p>

        <div className="rentprev">
          <label className="rinput">
            <span className="rl">Tu alquiler mensual</span>
            <span className="rv">
              $&nbsp;
              <input
                className="rfield"
                inputMode="numeric"
                value={fmt(alquiler)}
                onChange={e => {
                  const n = Number(e.target.value.replace(/\D/g, ''))
                  setAlquiler(Number.isNaN(n) ? 0 : n)
                }}
                aria-label="Alquiler mensual en pesos"
              />
              <small>/mes</small>
            </span>
          </label>

          <div className="rresult">
            <div className="rrl">Necesitás para ingresar</div>
            <div className="rrv">≈ $ {fmt(total)}</div>

            <div className="stack">
              {SEGS.map(s => (
                <i key={s.key} style={{ width: `${pct(vals[s.key])}%`, background: s.color }} />
              ))}
            </div>
            <div className="legend">
              {SEGS.map(s => (
                <span key={s.key} style={{ '--c': s.color } as CSSProperties}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>

        <Link href="/recursos/calculadora-alquiler" className="cta">
          Calcular costos iniciales
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  )
}
