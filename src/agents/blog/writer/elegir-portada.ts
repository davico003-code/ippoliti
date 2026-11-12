import { put } from '@vercel/blob';
import sharp from 'sharp';
import { Redis } from '@upstash/redis';
import { llamarClaude } from '../lib/claude-client';
import { BANCO_FOTOS, type FotoBanco } from '../banco-fotos';

// Portada de cada nota elegida del banco de fotos REALES (regla de David,
// 03-oct-2026): nada de imágenes generadas con IA ni stock extranjero. El
// banco tiene fotos propias (barrios, obras, oficina, equipo, propiedades de
// la cartera sin dirección) y fotos locales de medios con acuerdo (InfoFunes,
// El Occidental) o de licencia libre, cada una con su crédito.
//
// Flujo: Claude elige del banco la foto que mejor ilustra la nota (evitando
// las usadas hace poco) → sharp 1200×630 WebP → Blob blog-overrides/ →
// blog:image_override (+ blog:image_credit si corresponde) → revalidate.
// Mismo destino y prioridad que la subida manual desde /admin/notas.

const BASE_URL = 'https://siinmobiliaria.com';
const OG_W = 1200;
const OG_H = 630;
const WEBP_QUALITY = 80;
// Últimas fotos usadas: no se repiten mientras estén en esta ventana.
const USADAS_KEY = 'blog:fotos_usadas';
const VENTANA_USADAS = 40;
const MODEL_ELECTOR = 'claude-haiku-4-5-20251001';

export interface DatosPortada {
  slug: string;
  titulo: string;
  imagen_sugerida?: string;
  bajada?: string;
  categoria?: string;
}

export type ResultadoPortada =
  | { ok: true; url: string; fotoId: string }
  | { ok: false; error: string };

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// Respaldo sin Claude: puntaje por coincidencia de palabras con tags y
// descripción.
function elegirPorTags(datos: DatosPortada, candidatas: FotoBanco[]): FotoBanco {
  const texto = `${datos.titulo} ${datos.imagen_sugerida ?? ''} ${datos.bajada ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  let mejor = candidatas[0];
  let mejorPuntaje = -1;
  for (const f of candidatas) {
    const palabras = `${f.tags.join(' ')} ${f.descripcion}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length > 3);
    const puntaje = new Set(palabras.filter((p) => texto.includes(p))).size;
    if (puntaje > mejorPuntaje) {
      mejor = f;
      mejorPuntaje = puntaje;
    }
  }
  return mejor;
}

async function elegirConClaude(datos: DatosPortada, candidatas: FotoBanco[]): Promise<FotoBanco> {
  const lista = candidatas
    .map((f) => `${f.id} | ${f.descripcion} | ${f.tags.join(', ')}`)
    .join('\n');
  const system =
    'Elegís la foto de portada para una nota del blog de SI INMOBILIARIA (Funes y Roldán, Gran Rosario). ' +
    'Solo podés elegir de la lista: son fotos reales y locales. Priorizá la que muestre el lugar o el tema concreto de la nota; ' +
    'si la nota es de un barrio, obra o ciudad puntual, elegí una foto de ese lugar. Respondé SOLO con JSON: {"id": "<id>"}.';
  const user = [
    `Título: ${datos.titulo}`,
    datos.bajada ? `Bajada: ${datos.bajada}` : '',
    datos.categoria ? `Categoría: ${datos.categoria}` : '',
    datos.imagen_sugerida ? `Foto sugerida por el redactor: ${datos.imagen_sugerida}` : '',
    '',
    'Fotos disponibles (id | qué se ve | tags):',
    lista,
  ]
    .filter(Boolean)
    .join('\n');
  try {
    const { texto } = await llamarClaude(system, user, 100, { model: MODEL_ELECTOR, temperature: 0 });
    const id = JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1))?.id;
    const elegida = candidatas.find((f) => f.id === id);
    if (elegida) return elegida;
  } catch (e) {
    console.warn('[elegir-portada] Claude no eligió, uso tags:', e);
  }
  return elegirPorTags(datos, candidatas);
}

async function bajarRecortada(foto: FotoBanco): Promise<{ webp: Buffer } | { error: string }> {
  try {
    const src = foto.src.startsWith('http') ? foto.src : `${BASE_URL}${foto.src}`;
    const res = await fetch(src);
    if (!res.ok) return { error: `no se pudo bajar ${foto.id} (HTTP ${res.status})` };
    const webp = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(OG_W, OG_H, { fit: 'cover', position: 'attention' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { webp };
  } catch {
    return { error: `no se pudo procesar la foto ${foto.id}` };
  }
}

async function revalidar(slug: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ slug }),
    });
  } catch {
    /* no crítico */
  }
}

/**
 * Asigna a la nota una portada real del banco. Con `fotoId` usa esa foto
 * (backfill curado a mano); sin él la elige Claude.
 */
export async function elegirPortadaReal(
  datos: DatosPortada,
  opciones: { fotoId?: string } = {},
): Promise<ResultadoPortada> {
  const redis = getRedis();
  let foto: FotoBanco | undefined;
  let candidatas: FotoBanco[] = [];
  if (opciones.fotoId) {
    foto = BANCO_FOTOS.find((f) => f.id === opciones.fotoId);
    if (!foto) return { ok: false, error: `foto ${opciones.fotoId} no está en el banco` };
  } else {
    const usadas = new Set((await redis.lrange<string>(USADAS_KEY, 0, VENTANA_USADAS - 1)) ?? []);
    const libres = BANCO_FOTOS.filter((f) => !usadas.has(f.id));
    candidatas = libres.length ? libres : BANCO_FOTOS;
    foto = await elegirConClaude(datos, candidatas);
  }

  // Si la elegida no baja (archivo que ya no está, error de red), se prueba
  // con la siguiente mejor por tags: una foto faltante no deja la nota sin
  // portada. Con fotoId (curada a mano) no se cambia por otra.
  let webp: Buffer | null = null;
  let error = '';
  const probadas = new Set<string>();
  while (foto && !webp && probadas.size < 3) {
    probadas.add(foto.id);
    const r = await bajarRecortada(foto);
    if ('webp' in r) webp = r.webp;
    else {
      error = r.error;
      console.warn(`[elegir-portada] ${r.error}`);
      const resto = candidatas.filter((f) => !probadas.has(f.id));
      foto = resto.length ? elegirPorTags(datos, resto) : undefined;
    }
  }
  if (!webp || !foto) return { ok: false, error: error || 'no hay foto disponible' };

  const blob = await put(`blog-overrides/${datos.slug}.webp`, webp, {
    access: 'public',
    contentType: 'image/webp',
    token: process.env.BLOG_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  });

  await redis.hset('blog:image_override', { [datos.slug]: blob.url });
  if (foto.credito) await redis.hset('blog:image_credit', { [datos.slug]: foto.credito });
  else await redis.hdel('blog:image_credit', datos.slug);
  await redis.lpush(USADAS_KEY, foto.id);
  await redis.ltrim(USADAS_KEY, 0, VENTANA_USADAS - 1);
  await revalidar(datos.slug);

  console.log(`[elegir-portada] ${datos.slug}: ${foto.id} → ${blob.url}`);
  return { ok: true, url: blob.url, fotoId: foto.id };
}
