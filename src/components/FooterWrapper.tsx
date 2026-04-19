'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'
import FooterDesktop from './home/FooterDesktop'

export default function FooterWrapper() {
  const pathname = usePathname()

  if (pathname === '/') {
    // Home mobile: FooterMobile ya está dentro de page.tsx
    // Home desktop: FooterDesktop nuevo
    return (
      <div className="hidden md:block">
        <FooterDesktop />
      </div>
    )
  }

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
