'use client'

// "← Volver" del header de la ficha en el celu (ver lib/volver-listado.ts).
// Si la ficha se abrió desde el listado, vuelve con router.back(): mismo
// filtro, misma posición. Si se llegó por un link (WhatsApp, Google), va a la
// última búsqueda de la sesión o al listado completo. El texto es fijo
// ("Volver": entra en la columna de 111 px del header de 375 px) para que el
// SSR y el cliente coincidan y no parpadee.
//
// variante "pie": el "← Volver al catálogo" del final de la ficha. Antes era un
// link fijo a /propiedades y volvía distinto que el del header (al listado
// entero, sin el filtro): ahora las dos salidas hacen lo mismo.

import Link from 'next/link'
import type { MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { leerUltimoListado, vinoDelListado } from '@/lib/volver-listado'
import { haptico } from '@/lib/haptico'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

interface Props {
  /** 'cabecera' (por defecto): el "← Volver" del header. 'pie': "← Volver al catálogo". */
  variante?: 'cabecera' | 'pie'
}

export default function VolverAlListado({ variante = 'cabecera' }: Props) {
  const router = useRouter()

  const volver = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    haptico()
    if (vinoDelListado(window.location.pathname) && window.history.length > 1) {
      router.back()
      return
    }
    router.push(leerUltimoListado() ?? '/propiedades')
  }

  if (variante === 'pie') {
    return (
      <Link
        href="/propiedades"
        onClick={volver}
        // 44 px de alto, como el del header: era un texto suelto de 24 px.
        className="si-tap -ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-full px-2 text-base font-bold"
        style={{ fontFamily: R, color: 'var(--theme-accent, #1A5C38)' }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Volver al catálogo</span>
      </Link>
    )
  }

  return (
    <Link
      href="/propiedades"
      aria-label="Volver a las propiedades"
      onClick={volver}
      // 44 px de alto: era un texto de ~20 px, difícil de acertar con el pulgar.
      className="si-tap -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-gray-700"
      style={{ fontFamily: R }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span>Volver</span>
    </Link>
  )
}
