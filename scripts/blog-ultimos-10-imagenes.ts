// Actualiza las portadas y agrega una imagen interna a los 10 últimos posts
// publicados del blog. Por defecto corre en dry-run:
//
//   npx tsx scripts/blog-ultimos-10-imagenes.ts
//   npx tsx scripts/blog-ultimos-10-imagenes.ts --aplicar
//
// Requiere .env.production. Las portadas se escriben en el hash Redis
// blog:image_override, igual que el editor admin. Las imágenes internas se
// insertan como Markdown para que las renderice /blog/[slug].

import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.production' });

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
      src: '/images/blog/inversion/llaves-casa-mano.jpg',
      alt: 'Llaves de una vivienda listas para entregar después de definir una operación inmobiliaria',
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
      src: '/images/blog/construccion/obrero-estructura-madera.jpg',
      alt: 'Trabajador avanzando en una estructura de obra seca durante una construcción residencial',
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
      src: '/images/blog/mercado-rosario/firma-living-pareja-agente.jpg',
      alt: 'Reunión entre asesor y clientes para revisar condiciones de una operación inmobiliaria',
    },
  },
  'infraestructura-vial-roldan-impacto-valor-propiedades': {
    title: 'Infraestructura vial en Roldán',
    hero: '/blog/images/funes-autopista-acceso-aerea.webp',
    inline: {
      src: '/images/blog/funes-y-roldan/zona-oeste-campo-aerea.jpg',
      alt: 'Vista aérea de accesos y trama urbana en la zona oeste de Rosario',
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
      src: '/images/blog/inversion/llaves-casa-mano.jpg',
      alt: 'Llaves sobre una operación cerrada después de negociar la compra de una propiedad',
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
  if (content.includes(`](${inline.src})`)) return content;

  const block = `![${inline.alt}](${inline.src})`;
  const parts = content.split(/\n{2,}/).map(part => part.trim()).filter(Boolean);
  const insertAt = Math.min(parts.length, Math.max(2, parts.findIndex(part => !part.startsWith('#')) + 2));
  parts.splice(insertAt, 0, block);
  return parts.join('\n\n');
}

async function validarImagenes(): Promise<void> {
  const uniqueImages = Array.from(new Set(Object.values(POSTS).flatMap(config => [
    config.hero,
    config.inline.src,
  ])));

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

  await fetch(`${BASE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ slug }),
  });
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
