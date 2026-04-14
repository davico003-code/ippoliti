import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'Blog inmobiliario — Funes, Roldán y región | SI Inmobiliaria',
  description:
    'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán. Blog de SI Inmobiliaria.',
  alternates: { canonical: 'https://siinmobiliaria.com/blog' },
  openGraph: {
    title: 'Blog inmobiliario — Funes, Roldán y región',
    description:
      'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán.',
    url: 'https://siinmobiliaria.com/blog',
    images: ['/og-image.jpg'],
  },
}

/* ── Mapeo slug → imagen Pexels ── */
const PEXELS_IMAGES: Record<string, number> = {
  'costo-construccion-argentina-precio-propiedades': 3862132,
  'composicion-precio-m2-pozo-emprendimientos': 1396122,
  'red-flags-emprendimientos-inmobiliarios-pozo': 1370704,
  'inmobiliarias-roldan-como-elegir-la-mejor': 106399,
  'desarrollo-costo-vs-precio-cerrado-compradores': 3184292,
  'arquitectos-roldan-cuando-necesitas-uno-para-tu-propiedad': 1109541,
  'mano-obra-construccion-precio-propiedades-funes': 159358,
  'escribanos-roldan-rol-en-compra-venta-propiedad': 95916,
  'como-evaluar-desarrolladora-antes-invertir': 3184292,
  'constructoras-roldan-funes-construir-casa-2025': 2219024,
  'invertir-pozo-funes-2025-analisis': 1115804,
  'colegios-roldan-funes-guia-familias-que-se-mudan': 764681,
  'financiacion-largo-plazo-emprendimientos-2026': 5699823,
  'que-aspectos-aumentan-valor-lote-funes-roldan': 259588,
  'supermercados-comercios-roldan-vivir-sin-auto': 1005638,
  'acopio-materiales-canje-m2-compradores': 3760529,
  'transporte-colectivo-roldan-rosario-opciones': 1178448,
  'precio-m2-funes-roldan-perspectiva-2026': 323780,
  'salud-medicos-clinicas-roldan-lo-que-tenes-que-saber': 40568,
  'bancos-cajeros-roldan-servicios-financieros': 50987,
  'restaurantes-gastronomia-roldan-para-vivir-y-disfrutar': 1640777,
  'mercado-inmobiliario-2025-que-esta-pasando': 1546168,
  'seguridad-privada-barrios-cerrados-roldan-funes': 280229,
  'gimnasios-deportes-roldan-calidad-de-vida': 260447,
  'piletas-construccion-mantenimiento-roldan-funes': 261102,
  'paneles-solares-roldan-funes-conviene-2025': 2800832,
  'mudarse-roldan-desde-rosario-guia-completa-2025': 1115804,
  'funes-roldan-nuevo-eje-crecimiento-inmobiliario-gran-rosario': 1396122,
  'cuanto-deberia-rendir-inversion-inmobiliaria-dolares': 5699823,
  'comprar-casa-funes-roldan': 106399,
  'comprar-con-escritura-inmediata-inversion-segura': 95916,
  'como-detectar-loteo-confiable-funes-roldan': 259588,
  'barrios-cerrados-vs-abiertos-cual-conviene': 280229,
  'creditos-hipotecarios-argentina-que-tener-en-cuenta': 50987,
  'como-fijar-precio-venta-propiedad-sin-perder-dinero': 1370704,
  'inmobiliarias-en-roldan': 106399,
  '5-errores-comunes-comprar-inmueble-primera-vez': 3184292,
  'invertir-en-pozo-funes-ventajas-riesgos': 1115804,
  'corredor-funes-roldan-historia-crecimiento-proyeccion': 1396122,
  'inmobiliarias-en-funes': 106399,
  'que-es-cac-como-afecta-valor-propiedades-pesos': 5699823,
  'valor-m2-funes-roldan-analisis-por-barrio-tipologia': 323780,
  'como-preparar-propiedad-vender-rapido-mejor-precio': 2219024,
  'alquilar-o-comprar-2025-analisis-zona-oeste-rosario': 1370704,
  'por-que-roldan-nueva-apuesta-desarrolladores-inmobiliarios': 1396122,
  'financiacion-dolares-cuotas-fijas-vs-hipoteca': 50987,
  'donacion-herencia-compraventa-transferir-propiedad-argentina': 95916,
  'guia-completa-invertir-lotes-santa-fe': 259588,
  'por-que-si-inmobiliaria-43-anos-historia-familiar-roldan': 106399,
  'mercado-inmobiliario-roldan-como-saber-propiedad-bien-valuada': 323780,
  'si-inmobiliaria-abre-funes-galeria-arte': 1640777,
  'de-susana-ippoliti-a-si-inmobiliaria-cambio-dice-si-futuro': 106399,
}

function pexelsUrl(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`
}

/* ── Mapeo slug → categoría normalizada ── */
function resolveCategory(slug: string, existing?: string): string {
  if (slug.match(/construccion|pozo|emprendimiento|costo|cac|financiacion|invertir|inversion|pileta|panel|acopio|material/))
    return 'Inversión'
  if (slug.match(/roldan|funes|zona|corredor|mudarse|eje/)) return 'Funes y Roldán'
  if (slug.match(/mercado|precio|m2|valor|alquilar/)) return 'Mercado'
  if (slug.match(/escritura|legal|credito|hipotecario|donacion|herencia|escribano/))
    return 'Legal'
  if (slug.match(/colegio|salud|comercio|supermercado|transporte|restaurante|gimnasio|deporte|seguridad/))
    return 'Calidad de vida'
  if (slug.match(/error|preparar|fijar|elegir|detectar|evaluar|red-flag|arquitecto/))
    return 'Consejos'
  if (slug.match(/historia|susana|si-inmobiliaria|ippoliti/)) return 'Mercado'
  if (existing) return existing
  return 'Mercado'
}

export default async function BlogPage() {
  const allPosts = await getAllPosts();
  const posts = allPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    dateDisplay: p.dateDisplay,
    image: PEXELS_IMAGES[p.slug]
      ? pexelsUrl(PEXELS_IMAGES[p.slug])
      : p.image.startsWith('http')
        ? p.image
        : pexelsUrl(323780),
    category: resolveCategory(p.slug, p.category),
  }))

  return <BlogClient posts={posts} />
}
