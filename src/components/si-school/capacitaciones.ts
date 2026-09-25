// Capacitaciones embebibles del panel derecho de SI School.
//
// Cada entrada es una placa numerada en la columna derecha; al tocarla se abre
// su HTML dentro de un <iframe> aislado en un modal. Los HTML viven como
// archivos estáticos en public/si-school/capacitaciones/ (se cargan por URL,
// no se inlinean en el bundle: pueden pesar cientos de KB).
//
// Para agregar una capacitación: copiá el .html a esa carpeta y sumá un objeto
// al final de la lista con su `src`. El número (01, 02…) sale del orden acá.
// Si vino en PDF: renderizá las páginas a webp en una carpeta con su id y
// armá el visor calcando instrumentos-operacion.html.

export interface Capacitacion {
  id: string
  titulo: string
  /** Una línea que dice de qué trata (se muestra bajo el título). */
  bajada?: string
  /** etiqueta corta opcional (ej: "Nuevo", "Video", "5 min"). */
  etiqueta?: string
  /** Miniatura para identificar la capacitación (imagen en public/). */
  imagen?: string
  /** URL del HTML a embeber (archivo en public/). */
  src: string
}

export const CAPACITACIONES: Capacitacion[] = [
  {
    id: 'seguimiento-clientes',
    titulo: 'Seguimiento de contactos',
    bajada: 'El ritmo, los mensajes exactos y tres casos completos',
    imagen: '/si-school/capacitaciones/img/seguimiento-clientes.jpg',
    src: '/si-school/capacitaciones/seguimiento-clientes.html',
  },
  {
    id: 'responder-consultas',
    titulo: 'Responder consultas y evitar el visto',
    bajada: 'Abrir la conversación y no perder al cliente en el chat',
    imagen: '/si-school/capacitaciones/img/responder-consultas.jpg',
    src: '/si-school/capacitaciones/responder-consultas.html',
  },
  {
    id: 'ia-inmobiliarias',
    titulo: 'IA para inmobiliarias',
    bajada: 'Cómo usamos la IA, en criollo, para vender más y mejor',
    imagen: '/si-school/capacitaciones/img/ia-para-inmobiliarias.jpg',
    src: '/si-school/capacitaciones/ia-para-inmobiliarias.html',
  },
  {
    id: 'seguimiento-propiedad',
    titulo: 'El trabajo detrás de cada propiedad',
    bajada: 'Empatía, foco, seguimiento y diferencial',
    imagen: '/si-school/capacitaciones/img/seguimiento-trabajo-propiedad.jpg',
    src: '/si-school/capacitaciones/seguimiento-trabajo-propiedad.html',
  },
  {
    id: 'mentalidad-redes',
    titulo: 'Mentalidad de redes para el agente moderno',
    bajada: 'Del vendedor que interrumpe al experto que consultan',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/mentalidad-redes.jpg',
    src: '/si-school/capacitaciones/mentalidad-redes.html',
  },
  {
    id: 'nueva-inmobiliaria',
    titulo: 'La nueva inmobiliaria',
    bajada: 'Plan de comunicación de 90 días: marca personal o voz de equipo',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/nueva-inmobiliaria.jpg',
    src: '/si-school/capacitaciones/nueva-inmobiliaria.html',
  },
  {
    id: 'instrumentos-operacion',
    titulo: 'Elegir el instrumento correcto',
    bajada: 'Reserva, seña, boleto, escritura y poderes, con casos reales',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/instrumentos-operacion.jpg',
    src: '/si-school/capacitaciones/instrumentos-operacion.html',
  },
  {
    id: 'auditar-lote-scit',
    titulo: 'Auditar un lote en el SCIT',
    bajada: 'Titular, plano, partida y VEP antes de tomar una propiedad',
    etiqueta: 'Nuevo',
    imagen: '/si-school/capacitaciones/img/auditar-lote-scit.jpg',
    src: '/si-school/capacitaciones/auditar-lote-scit.html',
  },
]

/** Número de la capacitación con dos dígitos ("01"), según su orden. */
export function numeroCapacitacion(id: string): string {
  const i = CAPACITACIONES.findIndex((c) => c.id === id)
  return String(i + 1).padStart(2, '0')
}
