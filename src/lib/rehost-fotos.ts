// Re-hostea fotos de avisos externos (Argenprop / Zonaprop / colegas) en Vercel
// Blob para que la ficha neutra NO dependa del CDN del portal de origen.
//
// Por qué: Argenprop bloquea el hotlink (403 sin Referer) y cualquier portal
// puede borrar el aviso o cambiar de CDN; si eso pasa la ficha que el agente ya
// le mandó al cliente queda sin fotos. En Blob son nuestras para siempre.
//
// Tolerante a fallos: si una foto no se puede bajar/subir, devuelve la URL
// original (que a su vez se sirve por /api/image-proxy). Nunca tira.

import { put } from '@vercel/blob'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
const MAX_BYTES = 8 * 1024 * 1024
const CONCURRENCY = 5

// El store de BLOB_READ_WRITE_TOKEN es PRIVADO (put con access:'public' tira).
// Usamos el store público del blog (mismo que las portadas de notas), con
// prefijo propio `fichas-externas/`. Override opcional: FICHAS_BLOB_TOKEN.
function blobToken(): string | undefined {
  return process.env.FICHAS_BLOB_TOKEN || process.env.BLOG_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN
}

// Hosts que ya son "nuestros" o estables: no hace falta re-hostear.
const SAFE_HOST_RE =
  /(\.public\.blob\.vercel-storage\.com|\.supabase\.co|tokkobroker\.com|siinmobiliaria\.com|verficha\.casa)$/i

export function esFotoPropia(url: string): boolean {
  try {
    return SAFE_HOST_RE.test(new URL(url).hostname)
  } catch {
    return false
  }
}

export function necesitaRehost(fotos: string[]): boolean {
  return fotos.some(u => !esFotoPropia(u))
}

function extFromContentType(ct: string): string {
  if (/jpe?g/.test(ct)) return 'jpg'
  if (/png/.test(ct)) return 'png'
  if (/webp/.test(ct)) return 'webp'
  if (/avif/.test(ct)) return 'avif'
  if (/gif/.test(ct)) return 'gif'
  return 'jpg'
}

function refererFor(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname}/`
  } catch {
    return ''
  }
}

async function descargar(url: string): Promise<{ buf: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9',
        Referer: refererFor(url),
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })
    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim()
    if (!res.ok || !contentType.startsWith('image/')) return null
    const ab = await res.arrayBuffer()
    if (ab.byteLength === 0 || ab.byteLength > MAX_BYTES) return null
    return { buf: Buffer.from(ab), contentType }
  } catch {
    return null
  }
}

export interface RehostResult {
  fotos: string[]      // misma longitud y orden que la entrada
  subidas: number      // cuántas quedaron en Blob
  fallidas: string[]   // URLs originales que no se pudieron re-hostear
}

/**
 * Re-hostea en Blob las fotos que no son propias. Preserva el orden.
 * `prefix` es la carpeta en Blob (ej. `fichas-externas/2026-08`).
 */
export async function rehostFotos(fotos: string[], prefix: string): Promise<RehostResult> {
  const out = [...fotos]
  const fallidas: string[] = []
  let subidas = 0

  const token = blobToken()
  if (!token) {
    return { fotos: out, subidas: 0, fallidas: fotos.filter(u => !esFotoPropia(u)) }
  }

  const idx = fotos.map((u, i) => (esFotoPropia(u) ? -1 : i)).filter(i => i >= 0)
  let cursor = 0
  const worker = async () => {
    while (cursor < idx.length) {
      const i = idx[cursor++]
      const src = fotos[i]
      const dl = await descargar(src)
      if (!dl) {
        fallidas.push(src)
        continue
      }
      try {
        const ext = extFromContentType(dl.contentType)
        const blob = await put(`${prefix}/${String(i + 1).padStart(2, '0')}.${ext}`, dl.buf, {
          access: 'public',
          contentType: dl.contentType,
          addRandomSuffix: true,
          token,
        })
        out[i] = blob.url
        subidas++
      } catch {
        fallidas.push(src)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, idx.length) }, worker))

  return { fotos: out, subidas, fallidas }
}
