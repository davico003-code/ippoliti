// Última tanda de fotos reales de la obra (la más nueva reemplaza a la
// anterior). Módulo aparte y sin 'use client' porque lo leen dos lados: la
// galería de Avances y el filtro de "Fotos del barrio", que no las repite.

export const AVANCES_MES = {
  mes: 'Septiembre 2026',
  descripcion: 'El trazado de calles ya se lee completo desde el aire y las máquinas avanzan con el movimiento de suelo.',
}

// Cada foto se muestra a su aspecto natural (las aéreas apaisadas, las de
// máquinas verticales) para que ninguna quede estirada ni recortada.
export const AVANCES_FOTOS: { src: string; alt: string; aspect: '3/2' | '2/3' }[] = [
  { src: '/images/distrito-roldan/obra-5.webp', alt: 'Vista aérea de Distrito Roldán en septiembre de 2026 con el trazado de calles completo', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-9.webp', alt: 'Vista cenital de un camión y una pala cargadora moviendo suelo en Distrito Roldán en septiembre de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-7.webp', alt: 'Camión y pala cargadora trabajando en el predio de Distrito Roldán durante septiembre de 2026', aspect: '2/3' },
  { src: '/images/distrito-roldan/obra-6.webp', alt: 'Predio de Distrito Roldán desde el aire con camiones trabajando en septiembre de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-8.webp', alt: 'Retroexcavadora trabajando en la obra de Distrito Roldán durante septiembre de 2026', aspect: '2/3' },
]

// Comparador "hoy / agosto 2027": la misma toma de drone dos veces. La de 2027
// se generó con IA (Higgsfield, 22-oct-2026) A PARTIR de esta foto real, con
// las calles, el cordón, las luminarias y los árboles terminados y SIN casas
// (para construir hay que terminar de pagar el lote). Si cambia la foto de
// "hoy", hay que regenerar la de 2027 desde la nueva para que calcen.
export const COMPARADOR = {
  hoy: {
    src: '/images/distrito-roldan/obra-5.webp',
    alt: 'Distrito Roldán hoy, desde el drone: las calles trazadas en tierra y el movimiento de suelo',
    rotulo: 'Hoy · foto real',
  },
  despues: {
    src: '/images/distrito-roldan/obra-2027-ilustrativa.webp',
    alt: 'Distrito Roldán en agosto de 2027, desde la misma toma: calles pavimentadas, luminarias y árboles, con los lotes listos para construir. Imagen ilustrativa',
    rotulo: 'Agosto 2027 · imagen ilustrativa',
  },
}
