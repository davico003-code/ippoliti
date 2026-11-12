'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

const NUMERO_GENERAL = '5493413340916'

export default function FloatingWhatsApp() {
  const pathname = usePathname()

  // Guard defensivo (mismo criterio que ConditionalChrome/FooterWrapper):
  // usePathname puede devolver null en edge cases del App Router.
  if (!pathname) return null

  // Hide on property detail pages (they have their own sticky bar with WhatsApp)
  if (pathname.startsWith('/propiedades/') && pathname !== '/propiedades') return null
  if (pathname.startsWith('/seleccion/')) return null
  // /consulta/{slug}: es la landing de la pauta "formulario vs WhatsApp
  // directo", con UNA sola acción (el formulario). La burbuja iba al número
  // general y no al captador, y ese toque no dejaba Lead en el píxel ni
  // consulta en Hilo: ensuciaba la prueba. El WhatsApp del captador ya está
  // debajo del formulario como camino secundario.
  if (pathname.startsWith('/consulta/')) return null
  // /tasaciones: el pedido va a Hilo, no a WhatsApp; además el CTA fijo de abajo
  // ocupa ese lugar.
  if (pathname.startsWith('/tasaciones')) return null
  // /conoce-tu-hogar: igual, el CTA fijo de abajo (y la consulta va a Hilo desde el mazo).
  if (pathname.startsWith('/conoce-tu-hogar')) return null
  // Hide en las landings de emprendimiento del CRM (/emprendimientos/{id}-slug):
  // cada una trae su FAB con el mensaje del emprendimiento ya escrito. Las
  // páginas propias (fincazul, clientes manuales) no empiezan con ID y lo conservan.
  if (/^\/emprendimientos\/\d+-/.test(pathname)) return null
  // Hide on /dockgarden — mismo patrón: FAB propio con texto pre-cargado.
  if (pathname === '/dockgarden') return null
  // Fisherton Work trae su FAB con el mensaje del emprendimiento ya escrito.
  if (pathname === '/emprendimientos/fisherton-work') return null
  // Tierra Nueva, ídem.
  if (pathname === '/emprendimientos/tierra-nueva') return null
  // Hide on /recursos — la propia página tiene su CTA "Hablar con un agente"
  // en el bloque verde inferior con el mismo número.
  if (pathname === '/recursos') return null
  // Hide en SI School (herramienta interna): se montaba sobre el botón
  // "Capacitaciones" del celular y sobre la columna de capacitaciones.
  if (pathname.startsWith('/recursos/si-school')) return null
  // Hide on /propiedades — se superpone al control de zoom del mapa y los
  // filtros ya saturan la vista. Estricto: /propiedades/[id] sí lo conserva.
  if (pathname === '/propiedades') return null

  // Texto prearmado con la página de origen: el chat llegaba con "Hola" a secas
  // y el agente tenía que preguntar "¿qué estabas viendo?". Se arma en el
  // render con el pathname (nada de location: este componente también se
  // renderiza en el servidor) y sin await, así el toque abre WhatsApp directo.
  const texto = `Hola, te escribo desde siinmobiliaria.com${pathname === '/' ? '' : pathname}`
  const href = `https://wa.me/${NUMERO_GENERAL}?text=${encodeURIComponent(texto)}`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Mismo evento que events.clickWhatsapp(), más la página de origen para
      // poder separar en GA qué páginas generan chats al número general.
      onClick={() => trackEvent('click_whatsapp', { property_id: '', property_title: '', origen: pathname })}
      // Se esconde mientras una hoja del plano de lotes está abierta (globals.css).
      data-fab-whatsapp
      // Antes se ocultaba en la home mobile porque FooterMobile tenía su CTA de
      // WhatsApp; ese footer se sacó en jun-2026 y la home quedó sin WhatsApp.
      // bottom con el área segura: con viewport-fit=cover, 16 px a secas caían
      // sobre la barrita de inicio del iPhone (en md vuelve a bottom-6).
      className="si-tap fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] right-4 z-50 p-3 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-all hover:bg-[#128C7E] md:bottom-6 md:right-6 md:p-4 md:hover:-translate-y-1 md:hover:scale-105 flex items-center justify-center"
      aria-label="Contactar por WhatsApp"
    >
      {/* Sin el punto rojo de "mensaje sin leer": no había ningún mensaje
          detrás, era una notificación falsa. */}
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
    </Link>
  )
}
