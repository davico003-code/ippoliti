'use client'

import { useEffect, useState } from 'react'

// template.tsx se re-monta en cada navegación (a diferencia de layout.tsx, que
// persiste). Envolvemos el contenido de la página en un fade de entrada para que
// moverse por el sitio se sienta suave y premium, sin cortes secos. Solo anima
// opacidad → no crea containing block, así los elementos position:fixed de la
// página (barras sticky, popups) no se descolocan durante la transición.
//
// La PRIMERA página (la que llega de Google, la que mide el LCP) entra sin fade:
// los 0,3 s de opacidad le sumaban ~300 ms al LCP de cada página (medido 16-oct:
// Vida Lagoon 922 → 596 ms, blog 1008 → 676 ms). El fade queda para las
// navegaciones de adentro del sitio. En el servidor `navego` es siempre false
// (useEffect no corre ahí), así el HTML y la hidratación coinciden.
let navego = false

export default function Template({ children }: { children: React.ReactNode }) {
  const [conFade] = useState(() => navego)
  useEffect(() => {
    navego = true
  }, [])
  return (
    <div className="si-page-enter" data-sin-fade={conFade ? undefined : ''}>
      {children}
    </div>
  )
}
