import { put } from '@vercel/blob';
import sharp from 'sharp';
import { Redis } from '@upstash/redis';

// Portada única por nota generada con la API de imágenes de OpenAI (el modelo
// de ChatGPT). Reemplaza la asignación por hash sobre el pool de 27 imágenes
// repetidas: cada nota sale con una imagen exclusiva de su tema, guardada como
// override en Redis (misma prioridad que la subida manual desde /admin/notas).
//
// Flujo: prompt desde imagen_sugerida/título → OpenAI → sharp 1200×630 WebP →
// Blob blog-overrides/ → blog:image_override → revalidate. Si falta la key o
// la API falla, devuelve el error sin romper nada: la nota conserva su imagen
// por defecto y se puede regenerar desde el panel.

const BASE_URL = 'https://siinmobiliaria.com';
const OPENAI_API = 'https://api.openai.com/v1/images/generations';
const TIMEOUT_MS = 120_000;

// Mismo formato que la subida manual: OG 1.91:1, WebP q80.
const OG_W = 1200;
const OG_H = 630;
const WEBP_QUALITY = 80;

// gpt-image-1 pide organización verificada en OpenAI; si la cuenta no lo está,
// se puede caer a dall-e-3 seteando OPENAI_IMAGE_MODEL sin tocar código.
const DEFAULT_MODEL = 'gpt-image-1';

export interface DatosPortada {
  slug: string;
  titulo: string;
  imagen_sugerida?: string;
  bajada?: string;
  categoria?: string;
}

export type ResultadoPortada =
  | { ok: true; url: string }
  | { ok: false; error: string };

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export function construirPromptPortada(datos: DatosPortada): string {
  const escena = datos.imagen_sugerida?.trim() || datos.bajada?.trim() || datos.titulo;
  return [
    'Fotografía editorial realista para la portada de una nota de un blog inmobiliario argentino (zona de Funes y Roldán, Gran Rosario).',
    `Tema de la nota: "${datos.titulo}".`,
    `Escena: ${escena}.`,
    'Estilo: foto profesional con luz natural, colores reales y composición horizontal amplia con aire para recorte apaisado. Si la escena es exterior, el contexto son barrios residenciales argentinos modernos: casas bajas, calles arboladas, cielos amplios de llanura.',
    'No incluir: texto, letras, números, logos, marcas de agua, carteles legibles ni rostros reconocibles en primer plano.',
  ].join(' ');
}

async function pedirImagenOpenAI(prompt: string): Promise<{ b64: string } | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: 'OPENAI_API_KEY no configurada' };

  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const esDalle = model.startsWith('dall-e');
  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
    // Horizontal: el crop posterior a 1200×630 recorta poco.
    size: esDalle ? '1792x1024' : '1536x1024',
  };
  if (esDalle) {
    body.response_format = 'b64_json';
  } else {
    body.quality = 'medium';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      let detalle = `HTTP ${res.status}`;
      try {
        const err = (await res.json()) as { error?: { message?: string } };
        if (err?.error?.message) detalle = `${detalle}: ${err.error.message}`;
      } catch {
        /* sin body legible */
      }
      return { error: `OpenAI ${detalle}` };
    }

    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return { error: 'OpenAI no devolvió imagen (b64_json vacío)' };
    return { b64 };
  } catch (err) {
    const msg = err instanceof Error && err.name === 'AbortError'
      ? `timeout a los ${TIMEOUT_MS / 1000}s`
      : err instanceof Error ? err.message : String(err);
    return { error: `error llamando a OpenAI: ${msg}` };
  } finally {
    clearTimeout(timer);
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

export async function generarImagenPortada(datos: DatosPortada): Promise<ResultadoPortada> {
  const prompt = construirPromptPortada(datos);
  const generada = await pedirImagenOpenAI(prompt);
  if ('error' in generada) {
    console.warn(`[generar-imagen] ${datos.slug}: ${generada.error}`);
    return { ok: false, error: generada.error };
  }

  let webp: Buffer;
  try {
    webp = await sharp(Buffer.from(generada.b64, 'base64'))
      .resize(OG_W, OG_H, { fit: 'cover', position: 'centre' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return { ok: false, error: 'no se pudo procesar la imagen generada' };
  }

  // Mismo destino y mecanismo que la subida manual desde /admin/notas:
  // addRandomSuffix invalida la CDN en cada regeneración y el override en
  // Redis apunta siempre a la última URL.
  const blob = await put(`blog-overrides/${datos.slug}.webp`, webp, {
    access: 'public',
    contentType: 'image/webp',
    token: process.env.BLOG_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  });

  await getRedis().hset('blog:image_override', { [datos.slug]: blob.url });
  await revalidar(datos.slug);

  console.log(`[generar-imagen] ${datos.slug}: portada generada → ${blob.url}`);
  return { ok: true, url: blob.url };
}
