// QUÉ HACEN LA X Y EL ATRÁS del Tinder (MazoCasas). Es la misma decisión para
// los dos (David 4-oct: "mi mamá corrió para el costado de la foto y cerró el
// Tinder sin que le pida los datos"): con ♥ sin mandar → "¡No pierdas tus
// elegidas!"; sin ♥ después de mirar algunas → el rescate (una vez por visita);
// si ya nos mandó la consulta, sale. Pura y con test (mazo-salida.test.mjs).
//
// Diferencias a propósito entre las dos:
// - El atrás primero saca la capa que esté arriba (instructivo, foto en grande,
//   detalles, la hoja de ★, hoja, rescate). Si arriba está la pregunta de salida (hoja
//   o rescate 'salir'), es que insiste: sale.
// - En el final, con el formulario de sus elegidas a la vista, la X sale y el
//   atrás se queda ahí.

/** Cómo está el mazo en el momento de salir. */
export type EstadoSalida = {
  /** El instructivo de la primera vez, a la vista. */
  guia: boolean
  /** La foto en grande, abierta. */
  visor: boolean
  /** "Ver detalles", abierto. */
  detalle: boolean
  /** La hoja de ★ "Quiero conocerla" (pide nombre y WhatsApp), a la vista. */
  visita: boolean
  /** "Afiná tu búsqueda" a la vista: desde el ícono ('boton') o al querer salir ('salir'). */
  afinar?: 'boton' | 'salir' | 'entrada' | null
  /** La hoja de contacto abierta y por qué (al salir o desde ♥ N). */
  hoja: 'salir' | 'boton' | null
  /** El rescate a la vista: en medio del mazo o al querer salir. */
  rescate: 'mazo' | 'salir' | null
  /** Ya nos mandó la consulta (desde el final o desde la hoja de salida). */
  enviada: boolean
  /** Ya pasó la última tarjeta. */
  terminado: boolean
  /** ♥ que todavía no tiene un asesor. */
  pendientes: number
  /** Todas sus ♥ (mandadas o no). */
  guardadas: number
  /** Ya vio el rescate en esta visita. */
  rescateVisto: boolean
  /** El final sin ♥ ya hace de rescate. */
  finEsRescate: boolean
  /** Cuántas tarjetas miró. */
  vistas: number
}

export type QueHacer =
  /** Sale del mazo. */
  | 'cerrar'
  /** Sale y limpia sus ♥ (ya las tiene un asesor). */
  | 'cerrar-limpiando'
  /** "¡No pierdas tus elegidas!" (y se queda). */
  | 'hoja'
  /** "¿Te vas sin guardar ninguna?" (y se queda). */
  | 'rescate'
  /** Nada: el formulario del final ya está a la vista. */
  | 'quedarse'
  /** Solo el atrás: saca la capa de arriba y sigue en el mazo. */
  | 'sacar-guia'
  | 'sacar-visor'
  | 'sacar-detalle'
  | 'sacar-visita'
  | 'sacar-afinar'
  | 'sacar-hoja'
  | 'sacar-rescate'

export function queHacerAlSalir(e: EstadoSalida, via: 'x' | 'atras'): QueHacer {
  if (via === 'atras') {
    if (e.guia) return 'sacar-guia'
    if (e.visor) return 'sacar-visor'
    if (e.detalle) return 'sacar-detalle'
    if (e.visita) return 'sacar-visita'
    // Atrás otra vez con la pregunta de salida a la vista: insiste, sale.
    if (e.hoja === 'salir' || e.rescate === 'salir' || e.afinar === 'salir') return 'cerrar'
    if (e.afinar) return 'sacar-afinar'
    if (e.hoja) return 'sacar-hoja'
    if (e.rescate === 'mazo') return 'sacar-rescate'
  }
  if (e.enviada) return 'cerrar'
  // El formulario del final ya está a la vista: la X no se lo repite en una
  // hoja (sale directo); el atrás se queda ahí.
  if (e.terminado && e.pendientes > 0) return via === 'x' ? 'cerrar' : 'quedarse'
  // ♥ que todavía no nos mandó.
  if (e.pendientes > 0) return 'hoja'
  // Le gustaron y ya las tiene un asesor (★ o ♥ N): se va tranquilo.
  if (e.guardadas > 0) return 'cerrar-limpiando'
  // Se va sin guardar ninguna después de mirar algunas: una pregunta rápida.
  if (!e.rescateVisto && !e.finEsRescate && e.vistas > 0) return 'rescate'
  return 'cerrar'
}

/** ¿Esta decisión saca del mazo? Si no, el atrás vuelve a poner su entrada en el historial. */
export function cierraElMazo(q: QueHacer): boolean {
  return q === 'cerrar' || q === 'cerrar-limpiando'
}
