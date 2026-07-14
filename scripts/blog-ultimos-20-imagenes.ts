// Actualiza las portadas y agrega una imagen interna a los 20 últimos posts
// publicados del blog. Por defecto corre en dry-run:
//
//   npx tsx scripts/blog-ultimos-20-imagenes.ts
//   npx tsx scripts/blog-ultimos-20-imagenes.ts --aplicar
//
// Requiere .env.production. Las portadas se escriben en el hash Redis
// blog:image_override, igual que el editor admin. Las imágenes internas se
// insertan como Markdown para que las renderice /blog/[slug].

import { config as loadEnv } from 'dotenv';

loadEnv({ path: process.env.BLOG_ENV_PATH || '.env.production' });

const APLICAR = process.argv.includes('--aplicar');
const BASE_URL = 'https://siinmobiliaria.com';

type BlogPostPayload = {
  slug: string;
  titulo?: string;
  title?: string;
  contenido_markdown?: string;
  content?: string;
  [key: string]: unknown;
};

type ImageConfig = {
  title: string;
  hero: string;
  inline: {
    src: string;
    alt: string;
  };
};

const POSTS: Record<string, ImageConfig> = {
  'hipotecas-oeste-caida-funes-roldan': {
    title: 'Hipotecas en el Oeste',
    hero: '/images/blog/mercado-rosario/firma-living-pareja-agente.jpg',
    inline: {
      src: 'https://images.pexels.com/photos/11348119/pexels-photo-11348119.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Modelo de vivienda, monedas y reloj como referencia de planificación hipotecaria',
    },
  },
  'home-staging-vender-tu-casa-mas-rapido': {
    title: 'Home staging',
    hero: '/images/blog/mercado-rosario/pareja-mudanza-cajas.jpg',
    inline: {
      src: '/images/blog/generales/asesor-living-vertical.jpg',
      alt: 'Asesor inmobiliario revisando un living preparado para mostrar una propiedad',
    },
  },
  'drenaje-roldan-limpieza-canales-valor-propiedades': {
    title: 'Drenaje en Roldán',
    hero: '/images/blog/funes-y-roldan/zona-oeste-campo-aerea.jpg',
    inline: {
      src: '/images/blog/funes-y-roldan/roldan-las-tardes-02.jpg',
      alt: 'Vista aérea de sectores residenciales de Roldán con calles y espacios verdes',
    },
  },
  'construir-sin-gastar-de-mas-8-decisiones-clave': {
    title: 'Construir sin gastar de más',
    hero: '/images/blog/construccion/albanil-bloques-pared.jpg',
    inline: {
      src: 'https://images.pexels.com/photos/4956914/pexels-photo-4956914.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Trabajador con equipo de seguridad avanzando sobre una estructura de obra',
    },
  },
  'casas-modulares-chinas-funes-roldan-20000-dolares': {
    title: 'Casas modulares chinas',
    hero: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Casa moderna compacta como referencia visual para sistemas de vivienda modular',
    },
  },
  '5-senales-de-un-corredor-inmobiliario-confiable': {
    title: 'Corredor inmobiliario confiable',
    hero: '/images/blog/inversion/llaves-casa-mano.jpg',
    inline: {
      src: 'https://images.pexels.com/photos/23224986/pexels-photo-23224986.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Corredor inmobiliario conversando con una pareja durante una consulta en un living',
    },
  },
  'infraestructura-vial-roldan-impacto-valor-propiedades': {
    title: 'Infraestructura vial en Roldán',
    hero: '/blog/images/funes-autopista-acceso-aerea.webp',
    inline: {
      src: '/blog/images/roldan-vista-aerea-autopista.webp',
      alt: 'Vista aérea de Roldán y su conexión con la autopista Rosario Córdoba',
    },
  },
  'domotica-sumar-valor-a-tu-casa-con-poca-inversion': {
    title: 'Domótica',
    hero: 'https://zscl1yt5nlp1egia.public.blob.vercel-storage.com/blog-overrides/domotica-sumar-valor-a-tu-casa-con-poca-inversion-vBHbXWUspuvwzIcqaXWjayDkgc1aT6.webp',
    inline: {
      src: 'https://images.pexels.com/photos/8293777/pexels-photo-8293777.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Dispositivo inteligente de hogar como referencia para mejoras simples de domótica',
    },
  },
  'comprar-casa-funes-roldan-precios-credito-financiamiento': {
    title: 'Comprar casa en Funes y Roldán',
    hero: '/images/blog/mercado-rosario/agente-mostrando-casa-pareja.jpg',
    inline: {
      src: '/images/blog/funes-y-roldan/country-arboles-pileta.jpg',
      alt: 'Casa con pileta y arbolado como referencia del mercado residencial de Funes y Roldán',
    },
  },
  'como-negociar-la-compra-de-una-propiedad': {
    title: 'Negociar la compra de una propiedad',
    hero: '/images/blog/inversion/firma-contrato-escritorio.jpg',
    inline: {
      src: 'https://images.pexels.com/photos/7937705/pexels-photo-7937705.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Pareja revisando planos y condiciones de compra con una asesora inmobiliaria',
    },
  },
  'infraestructura-servicios-valor-barrio-funes-roldan': {
    title: 'Servicios que aumentan el valor de un barrio',
    hero: '/images/blog/funes-y-roldan/barrio-aereo-denso.jpg',
    inline: {
      src: '/blog/images/funes-avenida-arbolada-campo.webp',
      alt: 'Avenida arbolada y entorno urbano consolidado en el corredor oeste',
    },
  },
  'casas-autosustentables-en-tu-lote': {
    title: 'Casas autosustentables',
    hero: 'https://images.pexels.com/photos/16427010/pexels-photo-16427010.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/6233727/pexels-photo-6233727.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Viviendas residenciales con paneles solares instalados sobre sus techos',
    },
  },
  'bomberos-funes-roldan-infraestructura-valor-propiedad': {
    title: 'Bomberos, servicios y valor de la propiedad',
    hero: 'https://images.pexels.com/photos/4090002/pexels-photo-4090002.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/36409934/pexels-photo-36409934.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Bombero equipado junto a una unidad de respuesta durante un operativo',
    },
  },
  'acm-los-tres-precios-de-una-propiedad': {
    title: 'Los tres precios de una propiedad',
    hero: 'https://images.pexels.com/photos/8293647/pexels-photo-8293647.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/7433832/pexels-photo-7433832.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Análisis de números y comparables con calculadora y gráficos de mercado',
    },
  },
  'que-buscan-compradores-funes-roldan-corredor-oeste': {
    title: 'Qué buscan los compradores del corredor oeste',
    hero: 'https://images.pexels.com/photos/23224991/pexels-photo-23224991.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/7937330/pexels-photo-7937330.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Pareja recorriendo una vivienda mientras conversa con un asesor inmobiliario',
    },
  },
  'steel-framing-y-construccion-en-seco': {
    title: 'Steel framing y construcción en seco',
    hero: '/images/blog/construccion/obrero-estructura-madera.jpg',
    inline: {
      src: 'https://images.pexels.com/photos/7961889/pexels-photo-7961889.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Equipo de obra montando una estructura metálica en una construcción',
    },
  },
  'infraestructura-electrica-roldan-licitacion-epe-desarrollo-inmobiliario': {
    title: 'Infraestructura eléctrica en Roldán',
    hero: 'https://images.pexels.com/photos/4626268/pexels-photo-4626268.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/29024404/pexels-photo-29024404.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Red de alta tensión atravesando un paisaje abierto como referencia de infraestructura eléctrica',
    },
  },
  'como-se-tasa-una-propiedad': {
    title: 'Cómo se tasa una propiedad',
    hero: 'https://images.pexels.com/photos/29899813/pexels-photo-29899813.jpeg?auto=compress&cs=tinysrgb&w=1200',
    inline: {
      src: 'https://images.pexels.com/photos/34135038/pexels-photo-34135038.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Documentación, llaves y modelos de vivienda utilizados para analizar una tasación',
    },
  },
  'aislacion-termica-por-donde-se-escapa-el-calor': {
    title: 'Aislación térmica',
    hero: 'https://zscl1yt5nlp1egia.public.blob.vercel-storage.com/blog-overrides/aislacion-termica-por-donde-se-escapa-el-calor-V3TfeS3Ak75QrpZ10Iai3Ei5csEe1s.webp',
    inline: {
      src: 'https://images.pexels.com/photos/5511085/pexels-photo-5511085.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Edificio residencial en obra con capas de aislación visibles en la envolvente',
    },
  },
  'calefaccion-eficiente-que-sistema-conviene': {
    title: 'Calefacción eficiente',
    hero: 'https://zscl1yt5nlp1egia.public.blob.vercel-storage.com/blog-overrides/calefaccion-eficiente-que-sistema-conviene-maDjo038bDixX4hg1qWExWQ2f0KDEZ.webp',
    inline: {
      src: 'https://images.pexels.com/photos/12644994/pexels-photo-12644994.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Mano ajustando la válvula termostática de un radiador para regular el consumo',
    },
  },
};

