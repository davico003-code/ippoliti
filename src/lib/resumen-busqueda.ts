// Una búsqueda del listado dicha en una frase (25-oct-2026).
//
// "Casas en venta en Funes · 3 dormitorios · hasta USD 250.000". La usan el
// título de /propiedades (lo que WhatsApp muestra al pegar el link de una
// búsqueda: antes decía siempre "Propiedades en venta y alquiler", aunque el
// link fuera de casas en Funes) y el botón "Compartir" del listado, así la
// vista previa y el texto compartido dicen lo mismo.
//
// Solo arma texto con los filtros de la URL: no consulta propiedades ni cuenta
// totales. Módulo puro: lo importan la página (server) y PropiedadesView.

import { ZONAS } from '@/lib/zonas'

export interface BusquedaListado {
  /** 'venta' | 'alquiler' | 'temporario' */
  operacion?: string | null
  /** value de TYPE_FILTER_GROUPS ('casa', 'departamento'…) */
  tipo?: string | null
  /** 'mono' | '1' | '2' | '3' | '4+' */
  dormitorios?: string | null
  /** 'funes' | 'roldan' | 'rosario' */
  ubicacion?: string | null
  precioMin?: string | null
  precioMax?: string | null
  moneda?: string | null
  /** Lo que se escribió en el buscador. */
  q?: string | null
}

const TIPO_PLURAL: Record<string, string> = {
  terreno: 'Terrenos',
  departamento: 'Departamentos',
  casa: 'Casas',
  'casa-quinta': 'Casas quinta',
  oficina: 'Oficinas',
  local: 'Locales comerciales',
  campo: 'Campos',
  cochera: 'Cocheras',
  galpon: 'Galpones',
  ph: 'PH',
  deposito: 'Depósitos',
}

const OPERACION: Record<string, string> = {
  venta: 'en venta',
  alquiler: 'en alquiler',
  temporario: 'en alquiler temporario',
}

const CIUDAD: Record<string, string> = { funes: 'Funes', roldan: 'Roldán', rosario: 'Rosario' }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/** Si lo escrito es una ciudad o un barrio conocido, su nombre bien escrito ("funes" → "Funes"). */
function lugarEscrito(q: string): string | null {
  const n = norm(q)
  if (!n) return null
  if (CIUDAD[n]) return CIUDAD[n]
  const z = ZONAS.find(z => norm(z.nombre) === n || (z.aliases ?? []).some(a => norm(a) === n))
  return z ? z.nombre : null
}

const miles = (s: string) => {
  const d = s.replace(/\D/g, '')
  return d ? new Intl.NumberFormat('es-AR').format(parseInt(d, 10)) : ''
}

/** La frase de la búsqueda, o null si no hay ningún filtro reconocible. */
export function resumenBusqueda(b: BusquedaListado): string | null {
  const mono = b.dormitorios === 'mono'
  const tipo = b.tipo ? TIPO_PLURAL[b.tipo] ?? null : null
  const operacion = b.operacion ? OPERACION[b.operacion] ?? null : null
  const q = (b.q ?? '').trim()
  const lugarQ = q ? lugarEscrito(q) : null
  const lugar = (b.ubicacion ? CIUDAD[b.ubicacion] : null) ?? lugarQ

  let frase = tipo ?? (mono ? 'Monoambientes' : 'Propiedades')
  if (operacion) frase += ` ${operacion}`
  if (lugar) frase += ` en ${lugar}`
  const partes = [frase]

  if (mono && tipo) partes.push('monoambiente')
  else if (b.dormitorios && !mono) {
    partes.push(
      b.dormitorios === '4+' ? '4 dormitorios o más'
        : b.dormitorios === '1' ? '1 dormitorio'
        : /^\d$/.test(b.dormitorios) ? `${b.dormitorios} dormitorios` : '',
    )
  }

  const min = miles(b.precioMin ?? '')
  const max = miles(b.precioMax ?? '')
  const moneda = (b.moneda ?? '').toUpperCase() === 'ARS' ? '$' : 'USD'
  if (min && max) partes.push(`entre ${moneda} ${min} y ${max}`)
  else if (max) partes.push(`hasta ${moneda} ${max}`)
  else if (min) partes.push(`desde ${moneda} ${min}`)

  // Texto libre que no es un lugar ("con pileta"): va entre comillas, corto.
  if (q && !lugarQ) partes.push(`«${q.length > 40 ? `${q.slice(0, 39)}…` : q}»`)

  const limpias = partes.filter(Boolean)
  const algoReconocido = !!(tipo || mono || operacion || lugar) || limpias.length > 1
  return algoReconocido ? limpias.join(' · ') : null
}

/** Lee la búsqueda de la query, con los alias viejos que todavía circulan (op, type, location, search). */
export function busquedaDesdeParams(get: (k: string) => string | null | undefined): BusquedaListado {
  const uno = (...ks: string[]) => {
    for (const k of ks) {
      const v = get(k)
      if (v) return v
    }
    return null
  }
  return {
    operacion: uno('operacion', 'op', 'operation')?.toLowerCase() ?? null,
    tipo: uno('tipo', 'type'),
    dormitorios: uno('dormitorios'),
    ubicacion: uno('ubicacion', 'location')?.toLowerCase() ?? null,
    precioMin: uno('precio_min'),
    precioMax: uno('precio_max'),
    moneda: uno('moneda'),
    q: uno('q', 'search'),
  }
}
