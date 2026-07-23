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
