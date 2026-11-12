'use client'

// Disponibilidad y precios vivos del plano para la landing.
//
// Se lee en el navegador desde GET /api/plano-lotes (cache CDN 60s) y NO en el
// servidor: la página es ISR y una lectura sin cache ahí adentro la vuelve
// dinámica (ya tiró 500 en las fichas con Upstash). Una sola petición por
// visita, compartida entre todas las secciones que la usan.

import { useEffect, useState } from 'react'
import { resumirPlano, type ResumenPlano } from '@/lib/distrito-roldan/financiacion'

/** undefined = cargando · null = no hay datos (se muestra el respaldo). */
export type PlanoVivo = ResumenPlano | null | undefined

let pedido: Promise<ResumenPlano | null> | null = null

function pedirPlano() {
  pedido ??= fetch('/api/plano-lotes')
    .then((r) => (r.ok ? r.json() : null))
    .then(resumirPlano)
    .catch(() => null)
  return pedido
}

export function usePlanoVivo(): PlanoVivo {
  const [plano, setPlano] = useState<PlanoVivo>(undefined)
  useEffect(() => {
    let vivo = true
    pedirPlano().then((r) => vivo && setPlano(r))
    return () => {
      vivo = false
    }
  }, [])
  return plano
}

export const usd = (n: number) => `U$S ${Math.round(n).toLocaleString('es-AR')}`
