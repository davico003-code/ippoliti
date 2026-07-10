'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  // Panel /fichas: layout propio sin footer.
  if (pathname === '/fichas' || pathname?.startsWith('/fichas/')) return null
  if (pathname === '/agentes/seleccion') return null
  if (pathname?.startsWith('/seleccion/')) return null

  // Home: usa el mismo footer blanco global (responsive) que el resto del sitio.
  // El FooterMobile propio se removió de page.tsx para no duplicar.

  // /propiedades y /propiedades/[slug]: vista tipo app (desktop) — el footer
  // se renderiza dentro del panel de la ficha cuando está abierta, no en el
  // listado/mapa. Mobile conserva el footer global normal en /propiedades/[slug].
  if (pathname === '/propiedades') {
    return null
  }
  if (pathname?.startsWith('/propiedades/')) {
    // En desktop ocultamos (lo renderiza el panel). En mobile la ruta [slug]
    // sigue siendo la ficha completa y mantiene el footer global.
    return (
      <div className="md:hidden">
        <Footer />
      </div>
    )
  }

  // Todas las demás rutas: footer global estándar
  return <Footer />
}
