'use client'

import { useSyncExternalStore } from 'react'

// ¿La pantalla está parada (más alta que ancha)? Decide qué versión de cada
// plano mostrar (lib/planos.ts). Se lee de una, sin esperar a un efecto: así
// el plano no se baja dos veces (acostado y después parado). En el server no
// hay pantalla: false, y el cliente corrige al hidratar.
const QUERY = '(orientation: portrait)'

function suscribir(avisar: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', avisar)
  return () => mql.removeEventListener('change', avisar)
}

export function usePantallaVertical(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
