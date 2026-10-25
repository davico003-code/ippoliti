// Regla de la casa: Raleway para el texto, Poppins SOLO para los números.
// En las frases mezcladas de la home ("Entrega 30% + 24 cuotas", "Catamarca
// 775 | Roldán", "3 dorm · 2 baños", "DESDE 1983") la línea va en Raleway y
// cada número se envuelve en .font-numeric (Poppins tabular). Antes la frase
// entera salía en Poppins, o los números en las cifras antiguas de Raleway.
// Sin hooks: sirve en componentes de servidor y de cliente.

// Números con separador de miles o decimales ("1.200", "2,5") van enteros.
const NUMERO = /(\d+(?:[.,]\d+)*)/

export default function TextoConNumeros({ texto }: { texto: string }) {
  // split con un grupo de captura deja los números en las posiciones impares.
  const partes = texto.split(NUMERO)
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 1 ? <span key={i} className="font-numeric">{parte}</span> : parte,
      )}
    </>
  )
}
