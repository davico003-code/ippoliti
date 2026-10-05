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

/**
 * La foto curada de ESE barrio. `mismoBarrio` junta de más para esto ("Vida
 * Barrio Cerrado" ≈ "Vida Club de Campo": salía la foto de otro barrio), así
 * que manda el nombre: igual, o uno completa al otro ("Kentucky" ↔ "Kentucky
 * Club de Campo", "Cadaques" ↔ "Funes Hills Cadaqués"). Si solo coinciden por
 * `mismoBarrio`, vale únicamente si hay UNA candidata; con dudas, sin foto
 * (va con el nombre).
 */
export function fotoDelBarrio(fotos: FotoBarrio[], nombre: string, usadas: ReadonlySet<string> = new Set()): FotoBarrio | null {
  // Se elige entre TODAS (no solo las libres): si la suya ya está usada (otro
  // nombre del mismo barrio, "Vida Crystal Lagoon" = "Vida Lagoon"), sin foto;
  // nunca la de otro barrio por descarte.
  const n = llano(nombre)
  const elegir = (): FotoBarrio | null => {
    const exacta = fotos.find((f) => llano(f.nombre) === n)
    if (exacta) return exacta
    const completa = fotos.filter((f) => {
      const c = llano(f.nombre)
      return c.endsWith(` ${n}`) || n.startsWith(`${c} `)
    })
    if (completa.length) return completa.length === 1 ? completa[0] : null
    const parecidas = fotos.filter((f) => mismoBarrio(f.nombre, nombre))
    return parecidas.length === 1 ? parecidas[0] : null
  }
  const f = elegir()
  return f && !usadas.has(f.foto) ? f : null
}

const barriosConTipo = (catalogo: ZonaHogar[], tipo: TipoHogar) =>
  catalogo.filter((z) => !z.esCiudad && cantidadZona(z, tipo) > 0).sort((a, b) => cantidadZona(b, tipo) - cantidadZona(a, tipo))

export function armarPortadas(catalogo: ZonaHogar[], fotos: FotoBarrio[], tipo: TipoHogar, max = MAX_BARRIOS_MOSAICO): BarrioPortada[] {
  const usadas = new Set<string>()
  const out: BarrioPortada[] = []
  for (const zona of barriosConTipo(catalogo, tipo)) {
    if (out.length >= max) break
    const f = fotoDelBarrio(fotos, zona.nombre, usadas)
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
