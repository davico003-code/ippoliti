// Fuente única de los emprendimientos destacados del home (Sección 3).
// La consumen el mosaico de desktop (EmprendimientosHome) y el de mobile
// (ProyectosCarousel) vía <ProyectosMosaico>. Imágenes y rutas REALES.
//
// El ORDEN refleja la jerarquía del mosaico bento:
//   [0] big (protagonista) · [1] wide · [2] sm · [3] sm

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
  /** Máquinas de obra animadas sobre la foto (MaquinasObra). Las rutas están
   *  trazadas sobre ESTA `image`: si se cambia la foto, sacar el flag o
   *  retrazarlas. */
  maquinas?: boolean
}

export const PROYECTOS_DESTACADOS: ProyectoDestacado[] = [
  {
    id: 'distrito-roldan',
    badge: 'Barrio Abierto',
    title: 'Distrito Roldán',
    location: 'Roldán',
    pago: 'Entrega 30% + 24 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    image: 'https://static.tokkobroker.com/dev_pictures/67178_41755302210101797952152961824111367170079757743169980171710493926367681957871.jpg',
    videoUrl: '/videos/proyectos/distrito-roldan',
    maquinas: true,
  },
  {
    id: 'tierra-nueva',
    badge: 'Departamentos',
    title: 'Tierra Nueva',
    location: 'Fisherton',
    pago: '36 cuotas fijas en USD · Sin anticipo',
    href: '/emprendimientos/tierra-nueva',
    image: '/emprendimientos/tierra-nueva/card.webp',
  },
  {
    id: 'hausing',
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
    badge: 'Condominio',
    title: 'Dockgarden',
    location: 'Aldea Fisherton',
    pago: 'Entrega 20% + 36 cuotas fijas en USD',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
    image: '/images/dockgarden/render-frente.webp', // render propio: la de Tokko trae el logo estampado
    videoUrl: '/videos/proyectos/dockgarden',
  },
]
