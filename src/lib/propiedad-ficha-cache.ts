// Fallback resiliente para la ficha de propiedad (/propiedades/[slug]).
//
// Problema: getPropertyById() lanza excepción cuando Tokko devuelve 403/5xx
// bajo carga de crawl tras agotar los reintentos. En la ficha eso terminaba
// en un 500 a Googlebot para una propiedad que SÍ existe → la saca del índice.
//
// Solución: en cada render exitoso guardamos un snapshot de la propiedad en
// Upstash (mismo cliente que el resto del sitio). Si un fetch posterior falla
// transitoriamente, servimos el último-bueno (200 stale) en vez de 500. El
// 404 queda reservado exclusivamente al 404 real de Tokko (propiedad borrada):
// en ese caso NO servimos stale y dejamos que la ficha haga notFound().
//
// Alcance: SOLO la ficha. getPropertyById() queda intacto para el resto de los
// callers (listados, etc.). Cuando Tokko responde bien el comportamiento es
// idéntico al actual, sumando únicamente la escritura del snapshot (guarded:
// un fallo de Redis nunca rompe un render bueno).

import { redis } from '@/lib/redis';
import { getPropertyById, type TokkoProperty } from '@/lib/tokko';

// 14 días: se refresca en cada render exitoso (con ISR de 6h casi siempre está
// fresco). El snapshot solo importa durante una caída sostenida de Tokko, donde
// servir datos de hasta 14 días es preferible a desindexar la ficha.
const SNAPSHOT_TTL_SECONDS = 14 * 24 * 60 * 60;

const snapshotKey = (id: number) => `ficha:prop:${id}`;

function isNotFound(err: unknown): boolean {
  return err instanceof Error && err.message.includes('not found');
}

async function readSnapshot(id: number): Promise<TokkoProperty | null> {
  try {
    const raw = await redis.get<string>(snapshotKey(id));
    if (!raw) return null;
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as TokkoProperty;
  } catch {
    // Redis caído / parseo inválido: tratamos como cache miss.
    return null;
  }
}

async function writeSnapshot(id: number, property: TokkoProperty): Promise<void> {
  try {
    await redis.set(snapshotKey(id), JSON.stringify(property), { ex: SNAPSHOT_TTL_SECONDS });
  } catch {
    // Nunca dejar que un fallo de escritura rompa un render que ya tiene datos.
  }
}

/**
 * Igual que getPropertyById() pero resiliente a fallos transitorios de Tokko:
 *  - éxito          → devuelve la propiedad y refresca el snapshot en Upstash.
 *  - 404 real       → rethrow ("...not found") → la ficha hace notFound() (404).
 *  - fallo transitorio (403/5xx/red) con snapshot previo → devuelve el snapshot
 *    stale (la ficha responde 200 con último-bueno, nunca 404/noindex).
 *  - fallo transitorio sin snapshot (cold + Tokko caído) → rethrow → 500
 *    (Google reintenta los 5xx; no desindexa).
 */
export async function getPropertyByIdResilient(id: number): Promise<TokkoProperty> {
  try {
    const property = await getPropertyById(id);
    await writeSnapshot(id, property);
    return property;
  } catch (err) {
    // Propiedad realmente inexistente: no servimos stale, propagamos el 404.
    if (isNotFound(err)) throw err;

    // Fallo transitorio: intentamos el último-bueno.
    const stale = await readSnapshot(id);
    if (stale) return stale;

    // Cold + Tokko caído: no hay nada que servir. Propagamos → 500.
    throw err;
  }
}
