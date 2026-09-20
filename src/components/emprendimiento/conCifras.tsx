import type { ReactNode } from 'react'

// Regla de marca: Raleway para texto, Poppins solo para cifras. El copy del CRM
// mezcla ambos ("Entrega 20% y saldo en 36 cuotas"), así que se envuelve cada
// cifra en vez de pasar toda la línea a Poppins.
export function conCifras(texto: string): ReactNode[] {
  return texto.split(/(\d[\d.,]*\s?(?:%|m²)?)/g).map((parte, i) =>
    i % 2 === 1 ? <span key={i} className="font-numeric">{parte}</span> : parte,
  )
}
