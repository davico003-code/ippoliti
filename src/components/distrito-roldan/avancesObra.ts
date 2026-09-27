// Última tanda de fotos reales de la obra (la más nueva reemplaza a la
// anterior). Módulo aparte y sin 'use client' porque lo leen dos lados: la
// galería de Avances y el filtro de "Fotos del barrio", que no las repite.

export const AVANCES_MES = {
  mes: 'Agosto 2026',
  descripcion: 'El trazado de calles ya se lee completo desde el aire y las máquinas avanzan con el movimiento de suelo.',
}

// Cada foto se muestra a su aspecto natural (las aéreas apaisadas, las de
// máquinas verticales) para que ninguna quede estirada ni recortada.
export const AVANCES_FOTOS: { src: string; alt: string; aspect: '3/2' | '2/3' }[] = [
  { src: '/images/distrito-roldan/obra-5.webp', alt: 'Vista aérea de Distrito Roldán en agosto de 2026 con el trazado de calles completo', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-9.webp', alt: 'Vista cenital de un camión y una pala cargadora moviendo suelo en Distrito Roldán en agosto de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-7.webp', alt: 'Camión y pala cargadora trabajando en el predio de Distrito Roldán durante agosto de 2026', aspect: '2/3' },
  { src: '/images/distrito-roldan/obra-6.webp', alt: 'Predio de Distrito Roldán desde el aire con camiones trabajando en agosto de 2026', aspect: '3/2' },
  { src: '/images/distrito-roldan/obra-8.webp', alt: 'Retroexcavadora trabajando en la obra de Distrito Roldán durante agosto de 2026', aspect: '2/3' },
]
