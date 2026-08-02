export function parsePropertyLabel(url: string): string {
  try {
    const u = new URL(url)
    const last = u.pathname.split('/').filter(Boolean).at(-1) || ''
    return last
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  } catch {
    return url.length > 50 ? url.slice(0, 47) + '...' : url
  }
}

export function getTimeLeft(expiresAt: string): { days: number; expired: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  return { days: Math.max(0, days), expired: days <= 0 }
}

export function buildWhatsAppMessage(
  session: {
    agentName?: string
    agent?: string
    properties: { id: string; url: string; snapshot?: { title?: string } }[]
  },
  reactions: Record<string, { liked?: boolean | null; wantVisit?: boolean }>
): string {
  const name = session.agentName || session.agent || 'SI INMOBILIARIA'
  // Para propiedades externas cargadas a mano preferimos el título del snapshot;
  // el slug de una URL de Zonaprop es ilegible.
  const label = (p: { url: string; snapshot?: { title?: string } }) =>
    p.snapshot?.title?.trim() || parsePropertyLabel(p.url)
  const liked = session.properties
    .filter(p => reactions[p.id]?.liked === true)
    .map(label)
  const wantVisit = session.properties
    .filter(p => reactions[p.id]?.wantVisit)
    .map(label)

  let msg = `Hola ${name}! Ya revisé las propiedades.`
  msg += `\nMe gustaron: ${liked.length ? liked.join(', ') : 'ninguna aún'}.`
  msg += `\nQuiero visitar: ${wantVisit.length ? wantVisit.join(', ') : 'a confirmar'}.`
  return msg
}
