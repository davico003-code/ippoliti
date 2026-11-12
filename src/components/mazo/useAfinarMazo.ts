import { useEffect, useRef, useState } from 'react'
import type { AfinarMazo } from './AfinarBusqueda'

/**
 * Vino de un anuncio (`afinar.alEntrar`, David 6-oct): apenas se va el
 * instructivo (o enseguida, si ya lo había visto), "¿Qué buscás?". Una vez.
 */
export function useAfinarAlEntrar(alEntrar: boolean, guia: boolean, abrir: () => void) {
  const pendiente = useRef(alEntrar)
  useEffect(() => {
    if (guia || !pendiente.current) return
    pendiente.current = false
    abrir()
    // Cuando se va el instructivo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guia])
}

/** Aviso cortito abajo ("Listo, te escribimos…"): se va solo. */
export function useAvisoMazo() {
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(() => setAviso(null), 3800)
    return () => window.clearTimeout(t)
  }, [aviso])
  return [aviso, setAviso] as const
}

/**
 * Afinó la búsqueda: llegan otras casas y el mazo arranca de nuevo, sin
 * cerrarse. Por la ronda de "afinar" y no por `items`: en la ficha las casas
 * llegan de a tandas (/similar) con el mazo abierto y no tiene que volver a la
 * primera.
 */
export function useReinicioAfinar(afinar: AfinarMazo | undefined, reiniciar: () => void, avisar: (texto: string) => void) {
  const ronda = afinar?.ronda ?? 0
  const previa = useRef(ronda)
  useEffect(() => {
    if (ronda === previa.current) return
    previa.current = ronda
    reiniciar()
    avisar('Listo: te mostramos las que van con eso.')
    // Solo cuando cambia la ronda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ronda])
  const estado = afinar?.estado
  useEffect(() => {
    if (estado === 'vacio') avisar('Con eso no encontramos. Probá con otro precio o zona.')
    // Solo cuando cambia el estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
}
