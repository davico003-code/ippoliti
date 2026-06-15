import { Redis } from '@upstash/redis';

// Feed de actividad del pipeline del blog autónomo. Reemplaza las
// notificaciones de WhatsApp: cada publicación, fallback a evergreen o error
// deja una entrada que David ve en /admin/notas. No es tiempo real — alcanza
// con que esté al entrar al panel.
//
// Clave Redis: blog:actividad (lista, LPUSH = más nuevo primero, tope 50).
// TTL 90 días: si el pipeline queda inactivo, el feed se limpia solo.

const KEY = 'blog:actividad';
const MAX_ENTRADAS = 50;
const TTL_SEGUNDOS = 60 * 60 * 24 * 90;

export type TipoActividad = 'publicada' | 'evergreen' | 'error' | 'info';

export interface EntradaActividad {
  tipo: TipoActividad;
  mensaje: string;
  titulo?: string;
  url?: string;
  ts: string; // ISO
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// Registra una entrada. Nunca lanza: el feed es observabilidad, no debe
// tumbar la publicación si Redis falla (solo loguea).
export async function registrarActividad(
  entrada: Omit<EntradaActividad, 'ts'>,
): Promise<void> {
  const item: EntradaActividad = { ...entrada, ts: new Date().toISOString() };
  // Log siempre (grepeable en Vercel aunque Redis falle)
  console.log(`[blog-actividad] ${item.tipo}: ${item.mensaje}`);
  try {
    const redis = getRedis();
    await redis.lpush(KEY, JSON.stringify(item));
    await redis.ltrim(KEY, 0, MAX_ENTRADAS - 1);
    await redis.expire(KEY, TTL_SEGUNDOS);
  } catch (e) {
    console.error('[blog-actividad] no se pudo escribir en Redis:', e);
  }
}

export async function leerActividad(): Promise<EntradaActividad[]> {
  try {
    const redis = getRedis();
    const raw = await redis.lrange<string | EntradaActividad>(KEY, 0, MAX_ENTRADAS - 1);
    return raw
      .map((r) => {
        try {
          return (typeof r === 'string' ? JSON.parse(r) : r) as EntradaActividad;
        } catch {
          return null;
        }
      })
      .filter((e): e is EntradaActividad => e !== null);
  } catch (e) {
    console.error('[blog-actividad] no se pudo leer de Redis:', e);
    return [];
  }
}
