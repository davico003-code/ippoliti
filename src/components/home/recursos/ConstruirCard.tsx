'use client'

// Card "Construir" (Sección 4) — preview con slider de m².
// USD/m² real: lib/costos-construccion.ts → MATRIZ_RESIDENCIAL_BASE
// "Línea Media".llaveBase (base 2026-06). Se inlinea porque ese módulo importa
// redis (server-only) y no puede entrar al bundle del cliente. Valor
// ORIENTATIVO; el cálculo con ajuste IPC vive en la página de la calculadora.

import { useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'

const USD_M2 = 1131 // Línea Media · llaveBase
const fmt = (n: number) => n.toLocaleString('es-AR')

export default function ConstruirCard() {
  const [m2, setM2] = useState(120)
  const total = m2 * USD_M2
  const fill = ((m2 - 40) / (400 - 40)) * 100

  return (
    <div className="card">
      <span className="clock">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        1 min
      </span>
      <p className="eyebrow">Construcción</p>
      <h3>¿Estás por construir?</h3>

      <div className="display">
        <div className="lbl">Costo aproximado de obra</div>
        <div className="big">≈ USD {fmt(total)}</div>
        <div className="sub">{m2} m² · llave en mano</div>
      </div>

      <div className="control">
        <div className="crow">
          <span className="k">Metros a construir</span>
          <span className="v">{m2} m²</span>
        </div>
        <input
          type="range"
          min={40}
          max={400}
          step={5}
          value={m2}
          onChange={e => setM2(Number(e.target.value))}
          aria-label="Metros a construir"
          style={{ '--range-fill': `${fill}%` } as CSSProperties}
        />
      </div>

      <Link href="/recursos/costos-de-construccion" className="ctaR">
        <span className="link">
          Calcular costos de obra
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 1l5 5-5 5" /></svg>
        </span>
      </Link>
    </div>
  )
}
