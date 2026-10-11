import instagram from '@/data/contenidos/instagram.json'
import tiktok from '@/data/contenidos/tiktok.json'
import youtube from '@/data/contenidos/youtube.json'

export type Video = { id: string; title: string; category: string; platform: string; url: string; thumbnail: string; duration: string; vertical: boolean; author?: string; description?: string; uploadDate?: string | null; seconds?: number; mediaSrc?: string }
// La web guarda cada portada 31 días (minimumCacheTTL): al cambiar una miniatura
// en YouTube hay que subir esta fecha para que se vuelva a pedir.
const PORTADAS_YOUTUBE = '2026-10-10'
export const videos: Video[] = [...instagram, ...youtube.map(v => ({ ...v, thumbnail: `${v.thumbnail}?v=${PORTADAS_YOUTUBE}` })), ...tiktok]
export const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'charlas', label: 'Charlas que Sí' },
  { id: 'mundo-si', label: 'Mundo SI' },
  { id: 'recorridos', label: 'Recorridos' },
  { id: 'cortos', label: 'Videos cortos' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'blog', label: 'Blog' },
]
export const channels = [
  { name: 'YouTube', handle: '@mundosiinmobiliaria', href: 'https://www.youtube.com/@mundosiinmobiliaria', description: 'Charlas completas, recorridos y Mundo SI.' },
  { name: 'Instagram', handle: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si/', description: 'Propiedades, novedades y el día a día de SI.' },
  { name: 'Charlas que Sí', handle: '@charlasque.si', href: 'https://www.instagram.com/charlasque.si/', description: 'Las conversaciones también siguen acá.' },
  { name: 'David Flores', handle: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov/', description: 'Una mirada personal del mundo inmobiliario.' },
  { name: 'TikTok', handle: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria', description: 'Videos cortos para descubrir más.' },
  { name: 'Facebook', handle: 'SI INMOBILIARIA', href: 'https://www.facebook.com/inmobiliariaippoliti/', description: 'Novedades y comunidad.' },
]
export const categoryLabel = (id: string) => categories.find(c => c.id === id)?.label || 'Mundo SI'
// "Invitado: tema" se muestra en dos renglones (nombre y bajada) en las charlas.
export function titleParts(video: Video): [string, string?] {
  const cut = video.category === 'charlas' ? video.title.indexOf(': ') : -1
  if (cut < 0) return [video.title]
  const rest = video.title.slice(cut + 2)
  return [video.title.slice(0, cut), rest.charAt(0).toUpperCase() + rest.slice(1)]
}
export const normalized = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function filterVideos(category: string, query: string) {
  return videos.filter(v => (category === 'todos' || v.category === category) && normalized(`${v.title} ${categoryLabel(v.category)}`).includes(normalized(query)))
}
