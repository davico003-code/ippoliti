import { useCallback, useEffect, useRef, useState } from 'react'
import type { ItemFeed } from '@/lib/feed-en-red'
import { completarFotos } from '@/lib/mazo-items'

/**
 * Las nuestras vienen del listado con las 5 fotos de la tarjeta: el mazo pide
 * las del álbum (hasta 10 = 5 pares, David 4-oct) de las casas que tiene.
 * Devuelve `conFotos`: la casa con su álbum completo, si ya llegó.
 */
export function useAlbumMazo(todos: ItemFeed[]) {
  const [album, setAlbum] = useState<Record<string, string[]>>({})
  const pedidas = useRef(new Set<string>())
  useEffect(() => {
    // Todas las que faltan, en tandas de 16 (lo que acepta fotos-mazo): sin tope
    // chico (hasta 40 nuestras, David 5-oct) la 17ª en adelante también tiene sus 5 pares.
    const faltan = todos.filter((i) => i.esNuestra && i.key.startsWith('n:') && !pedidas.current.has(i.key))
    if (!faltan.length) return
    faltan.forEach((i) => pedidas.current.add(i.key))
    for (let t = 0; t < faltan.length; t += 16) {
      const ids = faltan
        .slice(t, t + 16)
        .map((i) => i.key.slice(2))
        .join(',')
      fetch(`/api/propiedades/fotos-mazo?ids=${ids}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { fotos?: Record<string, string[]> } | null) => {
          if (!d?.fotos) return
          setAlbum((a) => {
            const nuevo = { ...a }
            for (const [id, fotos] of Object.entries(d.fotos!)) if (Array.isArray(fotos)) nuevo[`n:${id}`] = fotos
            return nuevo
          })
        })
        .catch(() => {})
    }
  }, [todos])
  const conFotos = useCallback(
    (i: ItemFeed | null): ItemFeed | null => (i && album[i.key] ? { ...i, fotos: completarFotos(i.fotos, album[i.key]) } : i),
    [album],
  )
  return conFotos
}
