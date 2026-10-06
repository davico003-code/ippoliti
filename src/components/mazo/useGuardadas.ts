import { useCallback, useEffect, useRef, useState } from 'react'
import { type GuardadaLocal, type ItemFeed, escribirGuardadas, leerGuardadas } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { canalTinder, contarTinder, type OrigenTinder } from '@/lib/tinder-contador'

const CLAVE_CORAZONES = 'si-corazones-contados'
/**
 * ♥ a una casa NUESTRA → el informe al dueño ("N personas la marcaron como
 * favorita", /api/propiedades/corazon → Hilo). Una vez por navegador y casa:
 * sacar el ♥ y volver a ponerlo no suma otra persona.
 */
function contarCorazon(key: string): void {
  const id = /^n:(\d{1,12})$/.exec(key)?.[1]
  // La vista previa del asesor (vista=asesor) no es una persona interesada: no va al informe.
  if (!id || canalTinder() === 'asesor') return
  try {
    const ya = JSON.parse(window.localStorage.getItem(CLAVE_CORAZONES) ?? '[]') as unknown
    const lista = Array.isArray(ya) ? ya.filter((k): k is string => typeof k === 'string') : []
    if (lista.includes(id)) return
    window.localStorage.setItem(CLAVE_CORAZONES, JSON.stringify([...lista, id].slice(-300)))
  } catch {
    /* sin almacenamiento: el servidor igual deduplica por IP */
  }
  void fetch('/api/propiedades/corazon', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
}

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
    contarCorazon(item.key)
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