function envFaltantes(keys: string[]): string[] {
  return keys.filter(key => !(process.env[key] || '').trim());
}

function absoluteImage(src: string): string {
  return src.startsWith('http') ? src : `${BASE_URL}${src}`;
}

function getContent(post: BlogPostPayload): string {
  return String(post.contenido_markdown || post.content || '');
}

function setContent(post: BlogPostPayload, content: string): BlogPostPayload {
  if ('contenido_markdown' in post || !('content' in post)) {
    return { ...post, contenido_markdown: content };
  }
  return { ...post, content };
}

function insertarImagenInterna(content: string, inline: ImageConfig['inline']): string {
  const block = `![${inline.alt}](${inline.src})`;
  const parts = content
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(part => part && !/^!\[[^\]]*\]\([^)]+\)$/.test(part));
  const insertAt = Math.min(parts.length, Math.max(2, parts.findIndex(part => !part.startsWith('#')) + 2));
  parts.splice(insertAt, 0, block);
  return parts.join('\n\n');
}

async function validarImagenes(): Promise<void> {
  const expected = Object.keys(POSTS).length * 2;
  const uniqueImages = Array.from(new Set(Object.values(POSTS).flatMap(config => [
    config.hero,
    config.inline.src,
  ])));
  if (uniqueImages.length !== expected) {
    throw new Error(`Hay imágenes repetidas: ${uniqueImages.length} únicas para ${expected} ubicaciones.`);
  }

  for (const src of uniqueImages) {
    const res = await fetch(absoluteImage(src), { method: 'HEAD' });
    if (!res.ok) {
      throw new Error(`${src} devuelve ${res.status}`);
    }
  }
}

