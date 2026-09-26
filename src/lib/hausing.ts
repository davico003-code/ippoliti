// Landing /hausing — "Colección Hausing".
//
// HILO no marca qué propiedades construyó Hausing, así que la colección sigue
// siendo una lista de IDs. Si una se vende/despublica, getPropertyById falla y
// la página la saca sola (los números del hero se recalculan con lo que queda).
//
// Todo lo que la landing muestra de cada casa (lote, orientación, pileta,
// estado de obra) se lee de la ficha publicada — nada de números a mano.

import type { TokkoProperty } from './tokko'
import { getAllPhotos, getLotSurface, getRoofedArea, getTotalSurface } from './tokko'

export const HAUSING_PROPERTY_IDS = [7872050, 7875941, 7868679, 7865564, 7867761, 7879685]

export type HausingBarrioKey = 'kentucky' | 'cadaques' | 'vida' | 'don-mateo'

export interface HausingBarrio {
  key: HausingBarrioKey
  nombre: string
  href: string
  foto: string | null
  credenciales: string[]
  frase: string
}

// Orden = jerarquía con la que se presentan (y se numeran) las residencias.
// Datos duros tomados de lib/barrios.ts y de las fichas de cada casa.
export const HAUSING_BARRIOS: HausingBarrio[] = [
  {
    key: 'kentucky',
    nombre: 'Kentucky Club de Campo',
    href: '/barrios-privados/kentucky',
    foto: '/barrios/kentucky/05.webp',
    credenciales: ['Golf de 18 hoyos', '242 hectáreas', 'Lago de 7 ha'],
    frase: 'El único del corredor con golf de 18 hoyos dentro del perímetro, entre arboledas de medio siglo.',
  },
  {
    key: 'cadaques',
    nombre: 'Funes Hills Cadaqués',
    href: '/barrios-privados/funes-hills-cadaques',
    foto: '/barrios/funes-hills-cadaques/01.webp',
    credenciales: ['Tierras altas', 'Boulevard forestado', 'Club House'],
    frase: 'Tierras altas y un boulevard central forestado: un barrio maduro, con los árboles ya crecidos.',
  },
  {
    key: 'vida',
    nombre: 'Vida Barrio Cerrado',
    href: '/barrios-privados/vida-barrio-cerrado',
    foto: '/barrios/vida-barrio-cerrado/01.webp',
    credenciales: ['35 hectáreas', 'Laguna', 'Centro comercial propio'],
    frase: 'Club House, laguna y un centro comercial propio en el ingreso. Todo a mano, sin salir del barrio.',
  },
  {
    key: 'don-mateo',
    nombre: 'Don Mateo',
    href: '/barrio-don-mateo-funes',
    foto: null,
    credenciales: ['Calles de 20 m', 'Espacios verdes forestados', 'Av. Fuerza Aérea'],
    frase: 'Calles anchas, verde forestado y salida directa a Rosario por Av. Fuerza Aérea.',
  },
]

// Lo que tienen TODAS las casas de la colección (verificado en las 6 fichas).
export const ESTANDAR_HAUSING: { titulo: string; detalle: string }[] = [
  { titulo: 'Aberturas de aluminio con DVH', detalle: 'Doble vidrio hermético: silencio, aislación térmica y menos consumo.' },
  { titulo: 'Calefacción por losa radiante', detalle: 'Calor parejo en toda la casa, sin radiadores ni equipos a la vista.' },
  { titulo: 'Porcelanato', detalle: 'Pisos de primera en las áreas sociales, pensados para durar.' },
  { titulo: 'Pileta propia', detalle: 'Integrada al jardín y a la galería, en cada una de las casas.' },
  { titulo: 'Galería con parrillero', detalle: 'La vida afuera, semicubierta y equipada para recibir.' },
  { titulo: 'Suite principal con vestidor', detalle: 'Dormitorio principal con baño propio y vestidor.' },
]

