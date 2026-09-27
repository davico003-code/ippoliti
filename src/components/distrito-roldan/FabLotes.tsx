'use client'

// Botón flotante "Ver lotes y precios" de Distrito Roldán.
//
// Lleva al plano, que es donde vive el pedido por lote ("Consultar por este
// lote" → Hilo → rota → aviso + tarea a 15 min). Desde el 06-sep-2026 ya no
// abre WhatsApp al celular del corredor: esa consulta no quedaba en Hilo.
//
// 26-sep-2026: se esconde mientras se ve algo que ya ofrece lo mismo o que
// tapaba —el hero (mismo botón), el plano (le tapaba lotes en el celular), el
// cierre de financiación (mismo botón) y el footer (tapaba el mail)—. Esas
// zonas se marcan con data-sin-fab.
//
// data-fab-whatsapp: además lo esconde la hoja del lote del plano cuando se
// abre (globals.css + SeccionPlanoLotes).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Map as MapIcon } from 'lucide-react'

export default function FabLotes({ href }: { href: string }) {
  // Arranca oculto: al cargar se ve el hero, que ya tiene el botón.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const zonas = Array.from(document.querySelectorAll('[data-sin-fab], footer'))
    if (!zonas.length || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const enPantalla = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) enPantalla.add(e.target)
        else enPantalla.delete(e.target)
      }
      setVisible(enPantalla.size === 0)
    })
    zonas.forEach((z) => io.observe(z))
    return () => io.disconnect()
  }, [])

  return (
    <Link
      href={href}
      data-fab-whatsapp
      aria-label="Ver lotes y precios"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`fixed bottom-5 right-5 z-50 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#B35E21] px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(179,94,33,0.45)] transition-[opacity,transform,background-color] duration-200 hover:scale-105 hover:bg-[#9d4f18] motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <MapIcon className="h-5 w-5" aria-hidden />
      Ver lotes y precios
    </Link>
  )
}
