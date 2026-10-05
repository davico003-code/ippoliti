import { useCallback, useEffect, useRef, useState } from 'react'
import { type GuardadaLocal, type ItemFeed, escribirGuardadas, leerGuardadas } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { contarTinder, type OrigenTinder } from '@/lib/tinder-contador'

/**
 * Las ♥ de este navegador (localStorage: sobreviven al pasar de una ficha a
 * otra). `montado` = ya se leyó el almacenamiento (antes, nada se muestra
 * guardado: evita el desfasaje con el HTML del servidor).
 */
export function useGuardadas(origen?: OrigenTinder) {
  const [guardadas, setGuardadas] = useState<GuardadaLocal[]>([])
  const [montado, setMontado] = useState(false)
  const actuales = useRef<GuardadaLocal[]>([])
  useEffect(() => {
    actuales.current = leerGuardadas()
    setGuardadas(actuales.current)
    setMontado(true)
  }, [])
  const guardar = useCallback((item: ItemFeed) => {
    if (actuales.current.some((g) => g.key === item.key)) return
    const next = [...actuales.current, { key: item.key, foto: item.fotos[0] ?? null, precio: item.precio, esNuestra: item.esNuestra, logo: item.logo ?? null }].slice(-12)
    actuales.current = next
    setGuardadas(next)
    escribirGuardadas(next)
    trackEvent('feed_en_red_like', { tipo: item.esNuestra ? 'nuestra' : 'en_red' })
    if (origen) contarTinder('like', origen)
  }, [origen])
  /** Sacar el ♥ (la fila de la compu permite arrepentirse). */
  const quitar = useCallback((key: string) => {
    const next = actuales.current.filter((g) => g.key !== key)
    if (next.length === actuales.current.length) return
    actuales.current = next
    setGuardadas(next)
    escribirGuardadas(next)
  }, [])
  const limpiar = useCallback(() => {
    actuales.current = []
    setGuardadas([])
    escribirGuardadas([])
  }, [])
  const esGuardada = useCallback((key: string) => guardadas.some((g) => g.key === key), [guardadas])
  return { guardadas, guardar, quitar, limpiar, esGuardada, montado }
}
