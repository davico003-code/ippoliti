// Los emprendimientos que comercializamos, como tarjetas: los del feed de Hilo
// (con su desarrollador) + las landings propias (Tierra Nueva, Fisherton Work,
// Fincazul, Hausing, Aurea) + los clientes de Redis, en el orden comercial. Una
// sola lista para /emprendimientos y para la tele de la oficina (/tv).

import {
  getDevelopments,
  generateDevSlug,
  getDevMainPhoto,
  getDevAllPhotos,
  getConstructionStatus,
  translateDevType,
} from '@/lib/developments'
import { getAllClientes } from '@/lib/clientes'
import { LOGOS_CLARO, type Marca } from '@/components/landing/MarcaDesarrollador'

export const GREEN = '#1A5C38'
export const GOLD = '#C9A84C'

export type Card = {
  key: string
  href: string
  image: string | null
  eyebrow?: string
  title: string
  location?: string
  description?: string
  chips: string[]
  accent: string
  share?: { slug: string; title: string; path: string }
  /** Hasta 4 fotos (solo los emprendimientos del feed): las usa la tele. */
  fotos?: string[]
  /** Quién lo desarrolla/construye, con su logo (regla: toda landing la muestra). */
  marcas?: Marca[]
}

// Marca detrás de cada emprendimiento del feed (keyed por ID de Tokko), con los
// mismos créditos que la portada de su landing.
const MARCAS_DEV: Record<number, Marca[]> = {
  // Distrito Roldán
  67178: [
    { rol: 'Un desarrollo de', nombre: 'Grupo Transatlántica', logo: LOGOS_CLARO.transatlantica },
    { rol: 'Construye', nombre: 'EDECA', logo: LOGOS_CLARO.edeca },
  ],
  // Dock Garden — Aldea Fisherton
  67173: [{ rol: 'Un proyecto de', nombre: 'Estudio VERS', logo: LOGOS_CLARO.vers }],
}

const PROYECTTA: Marca[] = [{ rol: 'Un desarrollo de', nombre: 'Proyectta', logo: LOGOS_CLARO.proyectta }]

