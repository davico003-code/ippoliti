// LAS LANDINGS /tasar, una por barrio y tipo, con los barrios que Hilo tiene
// medidos (8-oct-2026, David: "cuando alguien busque tasar casa en tal barrio
// tenemos que aparecer siempre").
//
//   /tasar/casa-kentucky              (las direcciones de siempre: se conservan)
//   /tasar/casa-vida-lagoon-funes     (zonas medidas que la lista vieja no tenía)
//   /tasar/casa-funes                 (Funes fuera de los barrios con nombre)
//
// Una sola dirección por barrio y tipo. Un barrio de la lista vieja (OSM) que
// no tiene datos propios redirige (307: depende de los datos de hoy) a la
// página de su ciudad: con el número del casco sería tirar cualquier valor. A
// Google va solo lo que da número (lo decide Hilo: daNumero). Sin imports de servidor.

import { BARRIOS_TASADOR, type BarrioTasador } from '@/lib/tasador/barrios'
import { daNumero } from '@/lib/tasador/estimar'
import type { ParamsTasador, Tasador, TipoHiloTasador } from '@/lib/tasador/tipos'

export type TipoTasar = 'casa' | 'lote' | 'departamento'
export const TIPOS_TASAR: TipoTasar[] = ['casa', 'lote', 'departamento']
export const HILO_DE: Record<TipoTasar, TipoHiloTasador> = { casa: 'casa', lote: 'lote', departamento: 'depto' }
/** El tipo que entiende el formulario de vendedores (/tasaciones?tipo=). */
export const TIPO_PEDIDO: Record<TipoTasar, 'casa' | 'lote' | 'depto'> = { casa: 'casa', lote: 'lote', departamento: 'depto' }

export const TEXTO_TIPO: Record<TipoTasar, { singular: string; plural: string; corto: string; tu: string }> = {
  casa: { singular: 'casa', plural: 'casas', corto: 'Casa', tu: 'tu casa' },
  lote: { singular: 'lote', plural: 'lotes', corto: 'Lote', tu: 'tu lote' },
  departamento: { singular: 'departamento', plural: 'departamentos', corto: 'Depto', tu: 'tu departamento' },
}

export const CIUDADES_TASAR = ['Funes', 'Roldán', 'Rosario'] as const

/** Una zona de Hilo con sus números (barrio, o la ciudad fuera de barrios). */
export type ZonaTasar = {
  nombre: string
  ciudad: string
  esCiudad: boolean
  /** En casas, ¿suma la mirada terreno + construcción? (Hilo lo decide por ciudad). */
  mixto: boolean
  params: Partial<Record<TipoTasar, ParamsTasador>>
}

export type Landing = {
  /** "casa-kentucky" */
  slug: string
  tipo: TipoTasar
  zona: ZonaTasar
  /** Con lo que se lee en la página ("Kentucky Club de Campo"; la ciudad, "Funes"). */
  nombre: string
  conNumero: boolean
}

export type IndiceTasar = { landings: Map<string, Landing>; redirecciones: Map<string, string>; version: number }

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const slugTexto = (s: string) =>
  sinAcentos(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ROMANOS: Record<string, string> = { i: '1', ii: '2', iii: '3', iv: '4', v: '5' }
const RELLENO = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'club', 'campo', 'country', 'barrio', 'privado', 'cerrado'])
const palabras = (s: string) =>
  sinAcentos(s)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && ROMANOS[w] ? ROMANOS[w] : w))
    .filter((w) => !RELLENO.has(w))

const esDeLaZona = (c: string | null | undefined) => !!c && (CIUDADES_TASAR as readonly string[]).includes(c)

/** Las zonas medidas de Funes, Roldán y Rosario, con el "¿da número?" de Hilo ya aplicado (y la versión de la cuenta). */
export function zonasTasar(t: Tasador): ZonaTasar[] {
  return t.zonas
    .filter((z) => (z.esCiudad ? esDeLaZona(z.nombre) : esDeLaZona(z.ciudad)))
    .map((z) => {
      const ciudad = (z.esCiudad ? z.nombre : z.ciudad) as string
      const params: ZonaTasar['params'] = {}
      for (const tipo of TIPOS_TASAR) {
        const p = z.params[HILO_DE[tipo]]
        if (p) params[tipo] = { ...p, daNumero: daNumero(p, t.modelo) }
      }
      return { nombre: z.nombre, ciudad, esCiudad: z.esCiudad, mixto: !!t.modelo.mixto[ciudad], params }
    })
}

/**
 * La zona de Hilo de un barrio de la lista vieja: el mismo nombre ("Kentucky" =
 * "Kentucky Club de Campo"), o el que más palabras comparte sin empate ("Vida
 * Crystal Lagoon" = "Vida Lagoon", no "Vida"). null = no la tiene: la ciudad.
 */
export function zonaDeBarrio(b: BarrioTasador, tipo: TipoTasar, zonas: ZonaTasar[]): ZonaTasar | null {
  const buscado = palabras(b.nombre)
  if (!buscado.length) return null
  const deCiudad = zonas.filter((z) => !z.esCiudad && z.ciudad === b.ciudad && (z.params[tipo]?.n ?? 0) > 0)
  const igual = deCiudad.find((z) => palabras(z.nombre).join(' ') === buscado.join(' '))
  if (igual) return igual
  // Una contiene a la otra (todas las palabras de la más corta están en la larga): gana la que más comparte.
  const parecidas = deCiudad
    .map((z) => {
      const pz = palabras(z.nombre)
      const [corta, larga] = pz.length <= buscado.length ? [pz, new Set(buscado)] : [buscado, new Set(pz)]
      return { z, comparte: corta.length && corta.every((w) => larga.has(w)) && corta.some((w) => /[a-z]/.test(w)) ? corta.length : 0 }
    })
    .filter((x) => x.comparte > 0)
    .sort((a, b) => b.comparte - a.comparte)
  if (!parecidas.length) return null
  if (parecidas.length > 1 && parecidas[1].comparte === parecidas[0].comparte) return null
  return parecidas[0].z
}