function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function textoPlano(p: TokkoProperty): string {
  return (p.description || p.description_only || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function barrioDe(p: TokkoProperty): HausingBarrio | null {
  const t = norm(`${p.publication_title || ''} ${p.fake_address || ''} ${p.address || ''}`)
  if (t.includes('kentucky')) return HAUSING_BARRIOS[0]
  if (t.includes('cadaques')) return HAUSING_BARRIOS[1]
  if (/\bvida\b/.test(t)) return HAUSING_BARRIOS[2]
  if (t.includes('don mateo')) return HAUSING_BARRIOS[3]
  return null
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export interface EstadoObra {
  tipo: 'inmediata' | 'obra' | 'estrenar'
  label: string
}

// "Etapa del inmueble: Terminada – Entrega inmediata" / "En construcción – Entrega 2026" /
// "Fecha estimada de entrega julio 2026". Una fecha de entrega ya pasada no se
// muestra (quedaría vieja en la landing): se dice solo "En obra".
export function estadoDe(p: TokkoProperty, hoy = new Date()): EstadoObra | null {
  const d = textoPlano(p)
  const etapa = d.match(/Etapa del inmueble:\s*(.{0,90}?)(?=\s*(?:Precio:|Nota:|$))/i)?.[1] ?? ''
  const e = norm(etapa)
  if (/entrega inmediata|terminada/.test(e)) return { tipo: 'inmediata', label: 'Entrega inmediata' }
  if (/construccion|entrega/.test(e)) {
    const m = e.match(/entrega\s+(?:(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+)?(20\d\d)/)
    if (m) {
      const anio = parseInt(m[2], 10)
      const mes = m[1] ? MESES.indexOf(m[1]) : 11
      const vigente = anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth())
      if (vigente) return { tipo: 'obra', label: `En obra · Entrega ${m[1] ? `${m[1]} ` : ''}${anio}` }
    }
    return { tipo: 'obra', label: 'En obra' }
  }
  if (/a estrenar/i.test(d)) return { tipo: 'estrenar', label: 'A estrenar' }
  return null
}

export interface FichaHausing {
  id: number
  barrio: HausingBarrio | null
  // "Lote 058" o la calle ("Los Mistoles 3200") cuando no hay número de lote
  identificador: string
  estado: EstadoObra | null
  fotos: string[]
  dormitorios: number | null
  banos: number | null
  plantas: number | null
  lote: number | null
  loteMedidas: string | null
  orientacion: string | null
  cubierta: number | null
  construida: number | null
  piscina: string | null
}

const NUM_PALABRA: Record<string, number> = { una: 1, dos: 2, tres: 3 }

export function fichaDe(p: TokkoProperty): FichaHausing {
  const d = textoPlano(p)
  const titulo = p.publication_title || ''

  const lote = p.fake_address?.match(/Lote\s*(\d+)/i)?.[1]
  const calle = (p.fake_address || p.address || '').split(' - ')[0].trim()

  const dorm = titulo.match(/(\d+)\s*dormitorios?/i)?.[1] ?? d.match(/(\d+)\s*dormitorios?/i)?.[1]

  const medidas =
    d.match(/Frente:\s*(\d+)\s*m?\s*\/\s*Fondo:\s*(\d+)/i) ?? d.match(/Lote\s*(\d+)\s*m?\s*x\s*(\d+)\s*m/i)

  const orient = d.match(/orientaci[oó]n:?\s*(noreste|noroeste|sureste|suroeste|norte|sur|este|oeste)/i)?.[1]

  const pis = d.match(/Piscina:\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*m?(\s*con hidromasaje)?/i)

  const plantasTxt = d.match(/\b(una|dos|tres)\s+plantas?\b/i)?.[1]?.toLowerCase()

  return {
    id: p.id,
    barrio: barrioDe(p),
    identificador: lote ? `Lote ${lote}` : calle,
    estado: estadoDe(p),
    fotos: getAllPhotos(p),
    dormitorios: dorm ? parseInt(dorm, 10) : null,
    banos: p.bathroom_amount > 0 ? p.bathroom_amount : null,
    plantas: plantasTxt ? NUM_PALABRA[plantasTxt] : null,
    lote: getLotSurface(p),
    loteMedidas: medidas ? `${medidas[1]} × ${medidas[2]} m` : null,
    orientacion: orient ? orient[0].toUpperCase() + orient.slice(1).toLowerCase() : null,
    cubierta: getRoofedArea(p),
    construida: getTotalSurface(p),
    piscina: pis ? `${pis[1]} × ${pis[2]} m${pis[3] ? ' con hidromasaje' : ''}` : null,
  }
}

// Precio de venta más bajo en USD (para el "desde" del hero).
export function precioVentaUsd(p: TokkoProperty): number | null {
  if (p.web_price === false) return null
  const op = (p.operations || []).find(o => o.operation_type === 'Sale')
  const pr = op?.prices?.find(x => x.currency === 'USD' && x.price > 0)
  return pr ? pr.price : null
}

export function ordenBarrio(b: HausingBarrio | null): number {
  const i = b ? HAUSING_BARRIOS.findIndex(x => x.key === b.key) : -1
  return i === -1 ? HAUSING_BARRIOS.length : i
}
