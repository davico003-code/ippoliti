const SEEN_KEY = 'si_seen_property_ids'
const MAX_SEEN = 120

export function readSeenPropertyIds(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = JSON.parse(window.localStorage.getItem(SEEN_KEY) || '[]')
    if (!Array.isArray(raw)) return new Set()
    return new Set(raw.map(Number).filter((id) => Number.isFinite(id) && id > 0))
  } catch {
    return new Set()
  }
}

export function rememberSeenProperty(id: number): void {
  if (typeof window === 'undefined' || !Number.isFinite(id) || id <= 0) return
  try {
    const current = Array.from(readSeenPropertyIds())
    const next = [id, ...current.filter((candidate) => candidate !== id)].slice(0, MAX_SEEN)
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(next))
  } catch {
    // Safari privado y algunos webviews pueden bloquear localStorage.
  }
}
