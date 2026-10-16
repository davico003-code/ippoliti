import { getPropertyById } from '@/lib/tokko';
import { fotosFijasDe, RE_ARCHIVO_FOTO } from '@/lib/fotos-fijas';

/**
 * GET /fotos/<id>/<archivo> — foto de una ficha con URL FIJA (ver lib/fotos-fijas.ts).
 *
 * Busca la firma vigente de esa foto en el feed (getPropertyById: la misma
 * entrada del Data Cache que usa la ficha, no suma pedidos a Hilo) y manda los
 * bytes EN STREAM: hay fotos de hasta 17 MB y una respuesta armada en memoria
 * de más de 4,5 MB la corta Vercel.
 *
 * Caché: 30 días en el CDN. No es "inmutable" como los planos para que una
 * propiedad dada de baja deje de servir sus fotos. "No está" (propiedad fuera
 * del feed o foto que no es suya) = 404 con caché de 5 minutos. "Falló" (feed o
 * Supabase) = 502 sin caché: un error guardado como 404 dejaría a Facebook y
 * WhatsApp con la vista previa sin foto.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CACHE_FOTO = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400';

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
    const headers: Record<string, string> = {
      'Content-Type': tipo,
      'Cache-Control': CACHE_FOTO,
      'X-Content-Type-Options': 'nosniff',
    };
    const largo = res.headers.get('content-length');
    if (largo) headers['Content-Length'] = largo;
    return new Response(res.body, { status: 200, headers });
  } catch (e) {
    return fallo(id, archivo, e);
  }
}
