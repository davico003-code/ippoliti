'use client'

// Agentes de las propiedades visibles en /propiedades, para la pastilla de las
// tarjetas. Se piden por tandas (las ids que todavía no conocemos) a
// /api/propiedades/agentes; fuera del provider el hook devuelve undefined y la
// tarjeta va sin pastilla.

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { AgentePropiedad } from '@/lib/agentes-por-propiedad'

const Ctx = createContext<Record<number, AgentePropiedad | null>>({})

export function AgentesPropiedadProvider({ ids, children }: { ids: number[]; children: React.ReactNode }) {
  const [agentes, setAgentes] = useState<Record<number, AgentePropiedad | null>>({})
  const pedidos = useRef(new Set<number>())
  const clave = ids.join(',')

  useEffect(() => {
    const faltan = ids.filter((id) => !pedidos.current.has(id))
    if (!faltan.length) return
    faltan.forEach((id) => pedidos.current.add(id))
    for (let i = 0; i < faltan.length; i += 60) {
      const tanda = faltan.slice(i, i + 60)
      fetch(`/api/propiedades/agentes?ids=${tanda.join(',')}`)
        .then((r) => (r.ok ? r.json() : {}))
        .then((data: Record<string, AgentePropiedad>) => {
          setAgentes((prev) => {
            const next = { ...prev }
            for (const id of tanda) next[id] = data[id] ?? null
            return next
          })
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  return <Ctx.Provider value={agentes}>{children}</Ctx.Provider>
}

export function useAgentePropiedad(id: number): AgentePropiedad | undefined {
  return useContext(Ctx)[id] ?? undefined
}
