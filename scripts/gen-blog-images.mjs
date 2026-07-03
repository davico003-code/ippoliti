// Genera una imagen Unsplash única (dedup global) y temática por slug del blog.
// Uso: node gen-blog-images.mjs  (lee UNSPLASH_ACCESS_KEY de ~/ippoliti/.env.local)
import { readFileSync } from 'node:fs'

const envRaw = readFileSync('/Users/siinmobiliaria/ippoliti/.env.local', 'utf8')
const KEY = (envRaw.match(/UNSPLASH_ACCESS_KEY=(.+)/) || [])[1]?.trim().replace(/^["']|["']$/g, '')
if (!KEY) { console.error('No UNSPLASH_ACCESS_KEY'); process.exit(1) }

// slug -> query temática en inglés (Unsplash busca mejor en inglés)
const QUERIES = {
  'costo-construccion-argentina-precio-propiedades': 'construction site building crane',
  'composicion-precio-m2-pozo-emprendimientos': 'apartment building under construction',
  'red-flags-emprendimientos-inmobiliarios-pozo': 'abandoned unfinished construction',
  'inmobiliarias-roldan-como-elegir-la-mejor': 'real estate agent handshake',
  'desarrollo-costo-vs-precio-cerrado-compradores': 'modern residential development',
  'arquitectos-roldan-cuando-necesitas-uno-para-tu-propiedad': 'architect blueprint desk',
  'mano-obra-construccion-precio-propiedades-funes': 'construction worker bricklaying',
  'escribanos-roldan-rol-en-compra-venta-propiedad': 'signing contract pen document',
  'como-evaluar-desarrolladora-antes-invertir': 'business meeting office desk',
  'constructoras-roldan-funes-construir-casa-2025': 'house wood framing construction',
  'invertir-pozo-funes-2025-analisis': 'financial investment growth chart',
  'colegios-roldan-funes-guia-familias-que-se-mudan': 'school classroom children',
  'financiacion-largo-plazo-emprendimientos-2026': 'mortgage calculator house money',
  'que-aspectos-aumentan-valor-lote-funes-roldan': 'empty land plot grass',
  'supermercados-comercios-roldan-vivir-sin-auto': 'supermarket grocery aisle',
  'acopio-materiales-canje-m2-compradores': 'construction materials warehouse',
  'transporte-colectivo-roldan-rosario-opciones': 'city bus public transport',
  'precio-m2-funes-roldan-perspectiva-2026': 'modern house exterior facade',
  'salud-medicos-clinicas-roldan-lo-que-tenes-que-saber': 'medical clinic doctor',
  'bancos-cajeros-roldan-servicios-financieros': 'bank building finance',
  'restaurantes-gastronomia-roldan-para-vivir-y-disfrutar': 'restaurant dining table food',
  'mercado-inmobiliario-2025-que-esta-pasando': 'suburban houses aerial view',
  'seguridad-privada-barrios-cerrados-roldan-funes': 'gated community entrance gate',
  'gimnasios-deportes-roldan-calidad-de-vida': 'gym fitness dumbbells',
  'piletas-construccion-mantenimiento-roldan-funes': 'swimming pool backyard',
  'paneles-solares-roldan-funes-conviene-2025': 'solar panels roof',
  'mudarse-roldan-desde-rosario-guia-completa-2025': 'moving boxes new home',
  'funes-roldan-nuevo-eje-crecimiento-inmobiliario-gran-rosario': 'suburban neighborhood aerial',
  'cuanto-deberia-rendir-inversion-inmobiliaria-dolares': 'dollars money house model',
  'comprar-casa-funes-roldan': 'family new house keys',
  'comprar-con-escritura-inmediata-inversion-segura': 'house keys contract',
  'como-detectar-loteo-confiable-funes-roldan': 'land subdivision plots aerial',
  'barrios-cerrados-vs-abiertos-cual-conviene': 'gated community houses aerial',
  'creditos-hipotecarios-argentina-que-tener-en-cuenta': 'mortgage loan house model coins',
  'como-fijar-precio-venta-propiedad-sin-perder-dinero': 'for sale sign house',
  'inmobiliarias-en-roldan': 'real estate office desk',
  '5-errores-comunes-comprar-inmueble-primera-vez': 'couple reviewing paperwork home',
  'invertir-en-pozo-funes-ventajas-riesgos': 'apartment construction investment',
  'corredor-funes-roldan-historia-crecimiento-proyeccion': 'highway aerial city growth',
  'inmobiliarias-en-funes': 'modern house for sale',
  'que-es-cac-como-afecta-valor-propiedades-pesos': 'construction cost calculator',
  'valor-m2-funes-roldan-analisis-por-barrio-tipologia': 'residential street houses',
  'como-preparar-propiedad-vender-rapido-mejor-precio': 'bright staged living room',
  'alquilar-o-comprar-2025-analisis-zona-oeste-rosario': 'house keys rent buy',
  'por-que-roldan-nueva-apuesta-desarrolladores-inmobiliarios': 'new suburb development construction',
  'financiacion-dolares-cuotas-fijas-vs-hipoteca': 'finance documents calculator money',
  'donacion-herencia-compraventa-transferir-propiedad-argentina': 'legal documents inheritance',
  'guia-completa-invertir-lotes-santa-fe': 'open field land investment',
  'por-que-si-inmobiliaria-43-anos-historia-familiar-roldan': 'family business team office',
  'mercado-inmobiliario-roldan-como-saber-propiedad-bien-valuada': 'house appraisal magnifying',
  'si-inmobiliaria-abre-funes-galeria-arte': 'art gallery interior',
  'de-susana-ippoliti-a-si-inmobiliaria-cambio-dice-si-futuro': 'modern office team meeting',
}

const used = new Set()
const out = {}
const failed = []
const entries = Object.entries(QUERIES)

async function search(query, page = 1) {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('per_page', '10')
  url.searchParams.set('page', String(page))
  url.searchParams.set('content_filter', 'high')
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}` } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

for (const [slug, query] of entries) {
  try {
    let picked = null
    for (let page = 1; page <= 2 && !picked; page++) {
      const data = await search(query, page)
      for (const ph of data.results || []) {
        if (!used.has(ph.id)) { picked = ph; break }
      }
    }
    if (!picked) { failed.push(slug); console.error('SIN FOTO:', slug); continue }
    used.add(picked.id)
    // urls.regular es un hotlink permanente (images.unsplash.com/photo-<id>)
    const clean = picked.urls.raw
      ? `${picked.urls.raw}&w=1200&q=80&fm=jpg&fit=crop`
      : picked.urls.regular
    out[slug] = clean
    process.stderr.write('.')
    await new Promise(r => setTimeout(r, 150))
  } catch (e) {
    failed.push(slug)
    console.error('\nERROR', slug, e.message)
    if (String(e.message).startsWith('403') || String(e.message).startsWith('429')) {
      console.error('RATE LIMIT — corto acá'); break
    }
  }
}

console.error(`\n\nOK: ${Object.keys(out).length}/${entries.length}  |  fallaron: ${failed.length}`, failed)
console.log(JSON.stringify(out, null, 2))
