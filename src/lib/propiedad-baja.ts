// A dónde mandar la URL de una propiedad que ya no está publicada: al listado
// más parecido (misma operación + tipo + localidad). Lo que se sabe sale de
// Hilo (la propiedad sigue en la base: vendida, alquilada, suspendida…) y, para
// lo que Hilo no conoce, de las palabras del slug ("7990850-casa-en-roldan").
// Sin datos para armar el destino → null (el middleware responde 410).
// Puro y sin imports: corre en el middleware (edge).

/** Lo que manda Hilo en el 404 del detalle cuando la propiedad existió (campo `baja`). */
export type DatosBaja = {
  operation_type?: string | null
  property_type?: string | null
  city?: string | null
}

export type DestinoBaja = { operacion: string | null; tipo: string | null; ubicacion: string | null }

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Valores de Hilo → los del listado (/propiedades?operacion=&tipo=&ubicacion=;
// los mismos `value` de TYPE_FILTER_GROUPS en lib/tokko).
const OPERACION_HILO: Record<string, string> = { sale: 'venta', rent: 'alquiler', temporary_rent: 'temporario' }
const TIPO_HILO: Record<string, string> = {
  house: 'casa',
  apartment: 'departamento',
  lot: 'terreno',
  warehouse: 'galpon',
  commercial: 'local',
  office: 'oficina',
  garage: 'cochera',
  ph: 'ph',
  country_house: 'casa-quinta',
  field: 'campo',
  deposit: 'deposito',
}

// Palabras del slug → tipo. Gana la que aparece primero (los títulos arrancan por el tipo).
const TIPO_SLUG: Record<string, string> = {
  casa: 'casa', casas: 'casa', chalet: 'casa', casona: 'casa',
  departamento: 'departamento', departamentos: 'departamento', depto: 'departamento', deptos: 'departamento', dpto: 'departamento',
  monoambiente: 'departamento', monoambientes: 'departamento', semipiso: 'departamento',
  terreno: 'terreno', terrenos: 'terreno', lote: 'terreno', lotes: 'terreno',
  oficina: 'oficina', oficinas: 'oficina',
  local: 'local', locales: 'local',
  galpon: 'galpon', galpones: 'galpon',
  cochera: 'cochera', cocheras: 'cochera',
  ph: 'ph',
  quinta: 'casa-quinta',
  deposito: 'deposito',
}
const OPERACION_SLUG: Record<string, string> = {
  temporario: 'temporario', temporarios: 'temporario', temporal: 'temporario',
  alquiler: 'alquiler', alquilo: 'alquiler', alquila: 'alquiler',
  venta: 'venta', vendo: 'venta', vende: 'venta',
}
// El listado filtra por estas tres; los barrios de Rosario que aparecen en los títulos cuentan como Rosario.
const UBICACION_SLUG: Record<string, string> = {
  funes: 'funes',
  roldan: 'roldan',
  rosario: 'rosario', fisherton: 'rosario', pichincha: 'rosario', echesortu: 'rosario', abasto: 'rosario',
}

function ubicacionDe(ciudad: string | null | undefined): string | null {
  const c = sinAcentos(ciudad ?? '')
  return c.includes('roldan') ? 'roldan' : c.includes('funes') ? 'funes' : c.includes('rosario') ? 'rosario' : null
}

/** Lo que dicen las palabras del slug (sin el número del principio). */
export function leerSlug(slug: string): DestinoBaja {
  const palabras = sinAcentos(slug).split(/[^a-z0-9]+/).filter(Boolean)
  const primera = (mapa: Record<string, string>) => {
    const p = palabras.find((w) => mapa[w])
    return p ? mapa[p] : null
  }
  // "alquiler temporario": si están las dos, es temporario.
  const operacion = palabras.some((w) => OPERACION_SLUG[w] === 'temporario') ? 'temporario' : primera(OPERACION_SLUG)
  return { operacion, tipo: primera(TIPO_SLUG), ubicacion: primera(UBICACION_SLUG) }
}

/**
 * El listado más parecido a una propiedad dada de baja, o null si no hay con
 * qué armarlo (ni tipo ni localidad: la operación sola es todo el listado).
 */
export function destinoDeBaja(baja: DatosBaja | null | undefined, slug: string): string | null {
  const s = leerSlug(slug)
  const d: DestinoBaja = {
    operacion: OPERACION_HILO[baja?.operation_type ?? ''] ?? s.operacion,
    tipo: TIPO_HILO[baja?.property_type ?? ''] ?? s.tipo,
    // Si Hilo tiene la propiedad, su ciudad manda aunque no sea de las tres (Casilda no es "roldan" porque el título lo nombre).
    ubicacion: baja?.city ? ubicacionDe(baja.city) : s.ubicacion,
  }
  if (!d.tipo && !d.ubicacion) return null
  const q = new URLSearchParams()
  if (d.operacion) q.set('operacion', d.operacion)
  if (d.tipo) q.set('tipo', d.tipo)
  if (d.ubicacion) q.set('ubicacion', d.ubicacion)
  return `/propiedades?${q.toString()}`
}
