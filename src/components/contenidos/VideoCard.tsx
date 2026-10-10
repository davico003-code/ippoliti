import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabel, type Video } from '@/lib/contenidos'
import SocialIcon from './SocialIcon'
import Player from './Player'
import styles from './contenidos.module.css'

export default function VideoCard({ video }: { video: Video }) {
  return <article className={styles.card}>
    <div className={`${styles.poster} ${video.vertical ? styles.vertical : ''}`}>
      <Image src={video.thumbnail} alt="" fill sizes={video.vertical ? '(max-width: 640px) 45vw, 260px' : '(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 400px'} className={styles.cover} />
      <Player video={video} />
      <span className={styles.platformBadge} aria-hidden><SocialIcon platform={video.platform} size={21} /></span>
      {video.duration && <span className={styles.duration}>{video.duration}</span>}
    </div>
    <p className={styles.meta}>{['Instagram', 'TikTok'].includes(video.platform) && video.author ? `@${video.author}` : categoryLabel(video.category)}</p>
    <h3><Link href={`/contenidos/${video.id}`}>{video.title}</Link></h3>
    <a className={styles.source} href={video.url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={video.platform} size={16} />{video.platform} <ArrowUpRight size={13} aria-hidden /><span className="sr-only">: {video.title}</span></a>
  </article>
}
