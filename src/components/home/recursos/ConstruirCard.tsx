'use client'

// Card "Construir" (Sección 4) — preview del costo de obra con m² editables.
// USD/m² real: lib/costos-construccion.ts → MATRIZ_RESIDENCIAL_BASE
// "Línea Media".llaveBase (base 2026-06). Se inlinea porque ese módulo importa
// redis (server-only) y no puede entrar al bundle del cliente. Valor
// ORIENTATIVO; el cálculo con ajuste IPC vive en la página de la calculadora.

import { useState } from 'react'
import Link from 'next/link'
import CardFoto from './CardFoto'

const USD_M2 = 1131 // Línea Media · llaveBase
const fmt = (n: number) => n.toLocaleString('es-AR')

export default function ConstruirCard() {
  const [m2, setM2] = useState(120)

  return (
    <div className="card">
      <CardFoto src="/images/herramientas/construir.webp" alt="Casa moderna en construcción" minutos={1} foco="center 40%" />

      <div className="body">
        <p className="eyebrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z" /></svg>
          Construcción
        </p>
        <h3>¿Estás por construir?</h3>
        <p className="bajada">Calculá el costo estimado de tu obra en segundos.</p>

        <div className="caja">
          <label className="lbl">
            <span className="auto">
              <span aria-hidden>{m2 || '0'}</span>
              <input
                className="num"
                inputMode="numeric"
                value={m2 || ''}
                onChange={e => setM2(Math.min(2000, Number(e.target.value.replace(/\D/g, '')) || 0))}
                aria-label="Metros cuadrados a construir"
              />
            </span>
            m² · llave en mano
          </label>
          <div className="big">≈ USD {fmt(m2 * USD_M2)}</div>
        </div>

        <ul className="feats">
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 20v-4M10 20v-8M15 20V8M20 20V4" /></svg>
            Costo por m² actualizado
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 12h18M9 5v7M15 12v7" /></svg>
            Materiales y mano de obra
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
            Resultado al instante
          </li>
        </ul>

        <Link href="/recursos/costos-de-construccion" className="cta">
          Calcular costos de obra
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  )
}
