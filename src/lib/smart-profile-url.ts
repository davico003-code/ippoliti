// El perfil del asistente de búsqueda viaja en la URL.
//
// Que viva en el querystring y no en memoria tiene tres consecuencias buenas:
// la búsqueda se puede compartir por WhatsApp tal cual, el botón "atrás" del
// navegador funciona, y recargar la página no borra lo que la persona cargó.
//
// Este módulo es la única traducción entre la URL y el perfil, para que
// PropiedadesView no se llene de parseo.

import {
  DEFAULT_SMART_PROFILE,
  type SmartLifestyleNeed,
  type SmartObjective,
  type SmartProfile,
  type SmartPropertyType,
} from './property-fit'

const OBJETIVOS = new Set<SmartObjective>(['vivir', 'invertir', 'oportunidad'])
const TIPOS = new Set<SmartPropertyType>(['todos', 'casa', 'departamento', 'terreno'])
const NECESIDADES = new Set<SmartLifestyleNeed>(['cochera', 'seguridad'])
const ZONAS = new Set(['funes', 'roldan', 'rosario'])

/** Parámetro que marca que el asistente está en uso. */
export const PARAM_ACTIVO = 'asistente'

function entero(raw: string | null): number | null {
  if (!raw) return null
  const n = Number(raw.replace(/\D/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function lista(raw: string | null): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function leerPerfilDeUrl(params: URLSearchParams): SmartProfile {
  const objetivo = params.get('objetivo') as SmartObjective | null
  const tipo = params.get('tipo_ideal') as SmartPropertyType | null
  return {
    operation: params.get('op') === 'alquiler' ? 'alquiler' : 'venta',
    objective: objetivo && OBJETIVOS.has(objetivo) ? objetivo : DEFAULT_SMART_PROFILE.objective,
    locations: lista(params.get('zonas')).filter((z): z is SmartProfile['locations'][number] =>
      ZONAS.has(z),
    ),
    propertyType: tipo && TIPOS.has(tipo) ? tipo : DEFAULT_SMART_PROFILE.propertyType,
    bedroomsMin: entero(params.get('dorm_min')),
    budgetMax: entero(params.get('presupuesto')),
    surfaceMin: entero(params.get('m2_min')),
    // Por defecto flexible: si con el tope que puso no junta opciones, el
    // asistente lo estira y lo avisa en pantalla, en vez de decir "no hay nada".
    flexible: params.get('flexible') !== 'no',
    needs: lista(params.get('necesidades')).filter((n): n is SmartLifestyleNeed =>
      NECESIDADES.has(n as SmartLifestyleNeed),
    ),
  }
}

/** true si la persona realmente usó el asistente (y no es una visita normal). */
export function asistenteActivo(params: URLSearchParams): boolean {
  return params.get(PARAM_ACTIVO) === '1'
}

/**
 * Devuelve el querystring con el perfil aplicado, conservando los parámetros
 * que no son del asistente (la operación, el orden, etc.).
 */
export function escribirPerfilEnUrl(
  params: URLSearchParams,
  perfil: SmartProfile,
): URLSearchParams {
  const out = new URLSearchParams(params)
  out.set(PARAM_ACTIVO, '1')
  out.set('objetivo', perfil.objective)
  out.set('tipo_ideal', perfil.propertyType)
  out.set('op', perfil.operation)
  const set = (clave: string, valor: string | number | null) => {
    if (valor == null || valor === '') out.delete(clave)
    else out.set(clave, String(valor))
  }
  set('zonas', perfil.locations.join(',') || null)
  set('dorm_min', perfil.bedroomsMin)
  set('presupuesto', perfil.budgetMax)
  set('m2_min', perfil.surfaceMin)
  set('necesidades', perfil.needs.join(',') || null)
  if (perfil.flexible) out.delete('flexible')
  else out.set('flexible', 'no')
  return out
}

/** Saca del querystring todo lo que puso el asistente. */
export function limpiarPerfilDeUrl(params: URLSearchParams): URLSearchParams {
  const out = new URLSearchParams(params)
  for (const clave of [
    PARAM_ACTIVO,
    'objetivo',
    'tipo_ideal',
    'zonas',
    'dorm_min',
    'presupuesto',
    'm2_min',
    'necesidades',
    'flexible',
  ]) {
    out.delete(clave)
  }
  return out
}
