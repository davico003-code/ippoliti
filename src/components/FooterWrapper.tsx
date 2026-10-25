'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  // Panel /fichas: layout propio sin footer.
  if (pathname === '/fichas' || pathname?.startsWith('/fichas/')) return null
  if (pathname === '/agentes/seleccion') return null
  if (pathname?.startsWith('/seleccion/')) return null

  // Landing compartible de Dock Garden: chrome propio (header + CTA de cierre).
  if (pathname === '/dockgarden') return null

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
    // En la ficha (exactamente /propiedades/<slug>) la barra fija de abajo
    // (MobileStickyBar, ~70 px + área segura) tapaba la última fila del footer:
    // el © y la matrícula. El aire va acá, debajo del footer, y no en la
    // página: el footer es lo último que se ve. /propiedades/<slug>/placa no
    // tiene barra y queda como estaba.
    const esFicha = pathname.split('/').filter(Boolean).length === 2
    return (
      <div
        className="md:hidden"
        style={esFicha ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)', background: 'var(--background)' } : undefined}
      >
        <Footer />
      </div>
    )
  }

  // Todas las demás rutas: footer global estándar
  return <Footer />
}
