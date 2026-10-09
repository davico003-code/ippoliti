import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { videos, categoryLabel } from '@/lib/contenidos'
import Player from '@/components/contenidos/Player'
import VideoCard from '@/components/contenidos/VideoCard'
import styles from '@/components/contenidos/contenidos.module.css'

export function generateStaticParams() { return videos.map(v => ({ id: v.id })) }
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const video = videos.find(v => v.id === params.id)
  if (!video) return { title: 'Contenido no encontrado' }
  return { title: `${video.title} | SI INMOBILIARIA`, description: `${categoryLabel(video.category)}: ${video.title}. Mirá el video en Mundo SI y descubrí más contenido de SI INMOBILIARIA.`, alternates: { canonical: `https://siinmobiliaria.com/contenidos/${video.id}` }, openGraph: { title: video.title, images: [video.thumbnail], url: `https://siinmobiliaria.com/contenidos/${video.id}` } }
}
export default function VideoPage({ params }: { params: { id: string } }) {
  const video = videos.find(v => v.id === params.id)
  if (!video) notFound()
  const related = videos.filter(v => v.category === video.category && v.id !== video.id).slice(0, 3)
  return <div className={styles.root}><div className={`${styles.wrap} ${styles.detail}`}>
    <Link href="/contenidos" className={styles.quietLink}>← Volver a Mundo SI</Link>
    <p className={styles.eyebrow}>{categoryLabel(video.category)}</p><h1>{video.title}</h1>
    <div className={styles.detailPoster}><Image src={video.thumbnail} alt="" fill priority sizes="(max-width: 1100px) 100vw, 1050px" className={styles.cover} /><Player video={video} /></div>
    <a className={styles.quietLink} href={video.url} target="_blank" rel="noopener noreferrer">Ver publicación original en {video.platform} <ArrowUpRight size={17} aria-hidden /></a>
    {video.platform === 'YouTube' && video.description && <p className={styles.note}>{video.description}</p>}
    {video.uploadDate && <p className={styles.meta}>Publicado el {new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'America/Argentina/Cordoba' }).format(new Date(video.uploadDate))}</p>}
    <p className={styles.note}>{video.category === 'charlas' ? 'Charlas que Sí reúne conversaciones con protagonistas, colegas y referentes de nuestra comunidad. Un espacio para escuchar distintas miradas y conocer las historias detrás de cada proyecto.' : video.category === 'recorridos' ? 'Un recorrido de SI INMOBILIARIA para conocer los espacios y su entorno. El video forma parte de nuestro archivo: consultanos por la disponibilidad actual de la propiedad.' : 'Una mirada de cerca a los lugares, las personas y el día a día de SI INMOBILIARIA.'}</p>
    <section className={styles.section}><div className={styles.heading}><h2>Seguí mirando</h2><Link href={`/contenidos?categoria=${video.category}`}>Ver todos →</Link></div><div className={styles.grid}>{related.map(v => <VideoCard video={v} key={v.id} />)}</div></section>
    {video.platform === 'YouTube' && video.uploadDate && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'VideoObject', name: video.title, description: video.description || video.title, thumbnailUrl: video.thumbnail, uploadDate: video.uploadDate, ...(video.seconds ? { duration: `PT${video.seconds}S` } : {}), embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`, url: `https://siinmobiliaria.com/contenidos/${video.id}`, publisher: { '@id': 'https://siinmobiliaria.com/#organization' } }).replace(/</g, '\\u003c') }} />}
  </div></div>
}
