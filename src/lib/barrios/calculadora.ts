import { BARRIOS, type Barrio } from '@/lib/barrios'

export type Presupuesto = 'menos-80k' | '80-150k' | '150-300k' | 'mas-300k'

export type Prioridad =
  | 'tranquilidad'
  | 'lifestyle'
  | 'inversion'
  | 'deportes'
  | 'cerca-rosario'
  | 'lotes-grandes'
  | 'agua'
  | 'servicios-cerca'

export type Composicion =
  | 'soltero'
  | 'pareja'
  | 'familia-hijos'
  | 'familia-hijos-12'
  | 'jubilado-activo'

export interface CalculadoraInput {
  presupuesto: Presupuesto
  prioridades: Prioridad[]
  composicion: Composicion
}

export interface BarrioMatch {
  barrio: Barrio
  score: number
  razones: string[]
}

const TAGS_AGUA = new Set(['laguna', 'playa', 'nautico', 'kayak', 'paddle-surf'])
const TAGS_DEPORTES = new Set(['tenis', 'paddle', 'futbol', 'golf', 'tenis-polvo-ladrillo', 'deportes'])
const TAGS_LIFESTYLE = new Set(['premium', 'playa', 'nautico', 'lifestyle', 'diseño-estudio-bo'])
const TAGS_SERVICIOS = new Set(['comercial', 'servicios-ingreso', 'delivery-interno'])
const TAGS_TRANQUILIDAD = new Set(['comunidad-chica', 'consolidado', 'forestacion-madura', 'arboleda-madura'])

const TIER_PRESUPUESTO_DEFAULT: Record<Barrio['tier'], Presupuesto[]> = {
  premium: ['150-300k', 'mas-300k'],
  consolidado: ['80-150k', '150-300k'],
  'en-desarrollo': ['menos-80k', '80-150k'],
}

function matchPresupuesto(barrio: Barrio, presupuesto: Presupuesto): { ok: boolean; razon?: string } {
  // Sin precios hardcodeados en la data: scoring por tier del barrio
  if (TIER_PRESUPUESTO_DEFAULT[barrio.tier].includes(presupuesto)) {
    return { ok: true, razon: 'Ticket compatible con tu presupuesto (estimado por tier del barrio)' }
  }
  return { ok: false }
}

function hasAnyTag(barrio: Barrio, tags: Set<string>): boolean {
  return barrio.tags.some((t) => tags.has(t))
}

function matchAgua(b: Barrio): string | null {
  if (hasAnyTag(b, TAGS_AGUA)) {
    if (b.tags.includes('nautico')) return 'Único producto del corredor con salida privada al agua'
    if (b.tags.includes('playa')) return 'Tiene playa privada dentro del barrio'
    if (b.tags.includes('laguna')) return 'Tiene laguna interna'
  }
  return null
}

function matchDeportes(b: Barrio): string | null {
  if (!hasAnyTag(b, TAGS_DEPORTES)) return null
  const tags: string[] = []
  if (b.tags.includes('golf')) tags.push('golf')
  if (b.tags.includes('tenis') || b.tags.includes('tenis-polvo-ladrillo')) tags.push('tenis')
  if (b.tags.includes('paddle')) tags.push('pádel')
  if (b.tags.includes('futbol')) tags.push('fútbol')
  if (!tags.length) return null
  return `Tiene ${tags.join(' + ')} adentro del barrio`
}

function matchLifestyle(b: Barrio): string | null {
  if (b.tier === 'premium') return 'Producto premium con foco en lifestyle'
  if (hasAnyTag(b, TAGS_LIFESTYLE)) return 'Diseño con foco en lifestyle, no solo en lote'
  return null
}

function matchInversion(b: Barrio): string | null {
  if (b.tier === 'premium' && b.estado !== 'consolidado') {
    return 'Premium en desarrollo — mayor upside de revalorización'
  }
  if (b.tier === 'consolidado' || b.estado === 'consolidado') {
    return 'Reventa demostrada, valor consolidado'
  }
  return null
}

function matchCercaRosario(b: Barrio): string | null {
  const min = b.ubicacion.distanciaCentroRosarioMin
  if (min && min <= 17) return `A ${min} min del centro de Rosario`
  if (b.ubicacion.accesos.some((a) => a.toLowerCase().includes('autopista'))) {
    return 'Acceso directo a la autopista Rosario–Córdoba'
  }
  return null
}

function matchLotesGrandes(b: Barrio): string | null {
  const desde = b.datosDuros.medidaLoteDesde
  if (b.tags.includes('lotes-grandes') || (desde && desde >= 1000)) {
    return `Lotes desde ${desde ?? 1000} m²`
  }
  return null
}

