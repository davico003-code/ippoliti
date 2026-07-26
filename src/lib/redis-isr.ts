// Lecturas de Redis seguras para páginas ISR/SSG.
//
// El cliente @upstash/redis hace sus fetch con cache:'no-store'. Dentro del
// render estático de una página ISR (p. ej. /blog/[slug] con revalidate) eso
// dispara DYNAMIC_SERVER_USAGE y el render entero termina en 500 — atrapar el
// error con try/catch NO alcanza, porque Next ya marcó el render como dinámico
// (así se rompían los slugs desconocidos del blog: 500 en vez de 404).
//
// Este helper habla directo con la REST API de Upstash vía fetch cacheable
// (next.revalidate): el dato entra a la Data Cache de Next, se refresca solo
// cada `revalidate` segundos y es 100% compatible con ISR.

const REST_URL = process.env.KV_REST_API_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN

// El cliente @upstash/redis serializa valores con JSON.stringify al escribir;
// al leer crudo por REST un string puede venir como '"valor"'. Intentamos
// des-serializar y caemos al crudo si no es JSON.
function deserialize(raw: string): string {
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'string' ? parsed : raw
  } catch {
    return raw
  }
}

// GET cacheable. Devuelve null ante cualquier problema (fail-open lectura).
export async function getCached(key: string, revalidate = 3600): Promise<string | null> {
  if (!REST_URL || !REST_TOKEN) return null
  try {
    const res = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
      next: { revalidate },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result?: string | null }
    return typeof data.result === 'string' ? data.result : null
  } catch {
    return null
  }
}

// MGET cacheable. Devuelve un array del mismo largo que `keys` (null donde no
// haya valor) y todo-null ante cualquier problema (fail-open lectura).
export async function mgetCached(keys: string[], revalidate = 300): Promise<(string | null)[]> {
  if (!REST_URL || !REST_TOKEN || keys.length === 0) return keys.map(() => null)
  try {
    // La REST API acepta el comando como array en el body: ["MGET", k1, k2, ...]
    const res = await fetch(REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['MGET', ...keys]),
      next: { revalidate },
    })
    if (!res.ok) return keys.map(() => null)
    const data = (await res.json()) as { result?: (string | null)[] | null }
    const arr = Array.isArray(data.result) ? data.result : []
    return keys.map((_, i) => {
      const v = arr[i]
      return typeof v === 'string' ? deserialize(v) : null
    })
  } catch {
    return keys.map(() => null)
  }
}

// HGETALL cacheable. Devuelve {} ante cualquier problema (fail-open lectura).
export async function hgetallCached(
  key: string,
  revalidate = 60,
): Promise<Record<string, string>> {
  if (!REST_URL || !REST_TOKEN) return {}
  try {
    const res = await fetch(`${REST_URL}/hgetall/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
      next: { revalidate },
    })
    if (!res.ok) return {}
    // Upstash REST devuelve HGETALL como array plano [campo, valor, ...]
    const data = (await res.json()) as { result?: (string | null)[] | null }
    const flat = Array.isArray(data.result) ? data.result : []
    const out: Record<string, string> = {}
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const field = flat[i]
      const value = flat[i + 1]
      if (typeof field === 'string' && typeof value === 'string') {
        out[deserialize(field)] = deserialize(value)
      }
    }
    return out
  } catch {
    return {}
  }
}
