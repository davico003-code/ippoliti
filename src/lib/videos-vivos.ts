// Videos de YouTube que ya no existen (borrados o privados) siguen cargados en
// el CRM: la ficha mostraba "Recorrido en video" y al tocar play YouTube decía
// "Video no disponible". Se consultan por oEmbed (404/401/403 = no se puede
// ver) y se sacan antes de renderizar, así también desaparece la pestaña Video.
//
// Cacheado un día en el Data Cache (NUNCA no-store: dentro de una página ISR
// eso la pasa a dinámica y rompe el render). Ante timeout o error de red el
// video se conserva: mejor un video caído que esconder uno que anda.

import type { TokkoVideo } from '@/lib/tokko'

function youtubeId(v: TokkoVideo): string | null {
  if (v.provider?.toLowerCase() === 'youtube' && v.video_id) {
    return v.video_id.trim().match(/^([\w-]+)/)?.[1] ?? null
  }
  const url = v.player_url || v.url || ''
  const m =
    url.match(/youtube\.com\/embed\/([\w-]+)/) ||
    url.match(/shorts\/([\w-]+)/) ||
    url.match(/[?&]v=([\w-]+)/) ||
    url.match(/youtu\.be\/([\w-]+)/)
  return m?.[1] ?? null
}

async function youtubeVivo(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(2500) },
    )
    return ![401, 403, 404].includes(res.status)
  } catch {
    return true
  }
}

export async function sinVideosCaidos<T extends { videos?: TokkoVideo[] | null }>(property: T): Promise<T> {
  const videos = property.videos ?? []
  if (videos.length === 0) return property
  const vivos = await Promise.all(
    videos.map(async (v) => {
      const id = youtubeId(v)
      return !id || (await youtubeVivo(id))
    }),
  )
  if (vivos.every(Boolean)) return property
  return { ...property, videos: videos.filter((_, i) => vivos[i]) }
}
