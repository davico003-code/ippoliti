// LO QUE EL TASADOR NECESITA EN EL NAVEGADOR: las zonas medidas por Hilo, cada
// una con sus números por tipo y la dirección de su landing (/tasar/… y
// /vender/… usan el mismo slug). Lo arma el servidor (opcionesTasar en
// lib/seo/tasar.ts) y viaja como prop. Liviano a propósito: nada de la lista
// vieja de barrios (BARRIOS_TASADOR pesa 4.700 líneas) ni de servidor.

import type { ParamsTasador, TipoHiloTasador } from './tipos'

export type TipoTasar = 'casa' | 'lote' | 'departamento'
export const TIPOS_TASAR: TipoTasar[] = ['casa', 'lote', 'departamento']
export const HILO_DE: Record<TipoTasar, TipoHiloTasador> = { casa: 'casa', lote: 'lote', departamento: 'depto' }
/** El tipo que entiende el pedido de tasación (/api/tasacion/solicitud y /tasaciones?tipo=). */
export const TIPO_PEDIDO: Record<TipoTasar, 'casa' | 'lote' | 'depto'> = { casa: 'casa', lote: 'lote', departamento: 'depto' }

export const TEXTO_TIPO: Record<TipoTasar, { singular: string; plural: string; corto: string; tu: string; una: string; publicadas: string }> = {
  casa: { singular: 'casa', plural: 'casas', corto: 'Casa', tu: 'tu casa', una: 'una casa', publicadas: 'publicadas' },
  lote: { singular: 'lote', plural: 'lotes', corto: 'Lote', tu: 'tu lote', una: 'un lote', publicadas: 'publicados' },
  departamento: { singular: 'departamento', plural: 'departamentos', corto: 'Depto', tu: 'tu departamento', una: 'un departamento', publicadas: 'publicados' },
}

export const CIUDADES_TASAR = ['Funes', 'Roldán', 'Rosario'] as const

/** Con menos avisos propios no entra en el buscador: no hay nada que decir de ese barrio. */
export const MINIMO_AVISOS = 5

/** Cómo se lee la ciudad sin barrio (Hilo la tasa con lo que no está en ningún barrio con nombre). */
export const ETIQUETA_CIUDAD: Record<string, string> = {
  Funes: 'Funes, fuera de barrios',
  Roldán: 'Roldán, fuera de barrios',
  Rosario: 'Rosario, Centro y otras zonas',
}

export type OpcionTasar = {
  /** Única: "Kentucky Club de Campo|Funes", "Funes|" (la ciudad). */
  clave: string
  nombre: string
  ciudad: string
  esCiudad: boolean
  /** Lo que se lee en el buscador. */
  etiqueta: string
  /** En casas, ¿suma la mirada terreno + construcción? (Hilo lo decide por ciudad). */
  mixto: boolean
  /** Solo los tipos con avisos suficientes; `daNumero` ya viene resuelto (Hilo + versión de la cuenta). */
  params: Partial<Record<TipoTasar, ParamsTasador>>
  /** El slug de su landing por tipo ("casa-kentucky"). */
  slugs: Partial<Record<TipoTasar, string>>
}

export const tieneDatos = (o: OpcionTasar, tipo: TipoTasar) => (o.params[tipo]?.n ?? 0) >= MINIMO_AVISOS

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const palabras = (s: string) => sinAcentos(s).split(/[^a-z0-9]+/).filter(Boolean)

/** El buscador: cada palabra escrita empieza alguna palabra del barrio o de la ciudad. Vacío = nada. */
export function filtrarOpciones(opciones: OpcionTasar[], tipo: TipoTasar, texto: string, max = 8): OpcionTasar[] {
  const q = palabras(texto)
  if (!q.length) return []
  return opciones
    .filter((o) => tieneDatos(o, tipo))
    .filter((o) => {
      const ws = palabras(`${o.etiqueta} ${o.ciudad}`)
      return q.every((p) => ws.some((w) => w.startsWith(p)))
    })
    .sort(
      (a, b) =>
        Number(palabras(b.nombre)[0]?.startsWith(q[0])) - Number(palabras(a.nombre)[0]?.startsWith(q[0])) ||
        (b.params[tipo]?.n ?? 0) - (a.params[tipo]?.n ?? 0),
    )
    .slice(0, max)
}

/** Sin texto escrito: las tres ciudades y los barrios con más avisos (que dan número). */
export function sugeridas(opciones: OpcionTasar[], tipo: TipoTasar, barrios = 6): OpcionTasar[] {
  const ciudades = opciones.filter((o) => o.esCiudad && tieneDatos(o, tipo))
  const top = opciones
    .filter((o) => !o.esCiudad && o.params[tipo]?.daNumero)
    .sort((a, b) => (b.params[tipo]?.n ?? 0) - (a.params[tipo]?.n ?? 0))
    .slice(0, barrios)
  return [...top, ...ciudades]
}

/** ?barrio= de un link (slug de landing sin el tipo, "kentucky", o el nombre): la opción. */
export function opcionDeLink(opciones: OpcionTasar[], valor: string | null | undefined, tipo: TipoTasar): OpcionTasar | null {
  const v = sinAcentos(valor ?? '').trim()
  if (!v) return null
  const conDatos = opciones.filter((o) => tieneDatos(o, tipo))
  return (
    conDatos.find((o) => o.slugs[tipo] === `${tipo}-${v}`) ??
    conDatos.find((o) => palabras(o.nombre).join('-') === v.replace(/[^a-z0-9]+/g, '-')) ??
    null
  )
}
