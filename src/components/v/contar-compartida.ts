// Suma un "reenvío" a la ficha (toque en Copiar link / WhatsApp). sendBeacon
// sobrevive a que WhatsApp se abra y la pestaña pase a segundo plano. Nunca
// bloquea ni rompe el compartir.
export function contarCompartida(slug: string | undefined): void {
  if (!slug) return
  try {
    const body = JSON.stringify({ slug })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.('/api/colega/compartida', body)) return
    void fetch('/api/colega/compartida', { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    /* ignore */
  }
}
