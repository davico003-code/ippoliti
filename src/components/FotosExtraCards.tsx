'use client'

// Fotos 2-5 de las tarjetas de /propiedades. El HTML del listado lleva solo la
// portada de cada propiedad (ver conSoloPortada en lib/projections): las demás
// se piden UNA vez, cuando la página terminó de cargar, para no competir con la
// foto principal en el celu. Fuera del provider el hook devuelve null y la
// tarjeta usa las fotos que trae (home, similares).

import { createContext, useContext, useEffect, useState } from 'react'
import { type TokkoProperty, getAllPhotos, getMainPhoto } from '@/lib/tokko'

/** `sizes` de las fotos del listado. La vista previa del mapa usa el mismo: el
 *  navegador reusa la foto que ya bajó la tarjeta y Vercel no achica otra. */
export const SIZES_FOTO_LISTADO = '(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 48vw, 25vw'

const Ctx = createContext<Record<string, string[]> | null>(null)

export function FotosExtraProvider({ children }: { children: React.ReactNode }) {
  const [fotos, setFotos] = useState<Record<string, string[]> | null>(null)

  useEffect(() => {
    let vivo = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const pedir = () => {
      fetch('/api/propiedades/list-cards?fotos=extra')
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json() as Promise<{ fotos?: Record<string, string[]> }>
        })
        .then((data) => {
          if (vivo && data.fotos) setFotos(data.fotos)
        })
        // Si falla, las cards quedan con la portada y el listado anda igual.
        .catch((e) => console.warn('[fotos-extra]', e))
    }
    const despues = () => { timer = setTimeout(pedir, 300) }
    if (document.readyState === 'complete') despues()
    else window.addEventListener('load', despues, { once: true })
    return () => {
      vivo = false
      clearTimeout(timer)
      window.removeEventListener('load', despues)
    }
  }, [])

  return <Ctx.Provider value={fotos}>{children}</Ctx.Provider>
}

export function useFotosExtra(id: number | string): string[] | null {
  return useContext(Ctx)?.[String(id)] ?? null
}

/** Fotos de una propiedad del listado: las que trae y, si llegó con la portada
 *  sola, las 2-5 del provider. Tarjetas y vista previa del mapa. */
export function useFotosDeLaPropiedad(property: TokkoProperty): string[] {
  const photos = getAllPhotos(property)
  const fallback = getMainPhoto(property)
  const base = photos.length > 0 ? photos : fallback ? [fallback] : []
  const extra = useFotosExtra(property.id)
  return extra && base.length === 1 ? [base[0], ...extra.filter(u => u !== base[0])] : base
}
