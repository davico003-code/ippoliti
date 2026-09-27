'use client'

import { useEffect, useState } from 'react'

const CIUDADES = ['Funes', 'Roldán', 'Rosario']
const PASO = 2800

/**
 * "Propiedades en Funes" → Roldán → Rosario. Las tres palabras viven apiladas
 * en la misma celda (el ancho no salta) y se relevan subiendo con un fundido
 * desenfocado; una línea fina debajo marca el tiempo hasta la próxima.
 * Lectores de pantalla y buscadores leen la frase completa.
 */
export default function CiudadRotativa() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((n) => (n + 1) % CIUDADES.length), PASO)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <span className="sr-only">Funes, Roldán y Rosario</span>
      <span aria-hidden="true" className="relative inline-grid align-bottom" style={{ textAlign: 'left' }}>
        {CIUDADES.map((c, j) => {
          const estado = j === i ? 'on' : j === (i + CIUDADES.length - 1) % CIUDADES.length ? 'sale' : 'espera'
          return (
            <span key={c} className="ciudad-rot" data-e={estado} style={{ gridArea: '1 / 1' }}>
              {c}
            </span>
          )
        })}
        <span key={i} className="ciudad-rot-linea" />
      </span>
      <style dangerouslySetInnerHTML={{ __html: `
        .ciudad-rot { font-weight: 800; transition: opacity 700ms cubic-bezier(.2,.7,.2,1), transform 700ms cubic-bezier(.2,.7,.2,1), filter 700ms cubic-bezier(.2,.7,.2,1); }
        .ciudad-rot[data-e="on"] { opacity: 1; transform: none; filter: none; }
        .ciudad-rot[data-e="sale"] { opacity: 0; transform: translate3d(0, -0.55em, 0); filter: blur(6px); }
        .ciudad-rot[data-e="espera"] { opacity: 0; transform: translate3d(0, 0.55em, 0); filter: blur(6px); transition: none; }
        .ciudad-rot-linea { position: absolute; left: 0; right: 0; bottom: -3px; height: 2px; border-radius: 2px; background: rgba(255,255,255,.85); transform-origin: left; animation: ciudadLinea ${PASO}ms linear both; }
        @keyframes ciudadLinea { from { transform: scaleX(0); opacity: .9 } 85% { opacity: .9 } to { transform: scaleX(1); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .ciudad-rot, .ciudad-rot-linea { transition: none; animation: none; } }
      ` }} />
    </>
  )
}
