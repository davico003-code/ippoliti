'use client'

// "¿Sos colega? Copiá la ficha sin marca": renglón discreto al final de la
// ficha en el celu, arriba de "Volver al catálogo".
//
// Por qué acá y no en el menú de Compartir: en el celu, el visitante común
// comparte con la hoja nativa en un toque (sin menú propio), así que el "Link
// para colega" dejó de estar a mano. Los colegas de otras inmobiliarias lo
// siguen usando (la ficha en verficha.casa, sin logo ni teléfonos de SI): queda
// para quien lo busca, fuera del camino del comprador.
//
// generarYCopiarFichaLink reserva el portapapeles DENTRO del toque (iOS lo
// pierde después de un await), muestra el toast ("Link copiado · Vence en 60
// días" o el error) y registra el compartido como 'colega'.

import { useEffect, useRef, useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import { haptico } from '@/lib/haptico'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const ACENTO = 'var(--theme-accent, #1A5C38)'

type Estado = 'quieto' | 'generando' | 'copiado'

export default function LinkParaColega({ propertyId }: { propertyId: number }) {
  const [estado, setEstado] = useState<Estado>('quieto')
  const reloj = useRef<number>()
  useEffect(() => () => window.clearTimeout(reloj.current), [])

  const copiar = () => {
    if (estado === 'generando') return
    // Primero la llamada (sin nada antes): es la que toma el portapapeles.
    const tarea = generarYCopiarFichaLink(propertyId)
    setEstado('generando')
    window.clearTimeout(reloj.current)
    void tarea.then((ok) => {
      if (!ok) {
        setEstado('quieto')
        return
      }
      haptico()
      setEstado('copiado')
      reloj.current = window.setTimeout(() => setEstado('quieto'), 2500)
    })
  }

  return (
    <button
      type="button"
      onClick={copiar}
      disabled={estado === 'generando'}
      aria-busy={estado === 'generando'}
      className="si-tap -ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-full px-2 text-left text-sm text-gray-600 disabled:opacity-60"
      style={{ fontFamily: R }}
    >
      {estado === 'copiado' ? (
        <Check className="h-4 w-4 shrink-0" style={{ color: ACENTO }} aria-hidden />
      ) : (
        <Link2 className="h-4 w-4 shrink-0" aria-hidden />
      )}
      <span aria-live="polite">
        {estado === 'generando' ? (
          'Generando el link…'
        ) : estado === 'copiado' ? (
          <span className="font-semibold" style={{ color: ACENTO }}>Link copiado</span>
        ) : (
          <>
            ¿Sos colega? <span className="font-semibold" style={{ color: ACENTO }}>Copiá la ficha sin marca</span>
          </>
        )}
      </span>
    </button>
  )
}
