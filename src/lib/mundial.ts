// ─── Edición Mundial 2026 ─────────────────────────────────────────────────────
// Feature estacional que se prende/apaga solo por fecha. Única fuente de verdad
// del fixture y de los helpers de estado.
//
// Para QUITARLO post-Mundial: borrar este archivo + src/components/BarraMundial.tsx
// + src/components/FranjaMundial.tsx, y revertir las 2 inserciones (en
// ConditionalChrome.tsx y Navbar.tsx). Nada de lógica desparramada.

export interface PartidoMundial {
  rival: string
  kickoff: Date // fecha/hora exacta del inicio (con offset AR -03:00)
  dia: string   // etiqueta corta para UI, ej. "mar 16 jun"
  hora: string  // etiqueta corta para UI, ej. "22:00"
}

// Fixture de Argentina — Grupo J (horarios Argentina, UTC-03:00).
// Al avanzar de ronda, agregar acá los partidos de eliminación directa con la
// misma forma; el resto del sistema (barra + helpers) sigue funcionando solo.
export const FIXTURE: PartidoMundial[] = [
  { rival: 'Argelia',  kickoff: new Date('2026-06-16T22:00:00-03:00'), dia: 'mar 16 jun', hora: '22:00' },
  { rival: 'Austria',  kickoff: new Date('2026-06-22T14:00:00-03:00'), dia: 'lun 22 jun', hora: '14:00' },
  { rival: 'Jordania', kickoff: new Date('2026-06-27T23:00:00-03:00'), dia: 'sáb 27 jun', hora: '23:00' },
]

// Ventana en la que un partido se considera "en vivo" (90' + ET + descuento).
export const DURACION_PARTIDO_MIN = 150

// Fin de la edición. Mientras now < esto, el feature está activo. La final del
// Mundial 2026 fue el 19 jul y David confirmó que terminó → se cierra la edición
// (apaga franja, acento celeste y demás piezas gateadas por esEdicionMundial).
const FIN_EDICION = new Date('2026-07-19T00:00:00-03:00')

// ¿El feature Mundial está activo? (gate de ambas piezas)
export function esEdicionMundial(now: Date = new Date()): boolean {
  return now.getTime() < FIN_EDICION.getTime()
}

// Primer partido cuyo (kickoff + 150min) sigue en el futuro; null si no quedan.
export function proximoPartido(now: Date = new Date()): PartidoMundial | null {
  const t = now.getTime()
  for (const p of FIXTURE) {
    if (p.kickoff.getTime() + DURACION_PARTIDO_MIN * 60_000 > t) return p
  }
  return null
}

// ¿El partido está jugándose ahora? (entre kickoff y kickoff + 150min)
export function estaEnVivo(p: PartidoMundial, now: Date = new Date()): boolean {
  const t = now.getTime()
  return t >= p.kickoff.getTime() && t < p.kickoff.getTime() + DURACION_PARTIDO_MIN * 60_000
}

// ¿Es día de partido? (previa del mismo día calendario, o partido en vivo).
// Usado para destacar una property card solo en la jornada del partido.
export function esDiaDePartido(now: Date = new Date()): boolean {
  const p = proximoPartido(now)
  if (!p) return false
  if (estaEnVivo(p, now)) return true
  const k = p.kickoff
  return (
    k.getFullYear() === now.getFullYear() &&
    k.getMonth() === now.getMonth() &&
    k.getDate() === now.getDate()
  )
}

// Desglose de la cuenta regresiva hasta el kickoff (clamp a 0).
export function tiempoHasta(kickoff: Date, now: Date = new Date()) {
  const ms = Math.max(0, kickoff.getTime() - now.getTime())
  const totalSec = Math.floor(ms / 1000)
  return {
    d: Math.floor(totalSec / 86400),
    h: Math.floor((totalSec % 86400) / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}
