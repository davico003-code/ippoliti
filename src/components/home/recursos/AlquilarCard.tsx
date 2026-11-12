'use client'

// Card "Alquilar" (Sección 4) — preview del costo de ingreso.
// Usa la función REAL calcularCostosIngreso de lib/calculadora-alquiler
// (honorarios 5%, admin 3%, sellado comercial 0,25%, IVA 21%). Sin "depósito": la
// herramienta real no lo modela, así el preview coincide 1:1 con ella.
// Defaults: vivienda, 24 meses, ARS. Valores ORIENTATIVOS.

import { useState } from 'react'
import Link from 'next/link'
import { calcularCostosIngreso } from '@/lib/calculadora-alquiler'
import CardFoto from './CardFoto'

const fmt = (n: number) => Math.round(n).toLocaleString('es-AR')

export default function AlquilarCard() {
  const [alquiler, setAlquiler] = useState(450000)

  const r = calcularCostosIngreso({ alquiler, meses: 24, moneda: 'ARS', tipo: 'vivienda', cotizacion: 1 })
  const total = r.primerMes + r.honoCuota + r.sellado + r.admin + r.verificacion

  return (
    <div className="card">
      <CardFoto src="/images/herramientas/alquilar.webp" alt="Mano sosteniendo las llaves de un nuevo hogar" minutos={1} foco="center 45%" />

      <div className="body">
        <p className="eyebrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="8" cy="15" r="4.5" /><path d="m11.2 11.8 8.8-8.8M17 6l2.5 2.5M14.5 8.5 16.5 10.5" /></svg>
          Alquiler
        </p>
        <h3>¿Estás por alquilar?</h3>
        <p className="bajada">Calculá cuánto necesitás para ingresar y cuáles son los costos.</p>

        <div className="caja split">
          <label className="mitad">
            <span className="lbl">Tu alquiler mensual</span>
            <span className="val">
              $&nbsp;
              <span className="auto">
                <span aria-hidden>{alquiler ? fmt(alquiler) : '0'}</span>
                <input
                  className="num"
                  inputMode="numeric"
                  value={alquiler ? fmt(alquiler) : ''}
                  onChange={e => setAlquiler(Number(e.target.value.replace(/\D/g, '')) || 0)}
                  aria-label="Alquiler mensual en pesos"
                />
              </span>
              <small>/mes</small>
            </span>
          </label>
          <div className="mitad">
            <span className="lbl">Necesitás para ingresar</span>
            <span className="val">≈ $ {fmt(total)}</span>
          </div>
        </div>

        <ul className="feats cuatro">
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3v5h5M8.5 13h7M8.5 17h5" /></svg>
            Primer mes
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" /></svg>
            Sellado
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            Honorarios
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
            Admin. + verif.
          </li>
        </ul>

        <Link href="/recursos/calculadora-alquiler" className="cta">
          Calcular costos iniciales
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  )
}
