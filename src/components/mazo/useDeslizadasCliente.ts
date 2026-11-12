import { useEffect, useRef } from 'react'
import { type ClienteMazo, mandarDeslizadasCliente } from '@/lib/mazo-consulta'

/**
 * Lo que deslizó (lib/mazo-deslizadas.ts) viaja al link de su asesor al cerrar
 * el mazo o al dejar la pestaña (en el iPhone, cambiar de app). Además sale
 * con cada ♥ que llegó (reaccionarEnSeleccion): si cierra de golpe, ya está.
 */
export function useDeslizadasCliente(cliente: ClienteMazo | null): void {
  // El objeto llega nuevo en cada render: manda el token, no la identidad.
  const actual = useRef(cliente)
  actual.current = cliente
  const token = cliente?.token ?? null
  useEffect(() => {
    if (!token) return
    const alIrse = () => {
      if (document.visibilityState === 'hidden') mandarDeslizadasCliente(actual.current)
    }
    document.addEventListener('visibilitychange', alIrse)
    return () => {
      document.removeEventListener('visibilitychange', alIrse)
      mandarDeslizadasCliente(actual.current)
    }
  }, [token])
}
