// Capacitaciones embebibles del panel derecho de SI School.
//
// Cada entrada es una "placa" chica en la columna derecha; al tocarla se abre
// su HTML autocontenido dentro de un <iframe srcDoc> aislado (igual que las
// calculadoras de comisiones). El HTML lo provee David — pegá el documento
// completo (con su <style> y <script>) en `html`.
//
// Para agregar una capacitación: sumá un objeto a CAPACITACIONES.

export interface Capacitacion {
  id: string
  titulo: string
  /** etiqueta corta opcional (ej: "Nuevo", "Video", "5 min"). */
  etiqueta?: string
  /** HTML completo a embeber en el iframe. */
  html: string
}

export const CAPACITACIONES: Capacitacion[] = []
