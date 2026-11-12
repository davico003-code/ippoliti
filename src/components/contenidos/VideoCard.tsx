import Link from 'next/link'
import Image from '@/components/Imagen'
import { ArrowUpRight, Play } from 'lucide-react'
import { categoryLabel, titleParts, type Video } from '@/lib/contenidos'
import SocialIcon from './SocialIcon'
import Player from './Player'
import styles from './contenidos.module.css'

export default function VideoCard({ video, kicker = false }: { video: Video; kicker?: boolean }) {
  const [title, subtitle] = titleParts(video)
  const social = ['Instagram', 'TikTok'].includes(video.platform) && !!video.author
  return <article className={styles.card}>
    <div className={`${styles.poster} ${video.vertical ? styles.vertical : ''}`}>
      <Image src={video.thumbnail} alt="" fill sizes={video.vertical ? '(max-width: 640px) 45vw, 260px' : '(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 400px'} className={styles.cover} />
      <Player video={video} />
      {/* Las portadas 16:9 traen pastilla, logo y título propios: nada se les superpone. El sello de la red va solo en las verticales. */}
      {video.vertical && <span className={styles.platformBadge} aria-hidden><SocialIcon platform={video.platform} size={21} /></span>}
    </div>
    {(social || kicker) && <p className={styles.meta}>{social ? `@${video.author}` : categoryLabel(video.category)}</p>}
    <h3><Link href={`/contenidos/${video.id}`}>{title}</Link></h3>
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    <div className={styles.cardFoot}>
      <a className={styles.source} href={video.url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={video.platform} size={16} />{video.platform} <ArrowUpRight size={13} aria-hidden /><span className="sr-only">: {video.title}</span></a>
      {video.duration && <span className={styles.duration}><Play size={10} fill="currentColor" aria-hidden /><span className="sr-only">Duración </span>{video.duration}</span>}
    </div>
  </article>
}
