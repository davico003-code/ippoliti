// Fuente única de los emprendimientos destacados del home (Sección 3).
// La consumen el mosaico de desktop (EmprendimientosHome) y el de mobile
// (ProyectosCarousel) vía <ProyectosMosaico>. Imágenes y rutas REALES.
//
// El ORDEN refleja la jerarquía del mosaico bento:
//   [0] big (protagonista) · [1] wide · [2] sm · [3] sm · [4] full (franja)

export interface ProyectoDestacado {
  id: string
  badge: string
  title: string
  location: string
  /** Condición de pago / gancho comercial. */
  pago: string
  href: string
  image: string
  /** URL sin extensión; ProjectMediaCard arma `${videoUrl}.webm` y `.mp4`. */
  videoUrl?: string
  /** Video que se reproduce en loop sobre la foto (que queda de póster/LCP).
   *  URL sin extensión: se arman `.webm` y `.mp4`. */
  timelapse?: string
  /** Logo del desarrollador, en blanco, arriba a la derecha de la tarjeta. */
  logo?: { src: string; alt: string; width: number; height: number }
}

export const PROYECTOS_DESTACADOS: ProyectoDestacado[] = [
  {
    id: 'distrito-roldan',
    logo: { src: '/images/distrito-roldan/brand/logo-transatlantica-blanco.webp', alt: 'Grupo Transatlántica', width: 640, height: 162 },
    badge: 'Barrio Abierto',
    title: 'Distrito Roldán',
    location: 'Roldán',
    pago: 'Entrega 30% + 24 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    // La aérea de Tokko con el color corregido y el camión del obrador integrado.
    image: '/images/distrito-roldan/portada-home-aerea.webp',
    videoUrl: '/videos/proyectos/distrito-roldan',
    // Timelapse campo → calles → asfalto → casas → noche (Higgsfield, 13-nov-2026),
    // armado SOBRE esta misma `image`: lo de afuera del predio es la foto real.
    timelapse: '/videos/proyectos/distrito-roldan-timelapse',
  },
  {
    id: 'tierra-nueva',
    logo: { src: '/emprendimientos/marcas/proyectta-blanco.svg', alt: 'Proyectta', width: 225, height: 64 },
    badge: 'Departamentos',
    title: 'Tierra Nueva',
    location: 'Fisherton',
    pago: '36 cuotas fijas en USD · Sin anticipo',
    href: '/emprendimientos/tierra-nueva',
    image: '/emprendimientos/tierra-nueva/card.webp',
  },
  {
    id: 'hausing',
    logo: { src: '/hausing-logo.svg', alt: 'Hausing', width: 468, height: 114 },
    badge: 'Casas Premium',
    title: 'Hausing',
    location: 'Funes',
    pago: 'Desde USD 380K · Financiación en dólares',
    href: '/hausing',
    image: '/hausing-portada.jpg',
    videoUrl: '/videos/proyectos/hausing',
  },
  {
    id: 'dockgarden',
    logo: { src: '/emprendimientos/marcas/vers-blanco.webp', alt: 'Estudio VERS', width: 640, height: 185 },
    badge: 'Condominio',
    title: 'Dockgarden',
    location: 'Aldea Fisherton',
    pago: 'Entrega 20% + 36 cuotas fijas en USD',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
    image: '/images/dockgarden/render-frente.webp', // render propio: la de Tokko trae el logo estampado
    videoUrl: '/videos/proyectos/dockgarden',
  },
  {
    // [4] franja a todo el ancho (David, 17-nov-2026). Sin precio: se publica así.
    id: 'galinda',
    logo: { src: '/emprendimientos/marcas/fundar-blanco.svg', alt: 'Fundar', width: 129, height: 32 },
    badge: 'Usos mixtos',
    title: 'Galinda!',
    location: 'Funes',
    pago: 'Showroom terminado · 30% de anticipo + 12 o 24 cuotas',
    href: '/emprendimientos/galinda',
    image: '/emprendimientos/galinda/video-portada-poster.webp',
    // Dron de la obra (DJI, 2-oct-2026), loop ida y vuelta.
    timelapse: '/videos/proyectos/galinda-dron',
  },
]
