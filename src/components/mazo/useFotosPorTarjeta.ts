import { type RefObject, useEffect, useLayoutEffect, useState } from 'react'

// En el servidor (la tarjeta 'quieta' de la ficha se dibuja ahí) no hay layout que medir.
const useLayoutEffectSeguro = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * De a cuántas fotos va la tarjeta del mazo (David 6-oct): 3 cuando la pantalla
 * es alta, 2 cuando no. Con las barras de Safari (iPhone 13: 664 px) de a 3
 * quedaban tiras de 2,5:1; con la pantalla entera, de a 3 se ven casi en su
 * forma. Regla: 3 solo si cada foto queda, como mucho, el doble de ancha que de
 * alta (alto del lugar de las fotos ≥ 1,5 × el ancho). Se mide antes de pintar
 * (sin salto al abrir) y se vuelve a medir si cambia el tamaño.
 */
export function useFotosPorTarjeta(ref: RefObject<HTMLElement>, activo: boolean): 2 | 3 {
  const [n, setN] = useState<2 | 3>(3)
  useLayoutEffectSeguro(() => {
    const el = ref.current
    if (!activo || !el) return
    const medir = () => setN(el.clientHeight >= el.clientWidth * 1.5 ? 3 : 2)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, activo])
  return activo ? n : 2
}
