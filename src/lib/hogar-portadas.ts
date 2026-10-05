// "Conocé tu próximo hogar" (David, 4-oct-2026). Primero se elige la CIUDAD
// (Funes · Roldán · Rosario): de ~330 personas que consultaron casas en 90
// días, 2 de cada 3 fueron por barrio ABIERTO (Zona 7, Fisherton, Roldán) y
// los barrios cerrados del primer mosaico casi no aparecían. Los cerrados
// quedan en una tira aparte, con la foto DEL BARRIO (aérea, club house,
// laguna — las curadas de /barrios-privados), nunca de una casa; sin foto
// curada, va el nombre.

import { type TipoHogar, type ZonaHogar, cantidadZona, mismoBarrio } from '@/lib/feed-en-red'

/** Foto curada de un barrio (lib/barrios → getBarriosHub). */
export type FotoBarrio = { nombre: string; foto: string }

/** `nombre` = el que se muestra (Hilo dice "Cadaques"; la tarjeta, "Funes Hills Cadaqués"). */
export type BarrioCerrado = { zona: ZonaHogar; foto: string | null; nombre: string }

export type CiudadHogar = { zona: ZonaHogar; foto: string | null }

export const MAX_BARRIOS_CERRADOS = 12

/** Aéreas de la ciudad (fotos del blog). Rosario no tiene: va sin foto. */
const FOTO_CIUDAD: Record<string, string> = {
  funes: '/blog/images/funes-zona-residencial-arboles-aereo.webp',
  roldan: '/blog/images/roldan-vista-aerea-panoramica.webp',
}

/** En el orden de lo que más se consulta. */
const CIUDADES = ['Funes', 'Roldán', 'Rosario']

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

export function ciudadesHogar(catalogo: ZonaHogar[]): CiudadHogar[] {
  return CIUDADES.flatMap((nombre) => {
    const zona = catalogo.find((z) => z.esCiudad && llano(z.nombre) === llano(nombre))
    return zona ? [{ zona, foto: FOTO_CIUDAD[llano(nombre)] ?? null }] : []
  })
}

/**
 * Los barrios cerrados con más del tipo elegido, con su foto si la hay.
 * Cerrado = lo marca Hilo, o es uno de los curados de /barrios-privados (La
 * Finca no está marcada en la base). Dos nombres del mismo barrio ("Cadaques"
 * y "Funes Hills Cadaqués") van una sola vez: el que tiene más.
 */
export function barriosCerradosHogar(catalogo: ZonaHogar[], fotos: FotoBarrio[], tipo: TipoHogar, max = MAX_BARRIOS_CERRADOS): BarrioCerrado[] {
  const usadas = new Set<string>()
  const out: BarrioCerrado[] = []
  const candidatos = catalogo
    .filter((z) => !z.esCiudad && cantidadZona(z, tipo) > 0)
    .sort((a, b) => cantidadZona(b, tipo) - cantidadZona(a, tipo))
  for (const zona of candidatos) {
    if (out.length >= max) break
    const f = fotoDelBarrio(fotos, zona.nombre)
    if (zona.cerrado !== true && !f) continue
    if (f && usadas.has(f.foto)) continue
    if (f) usadas.add(f.foto)
    out.push({ zona, foto: f?.foto ?? null, nombre: f ? nombreVisible(f.nombre, zona.nombre) : zona.nombre })
  }
  return out
}
