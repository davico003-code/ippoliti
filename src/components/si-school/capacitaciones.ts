// Capacitaciones embebibles del panel derecho de SI School.
//
// Cada entrada es una "placa" chica en la columna derecha; al tocarla se abre
// su HTML dentro de un <iframe> aislado en un modal. Los HTML viven como
// archivos estáticos en public/si-school/capacitaciones/ (se cargan por URL,
// no se inlinean en el bundle: pueden pesar cientos de KB).
//
// Para agregar una capacitación: copiá el .html a esa carpeta y sumá un objeto
// acá con su `src`.

export interface Capacitacion {
  id: string
  titulo: string
  /** etiqueta corta opcional (ej: "Nuevo", "Video", "5 min"). */
  etiqueta?: string
  /** Miniatura para identificar la capacitación (imagen en public/). */
  imagen?: string
  /** URL del HTML a embeber (archivo en public/). */
  src: string
}

export const CAPACITACIONES: Capacitacion[] = [
  {
    id: 'ia-inmobiliarias',
    titulo: 'IA para inmobiliarias',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/ia-para-inmobiliarias.jpg',
    src: '/si-school/capacitaciones/ia-para-inmobiliarias.html',
  },
  {
    id: 'seguimiento-propiedad',
    titulo: 'El trabajo detrás de cada propiedad',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/seguimiento-trabajo-propiedad.jpg',
    src: '/si-school/capacitaciones/seguimiento-trabajo-propiedad.html',
  },
]
