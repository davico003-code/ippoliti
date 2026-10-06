import { useEffect, useMemo, useRef, useState } from 'react'
import { type DecisionMazo, type ItemFeed, aplicarOrden, ordenarPorGusto } from '@/lib/feed-en-red'

type Decision = { indice: number; accion: DecisionMazo; key: string }

/**
 * EL MAZO QUE APRENDE (David, 5-oct-2026). Después de cada decisión reordena
 * las que faltan según lo que le gustó (ordenarPorGusto, con test). Nunca
 * mueve las ya vistas, la que está saliendo ni la que ya se ve abajo. ↺ no
 * reordena. Si cambian las casas (afinó la búsqueda), arranca de cero; las que
 * se suman en el medio (barrios parecidos) van donde está parado.
 */
export function useMazoQueAprende({
  items,
  todos,
  historial,
  indice,
  insertarEn,
  activo,
}: {
  /** Las casas que le pasaron al mazo: si cambian, el orden aprendido no vale más. */
  items: ItemFeed[]
  /** Las del mazo (items + parecidos sumados). */
  todos: ItemFeed[]
  historial: readonly Decision[]
  indice: number
  /** Dónde se sumaron las de los barrios parecidos (fijo; null = no hay). */
  insertarEn: number | null
  activo: boolean
}): ItemFeed[] {
  const [orden, setOrden] = useState<{ para: ItemFeed[]; keys: string[] } | null>(null)
  const vigente = activo && orden?.para === items ? orden.keys : null
  const mazo = useMemo(() => aplicarOrden(todos, vigente, insertarEn ?? indice), [todos, vigente, insertarEn, indice])
  const vistas = useRef(new WeakSet<Decision>())

  useEffect(() => {
    const ultima = historial[historial.length - 1]
    if (!activo || !ultima || vistas.current.has(ultima)) return // sin decisiones, o ↺
    vistas.current.add(ultima)
    const fijas = mazo.slice(0, ultima.indice + 2)
    const porKey = new Map(mazo.map((i) => [i.key, i]))
    const decididas = historial.flatMap((h) => {
      const item = porKey.get(h.key)
      return item ? [{ item, accion: h.accion }] : []
    })
    const resto = ordenarPorGusto(mazo.slice(ultima.indice + 2), decididas)
    setOrden({ para: items, keys: [...fijas, ...resto].map((i) => i.key) })
    // Solo cuando decide algo nuevo (no cada vez que cambia el mazo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historial, activo])

  return mazo
}
