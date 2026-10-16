import { getPropertyById } from '@/lib/tokko';
import { fotosFijasDe, RE_ARCHIVO_FOTO } from '@/lib/fotos-fijas';

/**
 * GET /fotos/<id>/<archivo> — foto de una ficha con URL FIJA (ver lib/fotos-fijas.ts).
 *
 * Busca la firma vigente de esa foto en el feed (getPropertyById: la misma
 * entrada del Data Cache que usa la ficha, no suma pedidos a Hilo) y manda los
 * bytes EN STREAM (una respuesta armada en memoria de más de 4,5 MB la corta
 * Vercel). Las de más de 9 MB (crudas de drone de hasta 17 MB) van con 307 a la
 * firmada: el CDN no las guarda (ver MAX_CACHEABLE).
 *
 * Caché: 30 días en el CDN. No es "inmutable" como los planos: cuando la
 * propiedad se da de baja, sus fotos se siguen sirviendo desde el CDN hasta que
 * vence esa copia (≤ 30 días, o antes si un deploy la limpia) y después dan
 * 404. Son fotos que ya fueron públicas. "No está" (propiedad fuera
 * del feed o foto que no es suya) = 404 con caché de 5 minutos. "Falló" (feed o
 * Supabase) = 502 sin caché: un error guardado como 404 dejaría a Facebook y
 * WhatsApp con la vista previa sin foto.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CACHE_FOTO = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400';
// El CDN de Vercel no guarda respuestas de funciones de más de 10 MB (medido en
// el preview el 16-oct: 5,6 MB → HIT; 14,6 y 17 MB → MISS siempre, con o sin
// Content-Length). Por encima de esto la foto va con 307 a la firmada, como
// hasta hoy: servirla desde acá costaría una pasada por la función en cada vista.
const MAX_CACHEABLE = 9_000_000;
// La firma vigente dura >= 45 días: un día de caché del 307 nunca apunta a una vencida.
const CACHE_REDIRECCION = 'public, max-age=3600, s-maxage=86400';

function noEsta(): Response {
  return new Response('not found', {
    status: 404,
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}

function fallo(id: string, archivo: string, motivo: unknown): Response {
  console.error(`[fotos] ${id}/${archivo}:`, motivo instanceof Error ? motivo.message : motivo);
  return new Response('upstream error', { status: 502, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string; archivo: string } },
): Promise<Response> {
  const { id } = params;
  let archivo: string;
  try {
    archivo = decodeURIComponent(params.archivo);
  } catch {
    return noEsta();
  }
  if (!/^\d{1,12}$/.test(id) || !RE_ARCHIVO_FOTO.test(archivo)) return noEsta();

  let firmada: string | undefined;
  try {
    firmada = fotosFijasDe(await getPropertyById(Number(id))).get(archivo);
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) return noEsta();
    return fallo(id, archivo, e);
  }
  if (!firmada) return noEsta();

  try {
    const res = await fetch(firmada, { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    const tipo = res.headers.get('content-type') ?? '';
    if (!res.ok || !res.body || !tipo.startsWith('image/')) {
      return fallo(id, archivo, `Supabase ${res.status} ${tipo}`);
    }
    const largo = res.headers.get('content-length');
    if (Number(largo) > MAX_CACHEABLE) {
      await res.body.cancel().catch(() => {});
      return new Response(null, {
        status: 307,
        headers: { Location: firmada, 'Cache-Control': CACHE_REDIRECCION },
      });
    }
    const headers: Record<string, string> = {
      'Content-Type': tipo,
      'Cache-Control': CACHE_FOTO,
      'X-Content-Type-Options': 'nosniff',
    };
    if (largo) headers['Content-Length'] = largo;
    return new Response(res.body, { status: 200, headers });
  } catch (e) {
    return fallo(id, archivo, e);
  }
}
