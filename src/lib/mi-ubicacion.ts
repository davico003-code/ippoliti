// La ubicación del navegador para "Cerca mío" (Conocé tu próximo hogar, David
// 5-oct-2026). Precisión baja a propósito: sale más rápido y alcanza, porque
// el punto se redondea a ~100 m antes de salir del navegador (no viaja dónde
// está la persona exacto, ni se guarda en ningún lado).

import { type PuntoCerca, redondearPunto } from '@/lib/feed-en-red'

/** 'denegada' = no dio permiso; 'fallo' = no se pudo (sin señal, apagada, tardó). */
export type FalloUbicacion = 'denegada' | 'fallo'

export function pedirUbicacion(): Promise<PuntoCerca> {
  return new Promise((resolve, reject: (motivo: FalloUbicacion) => void) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return reject('fallo')
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(redondearPunto(pos.coords.latitude, pos.coords.longitude)),
      (err) => reject(err.code === err.PERMISSION_DENIED ? 'denegada' : 'fallo'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 },
    )
  })
}
