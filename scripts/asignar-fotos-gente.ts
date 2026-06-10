// Reasigna las portadas de notas publicadas a las fotos nuevas con gente
// (10-jun-2026), usando el mismo mecanismo de override que /admin/notas
// (hash Redis blog:image_override) + revalidate por slug.
//
//   npx tsx scripts/asignar-fotos-gente.ts          → dry-run (muestra el mapeo)
//   npx tsx scripts/asignar-fotos-gente.ts --aplicar → escribe y revalida
//
// Requiere .env.production. Las rutas deben existir en producción (deploy
// del manifest de 27 imágenes mergeado antes de correr esto).

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.production' });

const APLICAR = process.argv.includes('--aplicar');
const BASE_URL = 'https://siinmobiliaria.com';

const OVERRIDES: Record<string, string> = {
  'hogar-a-lena-y-quinchos-el-ritual-del-invierno': '/images/blog/funes-y-roldan/asado-parrillero.jpg',
  'jardin-en-invierno-proteger-plantas-heladas': '/images/blog/funes-y-roldan/jardin-trabajo-casa.jpg',
  'gas-y-monoxido-de-carbono-seguridad-en-invierno': '/images/blog/generales/tecnico-instalacion-domiciliaria.jpg',
  'como-se-tasa-una-propiedad': '/images/blog/mercado-rosario/agente-mostrando-casa-pareja.jpg',
  'acm-los-tres-precios-de-una-propiedad': '/images/blog/mercado-rosario/firma-living-pareja-agente.jpg',
  'como-negociar-la-compra-de-una-propiedad': '/images/blog/inversion/firma-contrato-escritorio.jpg',
  '5-senales-de-un-corredor-inmobiliario-confiable': '/images/blog/inversion/llaves-casa-mano.jpg',
  'home-staging-vender-tu-casa-mas-rapido': '/images/blog/mercado-rosario/pareja-mudanza-cajas.jpg',
  'steel-framing-y-construccion-en-seco': '/images/blog/construccion/obrero-estructura-madera.jpg',
  'comprar-en-pozo-credito-hipotecario-divisible': '/images/blog/construccion/albanil-bloques-pared.jpg',
};

function envFaltantes(keys: string[]): string[] {
  return keys.filter(k => !(process.env[k] || '').trim());
}

async function main(): Promise<void> {
  const faltan = envFaltantes(['KV_REST_API_URL', 'KV_REST_API_TOKEN']);
  if (faltan.length > 0) {
    console.error(`Faltan env vars: ${faltan.join(', ')}`);
    process.exit(1);
  }

  for (const [slug, ruta] of Object.entries(OVERRIDES)) {
    console.log(`${slug}\n  → ${ruta}`);
  }

  if (!APLICAR) {
    console.log(`\nDry-run: ${Object.keys(OVERRIDES).length} overrides SIN aplicar. Usá --aplicar.`);
    return;
  }

  // Verificar que cada imagen exista en prod antes de apuntarle una nota
  for (const ruta of Object.values(OVERRIDES)) {
    const res = await fetch(`${BASE_URL}${ruta}`, { method: 'HEAD' });
    if (!res.ok) {
      console.error(`ABORTO: ${ruta} devuelve ${res.status} en prod (¿deploy pendiente?)`);
      process.exit(1);
    }
  }
  console.log('Las 10 imágenes responden 200 en prod.');

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  await redis.hset('blog:image_override', OVERRIDES);
  console.log(`Overrides escritos: ${Object.keys(OVERRIDES).length}`);

  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    for (const slug of Object.keys(OVERRIDES)) {
      await fetch(`${BASE_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ slug }),
      });
    }
    console.log('Revalidación disparada para los 10 slugs.');
  } else {
    console.warn('REVALIDATE_SECRET no configurado: las páginas se actualizan solas con el revalidate horario.');
  }
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
