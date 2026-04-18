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

  // Todas las demás rutas: footer global estándar
  return <Footer />
}
