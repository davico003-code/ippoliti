// "Conocé tu próximo hogar" en mosaico (David, 4-oct-2026: la pantalla de
// filtros "no me convence"): en vez de escribir el barrio, se toca su foto.
// La foto es DEL BARRIO (aérea, club house, laguna — las curadas de
// /barrios-privados), nunca de una casa (David: "no pongas foto de casa, no
// tiene nada que ver"). Los barrios sin foto curada van con su nombre.
// Orden = dónde hay más del tipo elegido (catálogo de Hilo, nuestras + red).

import { type TipoHogar, type ZonaHogar, cantidadZona, mismoBarrio } from '@/lib/feed-en-red'

/** `nombre` = el que se muestra (Hilo dice "Cadaques"; la tarjeta, "Funes Hills Cadaqués"). */
export type BarrioPortada = { zona: ZonaHogar; foto: string; nombre: string }

/** Foto curada de un barrio (lib/barrios → getBarriosHub). */
export type FotoBarrio = { nombre: string; foto: string }

export const MAX_BARRIOS_MOSAICO = 8
export const MAX_BARRIOS_NOMBRE = 10

const llano = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

/**
 * El nombre curado si es el completo del de Hilo ("Funes Hills Cadaqués" ⊃
 * "Cadaques"); si no, el de Hilo ("La Finca" no pasa a "La Finca 1": el mazo
 * trae las dos).
 */
function nombreVisible(curado: string, hilo: string): string {
  return llano(curado).endsWith(llano(hilo)) ? curado : hilo
}

const barriosConTipo = (catalogo: ZonaHogar[], tipo: TipoHogar) =>
  catalogo.filter((z) => !z.esCiudad && cantidadZona(z, tipo) > 0).sort((a, b) => cantidadZona(b, tipo) - cantidadZona(a, tipo))

export function armarPortadas(catalogo: ZonaHogar[], fotos: FotoBarrio[], tipo: TipoHogar, max = MAX_BARRIOS_MOSAICO): BarrioPortada[] {
  const usadas = new Set<string>()
  const out: BarrioPortada[] = []
  for (const zona of barriosConTipo(catalogo, tipo)) {
    if (out.length >= max) break
    const f = fotos.find((x) => !usadas.has(x.foto) && mismoBarrio(x.nombre, zona.nombre))
    if (!f) continue
    usadas.add(f.foto)
    out.push({ zona, foto: f.foto, nombre: nombreVisible(f.nombre, zona.nombre) })
  }
  return out
}

/** Los que siguen (con más del tipo) que no están en el mosaico: van con el nombre. */
export function barriosConNombre(catalogo: ZonaHogar[], mosaico: BarrioPortada[], tipo: TipoHogar, max = MAX_BARRIOS_NOMBRE): ZonaHogar[] {
  const enMosaico = new Set(mosaico.map((m) => m.zona.nombre))
  return barriosConTipo(catalogo, tipo)
    .filter((z) => !enMosaico.has(z.nombre))
    .slice(0, max)
}
