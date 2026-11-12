'use client'

import { useEffect, useState } from 'react'

const CIUDADES = ['Funes', 'Roldán', 'Rosario']
const PASO = 2800
// Dos vueltas y queda quieta en Funes (la primera, la de arranque). Antes
// giraba para siempre debajo del titular, encima del buscador: la atención se
// iba al movimiento y no a la acción. Entrada con propósito y después quietud.
const CAMBIOS = CIUDADES.length * 2

/**
 * "Propiedades en Funes" → Roldán → Rosario. Las tres palabras viven apiladas
 * en la misma celda (el ancho no salta) y se relevan subiendo con un fundido
 * desenfocado. Con "reducir movimiento" no se mueve nunca.
 * Lectores de pantalla y buscadores leen la frase completa.
 */
export default function CiudadRotativa() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cambios = 0
    const id = setInterval(() => {
      cambios += 1
      setI(cambios % CIUDADES.length)
      if (cambios >= CAMBIOS) clearInterval(id)
    }, PASO)
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
      </span>
      <style dangerouslySetInnerHTML={{ __html: `
        .ciudad-rot { font-weight: 800; transition: opacity 700ms cubic-bezier(.2,.7,.2,1), transform 700ms cubic-bezier(.2,.7,.2,1), filter 700ms cubic-bezier(.2,.7,.2,1); }
        .ciudad-rot[data-e="on"] { opacity: 1; transform: none; filter: none; }
        .ciudad-rot[data-e="sale"] { opacity: 0; transform: translate3d(0, -0.55em, 0); filter: blur(6px); }
        .ciudad-rot[data-e="espera"] { opacity: 0; transform: translate3d(0, 0.55em, 0); filter: blur(6px); transition: none; }
        @media (prefers-reduced-motion: reduce) { .ciudad-rot { transition: none; } }
      ` }} />
    </>
  )
}
