import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { categories, channels, videos, filterVideos, categoryLabel, normalized } from '@/lib/contenidos'
import { getAllPosts, readingMinutes } from '@/lib/blog'
import { resolveBlogImage } from '@/lib/blog-images'
import VideoCard from '@/components/contenidos/VideoCard'
import SocialIcon from '@/components/contenidos/SocialIcon'
import Player from '@/components/contenidos/Player'
import styles from '@/components/contenidos/contenidos.module.css'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Mundo SI · Videos, Charlas que Sí y blog | SI INMOBILIARIA',
  description: 'Dale play al mundo SI. Charlas que Sí, recorridos por Funes y Roldán, videos cortos y notas de SI INMOBILIARIA, en un solo lugar.',
  alternates: { canonical: 'https://siinmobiliaria.com/contenidos' },
  openGraph: { title: 'Dale play al mundo SI', description: 'Charlas, historias y lugares que queremos compartir.', url: 'https://siinmobiliaria.com/contenidos', images: ['/como-trabajamos/charla-colegas-rodaje.webp'] },
}

export default async function ContenidosPage({ searchParams }: { searchParams: { categoria?: string; q?: string; pagina?: string } }) {
  const category = categories.some(c => c.id === searchParams.categoria) ? searchParams.categoria! : 'todos'
  const query = (searchParams.q || '').trim().slice(0, 120)
  const requested = Math.max(1, Math.floor(Number(searchParams.pagina) || 1))
  const browsing = category !== 'todos' || !!query || !!searchParams.pagina
  const filtered = filterVideos(category, query)
  const allPosts = await getAllPosts()
  const posts = allPosts.filter(p => normalized(`${p.title} ${p.summary}`).includes(normalized(query)))
  const total = category === 'blog' ? posts.length : filtered.length
  const pages = Math.max(1, Math.ceil(total / 24))
  const page = Math.min(requested, pages)
  const results = filtered.slice((page - 1) * 24, page * 24)
  const featured = videos.find(v => v.id === 'XyITUD7dYNU')!
  const href = (cat: string, p = 1) => `/contenidos?${new URLSearchParams({ categoria: cat, ...(query ? { q: query } : {}), ...(p > 1 ? { pagina: String(p) } : {}) })}#explorar`
  const rail = (cat: string, title: string, limit = 3) => <section className={styles.section} aria-label={title}>
    <div className={styles.heading}><h2>{title}</h2><Link href={href(cat)}>Ver todos <ArrowRight size={16} aria-hidden /></Link></div>
    <div className={['cortos', 'tiktok'].includes(cat) ? styles.shortGrid : styles.grid}>{videos.filter(v => v.category === cat).slice(0, limit).map(v => <VideoCard video={v} key={v.id} />)}</div>
  </section>
  const showBlog = !browsing || category === 'blog' || (category === 'todos' && !!query)
  const displayedPosts = category === 'blog' ? posts.slice((page - 1) * 24, page * 24) : posts.slice(0, 2)
  return <div className={styles.root}>
    {!browsing && <section className={styles.hero}>
      <div className={`${styles.wrap} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Nuestra videoteca</p>
          <h1>Dale play<br />al <span>mundo SI.</span></h1>
          <p className={styles.intro}>Charlas, historias y lugares que queremos compartir. Todo lo que hacemos, en un solo lugar.</p>
          <div className={styles.heroSocials}>{channels.filter(c => ['YouTube', 'Instagram', 'TikTok'].includes(c.name)).map(c => <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer"><SocialIcon platform={c.name} />{c.name}<ArrowUpRight size={13} aria-hidden /></a>)}</div>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/como-trabajamos/charla-colegas-rodaje.webp" alt="Grabación de Charlas que Sí con colegas del sector inmobiliario" fill priority sizes="(max-width: 760px) 90vw, 650px" className={styles.heroPhoto} />
          <Image src="/contenidos/charlas-que-si.svg" alt="Charlas que Sí" width={172} height={58} className={styles.charlasLogo} />
          <div className={styles.feature}><p className={styles.heroLabel}>Una conversación que nos conecta</p><h2>Entre colegas,<br />distintas miradas.</h2>
            <div className={styles.actions}><Player video={featured} hero /><a className={styles.heroLink} href={featured.url} target="_blank" rel="noopener noreferrer">Ir a YouTube <ArrowUpRight size={16} aria-hidden /></a></div>
          </div>
        </div>
      </div>
    </section>}
    <div className={styles.wrap}>
      {browsing && <div className={styles.detail}><Link className={styles.quietLink} href="/contenidos">← Mundo SI</Link><h1>{query ? `Resultados para “${query}”` : category === 'todos' ? 'Todo para mirar' : categoryLabel(category)}</h1></div>}
      <div className={styles.toolbar} id="explorar">
        <nav className={styles.filters} aria-label="Tipos de contenido">{categories.map(c => <Link className={`${styles.filter} ${category === c.id ? styles.active : ''}`} href={c.id === 'todos' ? '/contenidos#explorar' : href(c.id)} aria-current={category === c.id ? 'page' : undefined} key={c.id}>{c.label}</Link>)}</nav>
        <form action="/contenidos" className={styles.search} role="search"><input type="hidden" name="categoria" value={category} /><label className="sr-only" htmlFor="buscar-contenidos">Buscar contenidos</label><input id="buscar-contenidos" name="q" type="search" placeholder="Buscar contenidos…" defaultValue={query} maxLength={120} /><button aria-label="Buscar"><Search size={18} aria-hidden /></button></form>
      </div>
      {!browsing ? <>
        {rail('charlas', 'Elegí tu próxima charla', 6)}
        {rail('mundo-si', 'Conocé el mundo SI')}
        {rail('cortos', 'Cortitos, todos los días', 4)}
        {rail('tiktok', 'También estamos en TikTok', 4)}
        {rail('recorridos', 'Una puerta abierta para recorrer')}
      </> : category !== 'blog' && <section className={styles.results} aria-label="Resultados de videos">
        <p className={styles.resultTitle}>{filtered.length} {filtered.length === 1 ? 'video' : 'videos'} para mirar</p>
        {results.length ? <div className={['cortos', 'tiktok'].includes(category) ? styles.shortGrid : styles.grid}>{results.map(v => <VideoCard video={v} key={v.id} />)}</div> : <div className={styles.empty}><h2>No encontramos videos con esa búsqueda.</h2><p>Probá con Funes, una persona o el nombre de un barrio.</p><Link className={styles.quietLink} href="/contenidos">Volver a todos los contenidos <ArrowRight size={16} aria-hidden /></Link></div>}
      </section>}
    </div>
    {showBlog && <section className={styles.blogBand}><div className={styles.wrap}>
      <div className={styles.heading}><h2>{category === 'blog' ? 'Historias para leer' : 'Una pausa para leer'}</h2><Link href="/blog">Ir al blog <ArrowRight size={16} aria-hidden /></Link></div>
      <div className={styles.blogGrid}>{displayedPosts.map(post => <article className={styles.blogCard} key={post.slug}>
        <Link href={`/blog/${post.slug}`} className={styles.blogImage} tabIndex={-1} aria-hidden><Image src={resolveBlogImage(post.slug, post.image, post.hasImageOverride)} alt="" fill sizes="(max-width: 640px) 30vw, 260px" className={styles.cover} /></Link>
        <div className={styles.blogText}><small>Blog · {readingMinutes(post.content)} min de lectura</small><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.summary.slice(0, 150)}{post.summary.length > 150 ? '…' : ''}</p><Link href={`/blog/${post.slug}`}>Leer nota <ArrowUpRight size={15} aria-hidden /></Link></div>
      </article>)}</div>
      {!displayedPosts.length && <p>No encontramos notas con esa búsqueda. <Link href="/blog">Explorá el blog completo.</Link></p>}
    </div></section>}
    {browsing && pages > 1 && <nav className={styles.pagination} aria-label="Páginas de contenidos">{page > 1 && <Link href={href(category, page - 1)}>← Anterior</Link>}<span>Página {page} de {pages}</span>{page < pages && <Link href={href(category, page + 1)}>Siguiente →</Link>}</nav>}
    <section className={`${styles.wrap} ${styles.channels}`}><Image src="/contenidos/si-inmobiliaria-color.svg" alt="SI INMOBILIARIA" width={216} height={30} className={styles.channelBrand} /><div className={styles.heading}><h2>Seguí la conversación</h2></div><div className={styles.channelsGrid}>{channels.map(c => <a className={styles.channel} href={c.href} key={c.handle + c.name} target="_blank" rel="noopener noreferrer"><strong><SocialIcon platform={c.name} size={23} />{c.name}<ArrowUpRight size={18} aria-hidden /></strong><span>{c.handle}</span><p>{c.description}</p></a>)}</div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Mundo SI — Contenidos de SI INMOBILIARIA', url: 'https://siinmobiliaria.com/contenidos', description: 'Charlas, recorridos, videos cortos y blog.', publisher: { '@id': 'https://siinmobiliaria.com/#organization' } }).replace(/</g, '\\u003c') }} />
  </div>
}