/** "Vida Lagoon" (Funes) → "vida-lagoon-funes"; si el nombre ya dice la ciudad ("Funes Hills San Marino"), no se repite. */
const slugZona = (z: ZonaTasar) => {
  const n = slugTexto(z.nombre)
  const c = slugTexto(z.ciudad)
  return z.esCiudad || n.split('-').includes(c) ? n : `${n}-${c}`
}

/** Todas las landings y redirecciones, armadas una vez por pedido (puras: dependen solo de lo que manda Hilo). */
export function indiceTasar(t: Tasador): IndiceTasar {
  const zonas = zonasTasar(t)
  const landings = new Map<string, Landing>()
  const redirecciones = new Map<string, string>()
  const ciudadSlug = (c: string) => slugTexto(c)
  const osmCiudades = new Set(CIUDADES_TASAR.map(ciudadSlug))

  for (const tipo of TIPOS_TASAR) {
    const tomadas = new Set<ZonaTasar>()
    // 1. La ciudad (fuera de barrios), con su dirección de siempre: /tasar/casa-funes.
    for (const c of CIUDADES_TASAR) {
      const zona = zonas.find((z) => z.esCiudad && z.nombre === c)
      if (!zona) continue
      landings.set(`${tipo}-${ciudadSlug(c)}`, { slug: `${tipo}-${ciudadSlug(c)}`, tipo, zona, nombre: c, conNumero: !!zona.params[tipo]?.daNumero })
      tomadas.add(zona)
    }
    // 2. Los barrios de la lista vieja: los de nombre igual primero (se quedan con la dirección).
    const osm = BARRIOS_TASADOR.filter((b) => !osmCiudades.has(b.slug) && esDeLaZona(b.ciudad))
      .map((b) => ({ b, zona: zonaDeBarrio(b, tipo, zonas) }))
      .sort((x, y) => Number(!!y.zona && palabras(y.zona.nombre).join(' ') === palabras(y.b.nombre).join(' ')) - Number(!!x.zona && palabras(x.zona.nombre).join(' ') === palabras(x.b.nombre).join(' ')))
    const canonica = new Map<ZonaTasar, string>()
    for (const { b, zona } of osm) {
      const slug = `${tipo}-${b.slug}`
      const ciudad = `${tipo}-${ciudadSlug(b.ciudad)}`
      if (!zona || !zona.params[tipo]) {
        redirecciones.set(slug, ciudad)
        continue
      }
      const ya = canonica.get(zona)
      if (ya) {
        redirecciones.set(slug, ya)
        continue
      }
      canonica.set(zona, slug)
      tomadas.add(zona)
      landings.set(slug, { slug, tipo, zona, nombre: zona.nombre, conNumero: !!zona.params[tipo]?.daNumero })
    }
    // 3. Las zonas medidas que la lista vieja no tenía. Todas las que tienen avisos del tipo:
    //    las que dan número van a Google; las que hoy no, siguen vivas solo con el pedido
    //    (si mañana dejan de dar número, la dirección no desaparece).
    for (const zona of zonas) {
      if (zona.esCiudad || tomadas.has(zona) || !zona.params[tipo]) continue
      let slug = `${tipo}-${slugZona(zona)}`
      while (landings.has(slug) || redirecciones.has(slug)) slug = `${slug}-${ciudadSlug(zona.ciudad)}`
      landings.set(slug, { slug, tipo, zona, nombre: zona.nombre, conNumero: !!zona.params[tipo]?.daNumero })
    }
  }
  return { landings, redirecciones, version: t.modelo.version }
}

export type ResolucionTasar = { landing: Landing } | { redirigir: string } | null

export function resolverTasar(slug: string, indice: IndiceTasar): ResolucionTasar {
  const landing = indice.landings.get(slug)
  if (landing) return { landing }
  const destino = indice.redirecciones.get(slug)
  return destino ? { redirigir: `/tasar/${destino}` } : null
}

/** A Google: solo lo que da número. */
export const esIndexableTasar = (l: Landing) => l.conNumero

/** Las landings de una ciudad, de la que más avisos tiene a la que menos (la ciudad primero). */
export function landingsDeCiudad(indice: IndiceTasar, ciudad: string, tipo?: TipoTasar): Landing[] {
  return Array.from(indice.landings.values())
    .filter((l) => l.zona.ciudad === ciudad && (!tipo || l.tipo === tipo))
    .sort((a, b) => Number(b.zona.esCiudad) - Number(a.zona.esCiudad) || (b.zona.params[b.tipo]?.n ?? 0) - (a.zona.params[a.tipo]?.n ?? 0))
}

/** El link al formulario de vendedores, con el barrio y el tipo ya elegidos. */
export function hrefPedido(l: Pick<Landing, 'tipo' | 'zona' | 'nombre'>): string {
  const p = new URLSearchParams({ zona: l.zona.esCiudad ? l.zona.ciudad : l.nombre, ciudad: l.zona.ciudad, tipo: TIPO_PEDIDO[l.tipo] })
  return `/tasaciones?${p.toString()}`
}
