'use client'

import { useSyncExternalStore } from 'react'

// ¿La web está en modo oscuro? Lo decide el script del layout en
// <html data-theme> (preferencia guardada o la del sistema) y ThemeToggle lo
// cambia en vivo: se escucha el atributo. En el server no hay tema: claro, y
// el cliente corrige al hidratar.
function suscribir(avisar: () => void) {
  const obs = new MutationObserver(avisar)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => obs.disconnect()
}

export function useTemaOscuro(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => document.documentElement.dataset.theme === 'dark',
    () => false,
  )
}
