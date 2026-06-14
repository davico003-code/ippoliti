// Fuente única de los emprendimientos destacados del home (Sección 3).
// La consumen el marquee de desktop (EmprendimientosHome) y el de mobile
// (ProyectosCarousel) vía <ProyectosMarquee>. Imágenes y rutas REALES.

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
}

export const PROYECTOS_DESTACADOS: ProyectoDestacado[] = [
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
    image: 'https://static.tokkobroker.com/dev_pictures/67173_93775060846060385394324593876733363454956168345677306486130087037249128718036.jpg',
    videoUrl: '/videos/proyectos/dockgarden',
  },
  {
    id: 'distrito-roldan',
    badge: 'Barrio Abierto',
    title: 'Distrito Roldán',
    location: 'Roldán',
    pago: 'Entrega 30% + 24 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    image: 'https://static.tokkobroker.com/dev_pictures/67178_41755302210101797952152961824111367170079757743169980171710493926367681957871.jpg',
    videoUrl: '/videos/proyectos/distrito-roldan',
  },
  {
    id: 'aurea',
    badge: 'Barrio Privado',
    title: 'Aurea',
    location: 'Roldán',
    pago: 'Lotes desde 500m² · Financiación disponible',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
    videoUrl: '/videos/proyectos/aurea',
  },
]