async function revalidar(slug: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;

  const res = await fetch(`${BASE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ slug }),
  });
  if (!res.ok) {
    throw new Error(`No se pudo revalidar ${slug}: ${res.status} ${await res.text()}`);
  }
}

async function main(): Promise<void> {
  const faltan = envFaltantes(['BLOG_READ_WRITE_TOKEN', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']);
  if (faltan.length > 0) {
    console.error(`Faltan env vars: ${faltan.join(', ')}`);
    process.exit(1);
  }

  console.log(`Posts a actualizar: ${Object.keys(POSTS).length}`);
  for (const [slug, config] of Object.entries(POSTS)) {
    console.log(`${slug}\n  portada: ${config.hero}\n  interna: ${config.inline.src}`);
  }

  await validarImagenes();
  console.log('Todas las imágenes elegidas responden correctamente.');

  if (!APLICAR) {
    console.log('\nDry-run completo. Usá --aplicar para escribir Blob + Redis + revalidar.');
    return;
  }

  const [{ Redis }, { list, put }] = await Promise.all([
    import('@upstash/redis'),
    import('@vercel/blob'),
  ]);

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const overrides = Object.fromEntries(
    Object.entries(POSTS).map(([slug, config]) => [slug, config.hero])
  );
  await redis.hset('blog:image_override', overrides);
  console.log('Portadas escritas en blog:image_override.');

  const { blobs } = await list({
    prefix: 'blog-posts/',
    token: process.env.BLOG_READ_WRITE_TOKEN!,
  });

  for (const [slug, config] of Object.entries(POSTS)) {
    const blob = blobs.find(item => item.pathname === `blog-posts/${slug}.json`);
    if (!blob) {
      console.warn(`No encontré blob para ${slug}, salteo contenido interno.`);
      continue;
    }

    const res = await fetch(blob.url);
    if (!res.ok) {
      console.warn(`No pude leer ${slug}: ${res.status}`);
      continue;
    }

    const post = await res.json() as BlogPostPayload;
    const nextContent = insertarImagenInterna(getContent(post), config.inline);
    const updated = setContent(post, nextContent);

    await put(`blog-posts/${slug}.json`, JSON.stringify(updated, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOG_READ_WRITE_TOKEN!,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    await revalidar(slug);
    console.log(`Actualizado: ${slug}`);
  }

  await revalidar('blog');
  console.log('Listo: portadas + imágenes internas aplicadas.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