function matchServicios(b: Barrio): string | null {
  if (hasAnyTag(b, TAGS_SERVICIOS)) {
    if (b.tags.includes('comercial')) return 'Centro comercial propio en el ingreso'
    if (b.tags.includes('servicios-ingreso')) return 'Servicios (gimnasio, comercios, salud) a la salida del barrio'
    if (b.tags.includes('delivery-interno')) return 'Delivery interno desde el Club House'
  }
  return null
}

function matchTranquilidad(b: Barrio): string | null {
  if (hasAnyTag(b, TAGS_TRANQUILIDAD)) {
    if (b.tags.includes('comunidad-chica')) return 'Comunidad chica, todos se conocen'
    if (b.tags.includes('arboleda-madura') || b.tags.includes('forestacion-madura')) {
      return 'Arboleda madura, no es un loteo pelado'
    }
    return 'Barrio consolidado, ritmo tranquilo'
  }
  return null
}

const PRIORIDAD_MATCHERS: Record<Prioridad, (b: Barrio) => string | null> = {
  agua: matchAgua,
  deportes: matchDeportes,
  lifestyle: matchLifestyle,
  inversion: matchInversion,
  'cerca-rosario': matchCercaRosario,
  'lotes-grandes': matchLotesGrandes,
  'servicios-cerca': matchServicios,
  tranquilidad: matchTranquilidad,
}

function matchComposicion(b: Barrio, c: Composicion): string | null {
  const tieneJuegos = b.amenities.some((a) => a.id.startsWith('juegos'))
  const tieneDeportes = hasAnyTag(b, TAGS_DEPORTES)
  switch (c) {
    case 'familia-hijos':
      if (tieneJuegos) return 'Ideal para familia con hijos chicos (juegos infantiles)'
      return null
    case 'familia-hijos-12':
      if (tieneDeportes) return 'Ideal para hijos en edad deportiva'
      return null
    case 'jubilado-activo':
      if (b.tags.includes('consolidado') || b.tier === 'consolidado') {
        return 'Comunidad consolidada y ritmo amable'
      }
      return null
    case 'pareja':
    case 'soltero':
      if (b.tags.includes('coworking') || b.amenities.some((a) => a.id.includes('coworking'))) {
        return 'Tiene coworking integrado, ideal si trabajás desde casa'
      }
      if (b.tier === 'premium') return 'Producto premium pensado para vida social activa'
      return null
  }
}

export function scoreBarrios(input: CalculadoraInput): BarrioMatch[] {
  const results: BarrioMatch[] = []

  for (const barrio of BARRIOS) {
    let score = 0
    const razones: string[] = []

    const pres = matchPresupuesto(barrio, input.presupuesto)
    if (pres.ok) {
      score += 40
      if (pres.razon) razones.push(pres.razon)
    }

    for (const p of input.prioridades.slice(0, 2)) {
      const matcher = PRIORIDAD_MATCHERS[p]
      const razon = matcher(barrio)
      if (razon) {
        score += 25
        razones.push(razon)
      }
    }

    const compRazon = matchComposicion(barrio, input.composicion)
    if (compRazon) {
      score += 15
      razones.push(compRazon)
    }

    // Pequeño boost por tier premium y consolidado (reduce ties)
    if (barrio.tier === 'premium') score += 4
    if (barrio.estado === 'consolidado') score += 3

    results.push({ barrio, score, razones })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .filter((r) => r.score > 0)
    .slice(0, 3)
}

export const PRESUPUESTO_OPTIONS: { value: Presupuesto; label: string }[] = [
  { value: 'menos-80k', label: 'Menos de USD 80.000' },
  { value: '80-150k', label: 'USD 80.000 – 150.000' },
  { value: '150-300k', label: 'USD 150.000 – 300.000' },
  { value: 'mas-300k', label: 'Más de USD 300.000' },
]

export const PRIORIDAD_OPTIONS: { value: Prioridad; label: string; emoji: string }[] = [
  { value: 'tranquilidad', label: 'Tranquilidad', emoji: '🌿' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🥂' },
  { value: 'inversion', label: 'Inversión', emoji: '📈' },
  { value: 'deportes', label: 'Deportes', emoji: '🎾' },
  { value: 'cerca-rosario', label: 'Cerca de Rosario', emoji: '🚗' },
  { value: 'lotes-grandes', label: 'Lotes grandes', emoji: '📐' },
  { value: 'agua', label: 'Acceso al agua', emoji: '💧' },
  { value: 'servicios-cerca', label: 'Servicios cerca', emoji: '🛒' },
]

export const COMPOSICION_OPTIONS: { value: Composicion; label: string }[] = [
  { value: 'soltero', label: 'Soltero / soltera' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'familia-hijos', label: 'Familia con hijos chicos' },
  { value: 'familia-hijos-12', label: 'Familia con hijos +12' },
  { value: 'jubilado-activo', label: 'Jubilado activo' },
]
