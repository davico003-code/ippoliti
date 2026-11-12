'use client'

// Una sola vez por carga: si la persona llegó por un link compartido
// (utm_medium=compartir), sus utm quedan para el resto de la visita y viajan
// con la consulta que haga después (lib/pauta-visita.ts → urlConUtmDePauta).

import { useEffect } from 'react'
import { marcarVisitaCompartida } from '@/lib/pauta-visita'

export default function CapturaCompartido() {
  useEffect(() => {
    marcarVisitaCompartida()
  }, [])
  return null
}
