// Título/rol del agente que se muestra bajo su nombre en la ficha.
// Por default "Asesor inmobiliario"; David Flores va como "Broker" (su rol real,
// pedido de David). Extensible por nombre si otros del equipo tienen otro cargo.

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// nombre normalizado → { título largo bajo el nombre, texto corto del badge,
// matrícula si es corredor (va al lado del título) }
type Rol = { titulo: string; badge: string; matricula?: string }
const ROLES: Record<string, Rol> = {
  'david flores': { titulo: 'Broker', badge: 'Broker', matricula: '0621' },
}

export function getAgenteRol(nombre: string | null | undefined): Rol {
  return ROLES[norm(nombre || '')] ?? { titulo: 'Asesor inmobiliario', badge: 'Asesor' }
}

// Video de saludo (Seedance) por agente, en public/team/videos/. Empieza y
// termina en la foto de perfil, así el loop no salta. Agregar acá a medida que
// se generen.
const VIDEOS: Record<string, string> = {
  'david flores': '/team/videos/david-flores.mp4',
  'mauro matteucci': '/team/videos/mauro-matteucci.mp4',
  'leticia alexenicer': '/team/videos/leticia-alexenicer.mp4',
  'aldana ruiz': '/team/videos/aldana-ruiz.mp4',
  'carolina echen': '/team/videos/carolina-echen.mp4',
  'gino pecchenino': '/team/videos/gino-pecchenino.mp4',
  'maria jose espilocin': '/team/videos/maria-jose-espilocin.mp4',
  'lucia wilson': '/team/videos/lucia-wilson.mp4',
  'gisela ramallo': '/team/videos/gisela-ramallo.mp4',
  'mariana orlate': '/team/videos/mariana-orlate.mp4',
  'florencia acquarone': '/team/videos/florencia-acquarone.mp4',
}

export function getAgenteVideo(nombre: string | null | undefined): string | null {
  return VIDEOS[norm(nombre || '')] ?? null
}
