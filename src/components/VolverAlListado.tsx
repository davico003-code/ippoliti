'use client'

// "← Volver" del header de la ficha en el celu (ver lib/volver-listado.ts).
// Si la ficha se abrió desde el listado, vuelve con router.back(): mismo
// filtro, misma posición. Si se llegó por un link (WhatsApp, Google), va a la
// última búsqueda de la sesión o al listado completo. El texto es fijo
// ("Volver": entra en la columna de 111 px del header de 375 px) para que el
// SSR y el cliente coincidan y no parpadee.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { leerUltimoListado, vinoDelListado } from '@/lib/volver-listado'
import { haptico } from '@/lib/haptico'

export default function VolverAlListado() {
  const router = useRouter()
  return (
    <Link
      href="/propiedades"
      aria-label="Volver a las propiedades"
      onClick={e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        haptico()
        if (vinoDelListado(window.location.pathname) && window.history.length > 1) {
          router.back()
          return
        }
        router.push(leerUltimoListado() ?? '/propiedades')
      }}
      // 44 px de alto: era un texto de ~20 px, difícil de acertar con el pulgar.
      className="si-tap -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-gray-700"
      style={{ fontFamily: "var(--font-raleway, 'Raleway'), system-ui, sans-serif" }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span>Volver</span>
    </Link>
  )
}
