// Título/rol del agente que se muestra bajo su nombre en la ficha.
// Por default "Asesor inmobiliario"; David Flores va como "Broker" (su rol real,
// pedido de David). Extensible por nombre si otros del equipo tienen otro cargo.

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// nombre normalizado → { título largo bajo el nombre, texto corto del badge }
const ROLES: Record<string, { titulo: string; badge: string }> = {
  'david flores': { titulo: 'Broker', badge: 'Broker' },
}

export function getAgenteRol(nombre: string | null | undefined): { titulo: string; badge: string } {
  return ROLES[norm(nombre || '')] ?? { titulo: 'Asesor inmobiliario', badge: 'Asesor' }
}
