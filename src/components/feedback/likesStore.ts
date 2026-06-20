// Store de módulo para el estado "liked" del visitante, con micro-batching.
//
// En el listado hay ~237 cards; si cada LikeHeart hiciera su propio fetch de
// estado serían cientos de requests. En cambio, cada card pide su estado vía
// `fetchLiked(id)`, que acumula ids durante ~60ms y los resuelve en UN solo
// POST a /api/feedback/estado. El resultado se cachea en memoria para el resto
// de la sesión (navegación client-side). Encapsulado acá: no toca el listado.

const cache = new Map<string, boolean>()
let pending = new Set<string>()
const waiters = new Map<string, ((v: boolean) => void)[]>()
let timer: ReturnType<typeof setTimeout> | null = null

function flush() {
  timer = null
  const ids = Array.from(pending)
  pending = new Set()
  if (ids.length === 0) return

  fetch('/api/feedback/estado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyIds: ids }),
    credentials: 'same-origin',
  })
    .then((r) => (r.ok ? r.json() : { liked: [] }))
    .then((d: { liked?: unknown }) => {
      const likedSet = new Set((Array.isArray(d.liked) ? d.liked : []).map(String))
      for (const id of ids) {
        const val = likedSet.has(id)
        cache.set(id, val)
        ;(waiters.get(id) ?? []).forEach((fn) => fn(val))
        waiters.delete(id)
      }
    })
    .catch(() => {
      for (const id of ids) {
        ;(waiters.get(id) ?? []).forEach((fn) => fn(false))
        waiters.delete(id)
      }
    })
}

/** Estado liked del visitante para una propiedad (batcheado + cacheado). */
export function fetchLiked(propertyId: string): Promise<boolean> {
  if (cache.has(propertyId)) return Promise.resolve(cache.get(propertyId)!)
  return new Promise((resolve) => {
    const arr = waiters.get(propertyId) ?? []
    arr.push(resolve)
    waiters.set(propertyId, arr)
    pending.add(propertyId)
    if (!timer) timer = setTimeout(flush, 60)
  })
}

/** Actualiza el cache tras un toggle, para que otras instancias lo reflejen. */
export function setLikedCache(propertyId: string, v: boolean): void {
  cache.set(propertyId, v)
}
