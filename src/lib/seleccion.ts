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
  session: { agent: string; properties: { id: string; url: string }[] },
  reactions: Record<string, { liked?: boolean | null; wantVisit?: boolean }>
): string {
  const liked = session.properties
    .filter(p => reactions[p.id]?.liked === true)
    .map(p => parsePropertyLabel(p.url))
  const wantVisit = session.properties
    .filter(p => reactions[p.id]?.wantVisit)
    .map(p => parsePropertyLabel(p.url))

  let msg = `Hola ${session.agent}! Vi las propiedades.`
  if (liked.length) msg += `\nMe gustaron: ${liked.join(', ')}.`
  if (wantVisit.length) msg += `\nQuiero visitar: ${wantVisit.join(', ')}.`
  return msg
}
