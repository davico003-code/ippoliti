import instagram from '@/data/contenidos/instagram.json'
import tiktok from '@/data/contenidos/tiktok.json'
import youtube from '@/data/contenidos/youtube.json'

export type Video = { id: string; title: string; category: string; platform: string; url: string; thumbnail: string; duration: string; vertical: boolean; author?: string; description?: string; uploadDate?: string | null; seconds?: number; mediaSrc?: string }
// La web guarda cada portada 31 días (minimumCacheTTL): al cambiar una miniatura
// en YouTube hay que subir esta fecha para que se vuelva a pedir.
const PORTADAS_YOUTUBE = '2026-10-10'
export const videos: Video[] = [...instagram, ...youtube.map(v => ({ ...v, thumbnail: `${v.thumbnail}?v=${PORTADAS_YOUTUBE}` })), ...tiktok]
// La bajada de cada formato cuenta para qué lo hacemos: va debajo del título de
// su fila y arriba de la página de la categoría.
export const categories: { id: string; label: string; description?: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'charlas', label: 'Charlas que Sí', description: 'Charlas con colegas y profesionales del rubro, de los que aprendemos todos los días.' },
  { id: 'mundo-si', label: 'Mundo SI', description: 'Te mostramos la ciudad en la que trabajamos y nuestro día a día.' },
  { id: 'recorridos', label: 'Recorridos', description: 'Recorremos por dentro las propiedades que trabajamos, como si estuvieras ahí.' },
  { id: 'cortos', label: 'Videos cortos', description: 'Propiedades, obras y pedacitos de las charlas, en un minuto.' },
  { id: 'tiktok', label: 'TikTok', description: 'Las propiedades y el día a día, contados en TikTok.' },
  { id: 'blog', label: 'Blog', description: 'Notas para entender el mercado y decidir mejor.' },
]
export const channels = [
  { name: 'YouTube', handle: '@mundosiinmobiliaria', href: 'https://www.youtube.com/@mundosiinmobiliaria', description: 'Charlas completas, recorridos y Mundo SI.' },
  { name: 'Instagram', handle: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si/', description: 'Propiedades, novedades y el día a día de SI.' },
  { name: 'Charlas que Sí', handle: '@charlasque.si', href: 'https://www.instagram.com/charlasque.si/', description: 'Las conversaciones también siguen acá.' },
  { name: 'David Flores', handle: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov/', description: 'Una mirada personal del mundo inmobiliario.' },
  { name: 'TikTok', handle: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria', description: 'Videos cortos para descubrir más.' },
  { name: 'Facebook', handle: 'SI INMOBILIARIA', href: 'https://www.facebook.com/inmobiliariaippoliti/', description: 'Novedades y comunidad.' },
]
// Texto propio de la página de un video: su título y su descripción (más el
// resumen o la transcripción, cuando se carguen). El resto de la página se
// repite en todas (reproductor, "Seguí mirando"). Con menos de esto Google la
// descarta por floja: va noindex y fuera del sitemap hasta que se enriquezca.
export const PALABRAS_PARA_INDEXAR = 300
export const palabrasPropias = (v: Video) => `${v.title} ${v.description ?? ''}`.split(/\s+/).filter(Boolean).length
export const esIndexable = (v: Video) => palabrasPropias(v) >= PALABRAS_PARA_INDEXAR
export const categoryLabel = (id: string) => categories.find(c => c.id === id)?.label || 'Mundo SI'
export const categoryDescription = (id: string) => categories.find(c => c.id === id)?.description
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
