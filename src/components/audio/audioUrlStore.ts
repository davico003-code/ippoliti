// Store de módulo para resolver audioUrl por propertyId, con micro-batching.
//
// Algunas cards (la home "Nuestra selección") no traen el audioUrl enriquecido
// server-side. En vez de un fetch por card, cada play pide su URL vía
// `fetchAudioUrl(id)`, que acumula ids ~60ms y los resuelve en UN POST a
// /api/audio/urls. Resultado cacheado para el resto de la sesión.

const cache = new Map<number, string | null>()
let pending = new Set<number>()
const waiters = new Map<number, ((v: string | null) => void)[]>()
let timer: ReturnType<typeof setTimeout> | null = null

function flush() {
  timer = null
  const ids = Array.from(pending)
  pending = new Set()
  if (ids.length === 0) return

  fetch('/api/audio/urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
    credentials: 'same-origin',
  })
    .then((r) => (r.ok ? r.json() : { urls: {} }))
    .then((d: { urls?: Record<string, string | null> }) => {
      const urls = d.urls ?? {}
      for (const id of ids) {
        const val = urls[String(id)] ?? null
        cache.set(id, val)
        ;(waiters.get(id) ?? []).forEach((fn) => fn(val))
        waiters.delete(id)
      }
    })
    .catch(() => {
      for (const id of ids) {
        ;(waiters.get(id) ?? []).forEach((fn) => fn(null))
        waiters.delete(id)
      }
    })
}

/** audioUrl de una propiedad (batcheado + cacheado). null si no tiene audio. */
export function fetchAudioUrl(propertyId: number): Promise<string | null> {
  if (cache.has(propertyId)) return Promise.resolve(cache.get(propertyId)!)
  return new Promise((resolve) => {
    const arr = waiters.get(propertyId) ?? []
    arr.push(resolve)
    waiters.set(propertyId, arr)
    pending.add(propertyId)
    if (!timer) timer = setTimeout(flush, 60)
  })
}
