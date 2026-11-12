// Convención del sitio: Raleway para textos, Poppins (.font-numeric) para
// números. <Num> recibe un texto y envuelve solo las cifras ("36", "USD 2.222",
// "46,30 m²", "2,2 km") en .font-numeric, sin pasar el resto a Poppins.

import { Fragment } from 'react'

const CIFRA = /(\d[\d.,]*(?:º)?)/g

export default function Num({ children }: { children: string }) {
  const partes = children.split(CIFRA)
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-numeric">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}
