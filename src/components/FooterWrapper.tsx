'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  // En home mobile, FooterMobile se renderiza dentro de page.tsx
  // Ocultar el footer global para evitar duplicación
  if (pathname === '/') {
    return (
      <div className="hidden md:block">
        <Footer />
      </div>
    )
  }

  return <Footer />
}