export async function getTarjetasEmprendimientos(): Promise<Card[]> {
  const [developments, clientes] = await Promise.all([
    getDevelopments().catch(() => []),
    getAllClientes().catch(() => []),
  ])

  // Normalizamos todas las fuentes (feed Tokko + landings propias + clientes de
  // Redis) a una sola forma para renderizar una grilla cohesiva tipo "poster".
  const cards: Card[] = []

  for (const dev of developments) {
    const slug = generateDevSlug(dev)
    cards.push({
      key: `dev-${dev.id}`,
      href: `/emprendimientos/${slug}`,
      image: getDevMainPhoto(dev),
      fotos: getDevAllPhotos(dev).slice(0, 4),
      eyebrow: dev.publication_title && dev.publication_title !== dev.name ? dev.publication_title : undefined,
      title: dev.name,
      location: dev.location?.name || dev.fake_address || dev.address || undefined,
      description: dev.description ? `${dev.description.replace(/<[^>]*>/g, '').slice(0, 260)}…` : undefined,
      chips: [translateDevType(dev.type?.name || ''), getConstructionStatus(dev.construction_status)].filter(Boolean),
      accent: GREEN,
      share: { slug, title: dev.name, path: `/emprendimientos/${slug}` },
      marcas: MARCAS_DEV[dev.id],
    })
  }

  cards.push({
    key: 'tierra-nueva',
    href: '/emprendimientos/tierra-nueva',
    image: '/emprendimientos/tierra-nueva/card.webp',
    eyebrow: 'Departamentos en cuotas · Fisherton',
    title: 'Tierra Nueva — Condos 22, 23 y 24',
    location: 'Casacuberta, Alippi y Parravicini · Fisherton, Rosario',
    description:
      'Departamentos de 1 y 2 dormitorios con cochera, pileta, SUM y parrilla. 36 cuotas fijas en dólares sin anticipo, en un barrio con más de 500 unidades ya entregadas.',
    chips: ['Departamentos', 'En construcción'],
    accent: GREEN,
    marcas: PROYECTTA,
  })

  cards.push({
    key: 'fisherton-work',
    href: '/emprendimientos/fisherton-work',
    image: '/emprendimientos/fisherton-work/render-conjunto.webp',
    eyebrow: 'Parque logístico y comercial · Rosario',
    title: 'Fisherton Work',
    location: 'Av. Hernán Pujato 7880, Fisherton · Rosario',
    description:
      '43 unidades 4 en 1: showroom, depósito, oficina y 5 cocheras propias sobre lotes desde 400 m². A 300 m de Av. Jorge Newbery y 700 m de Circunvalación. Lotes unificables.',
    chips: ['Locales y depósitos', 'Lanzamiento'],
    accent: GREEN,
    marcas: PROYECTTA,
  })

  cards.push({
    key: 'fincazul',
    href: '/emprendimientos/fincazul',
    image: '/emprendimientos/fincazul/portada.jpg',
    eyebrow: 'Tu casa en condominio en Funes',
    title: 'Fincazul',
    location: 'Paseo del Norte, Funes',
    description:
      'Conjuntos privados de doce casas dúplex con portón de acceso. 2 dormitorios y 2 baños, con jardín, piscina y parrillero propios. A pasos de Fisherton.',
    chips: ['Casas en condominio', 'En construcción'],
    accent: GREEN,
    marcas: [{ rol: 'Desarrolla y construye', nombre: 'MSR', logo: LOGOS_CLARO.msr }],
  })

  cards.push({
    key: 'hausing',
    href: '/hausing',
    image: '/hausing-portada.jpg',
    eyebrow: 'Barrios cerrados premium · Funes',
    title: 'Hausing — Casas de Diseño',
    location: 'Vida, Cadaques, Don Mateo, Kentucky · Funes',
    description:
      'Casas exclusivas en los mejores barrios cerrados de Funes. Diseño contemporáneo, pileta, 3 y 4 dormitorios. Financiación en dólares.',
    chips: ['Casas premium', 'Funes'],
    accent: GREEN,
    marcas: [{ rol: 'Construye', nombre: 'Hausing', logo: LOGOS_CLARO.hausing }],
  })

  cards.push({
    key: 'aurea',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
    eyebrow: 'Desarrollo residencial premium · Roldán',
    title: 'Aurea — Barrio Privado',
    location: 'Roldán · Acceso directo por autopista',
    description:
      'Lotes desde 500 m² en barrio privado con seguridad 24 hs, club house, pileta y espacios verdes. Financiación disponible.',
    chips: ['Lotes desde 500m²', 'Roldán'],
    accent: GOLD,
    // Ejecuta Desarrolladora G; diseño arquitectónico y paisajístico de Estudio Masea.
    marcas: [
      { rol: 'Un desarrollo de', nombre: 'Desarrolladora G', logo: LOGOS_CLARO.desarrolladoraG, mostrarNombre: true },
      { rol: 'Diseña', nombre: 'Estudio Masea', logo: LOGOS_CLARO.masea },
    ],
  })

  for (const c of clientes) {
    cards.push({
      key: `cliente-${c.slug}`,
      href: `/emprendimientos/${c.slug}`,
      image: c.coverImage || null,
      title: c.name,
      description: c.description || undefined,
      chips: ['Comercializamos'],
      accent: GREEN,
    })
  }

  // Orden comercial: primero los que empujamos (Distrito Roldán, Tierra Nueva,
  // Hausing, Dockgarden); Aurea y Fincazul al final. El resto conserva su orden.
  const PRIMEROS = ['distrito-roldan', 'tierra-nueva', 'hausing', 'dockgarden']
  const ULTIMOS = ['aurea', 'fincazul']
  const rango = (c: Card) => {
    const id = c.href.split('/').pop() ?? ''
    const p = PRIMEROS.findIndex((k) => c.key === k || id.includes(k))
    if (p >= 0) return p
    const u = ULTIMOS.indexOf(c.key)
    return u >= 0 ? 1000 + u : 100
  }
  cards.sort((a, b) => rango(a) - rango(b))

  return cards
}
