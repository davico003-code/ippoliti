// "Conocé tu próximo hogar" en mosaico (David, 4-oct-2026: la pantalla de
// filtros "no me convence"): en vez de escribir el barrio, se toca su foto.
// Cada barrio lleva de portada una casa NUESTRA (sin logos de colegas):
// destacada primero, después la más cara (la más vistosa). Orden = dónde hay
// más del tipo elegido (catálogo de Hilo, nuestras + red).

import { type TipoHogar, type ZonaHogar, TIPOS_HOGAR, cantidadZona, enZonaBuscada } from '@/lib/feed-en-red'

export type BarrioPortada = { zona: ZonaHogar; foto: string }

/** Lo mínimo de cada nuestra para elegir la portada. */
export type NuestraPortada = {
  tipoId: number | null
  barrio: string | null
  ubicacionCompleta: string | null
  foto: string | null
  destacada: boolean
  precioUsd: number | null
}

export const MAX_BARRIOS_MOSAICO = 8

export function armarPortadas(catalogo: ZonaHogar[], nuestras: NuestraPortada[], tipo: TipoHogar, max = MAX_BARRIOS_MOSAICO): BarrioPortada[] {
  const ids = new Set(TIPOS_HOGAR.find((t) => t.id === tipo)!.tokkoIds)
  const delTipo = nuestras.filter((n) => n.foto && ids.has(n.tipoId ?? -1))
  const usadas = new Set<string>()
  const out: BarrioPortada[] = []
  const barrios = catalogo.filter((z) => !z.esCiudad && cantidadZona(z, tipo) > 0).sort((a, b) => cantidadZona(b, tipo) - cantidadZona(a, tipo))
  for (const zona of barrios) {
    if (out.length >= max) break
    const portada = delTipo
      .filter((n) => enZonaBuscada(zona.nombre, { nombre: n.barrio, completa: n.ubicacionCompleta }) && !usadas.has(n.foto!.split('?')[0]))
      .sort((a, b) => Number(b.destacada) - Number(a.destacada) || (b.precioUsd ?? 0) - (a.precioUsd ?? 0))[0]
    if (!portada) continue
    usadas.add(portada.foto!.split('?')[0])
    out.push({ zona, foto: portada.foto! })
  }
  return out
}
