'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, X, ArrowUpRight } from 'lucide-react'
import type { Video } from '@/lib/contenidos'
import styles from './contenidos.module.css'

export default function Player({ video, hero = false }: { video: Video; hero?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = previous }
  }, [open])
  const close = () => { dialog.current?.close(); setOpen(false); trigger.current?.focus() }
  return <>
    <button ref={trigger} onClick={() => setOpen(true)} className={hero ? styles.primary : styles.playButton} aria-label={`Reproducir: ${video.title}`}>
      <span className={hero ? undefined : styles.playGlyph}><Play size={hero ? 18 : 24} fill="currentColor" aria-hidden /></span>{hero && 'Ver charla'}
    </button>
    {open && <dialog ref={dialog} className={styles.dialog} aria-label={video.title} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className={styles.dialogBody}>
        <button autoFocus className={styles.close} onClick={close} aria-label="Cerrar video"><X aria-hidden /></button>
        <iframe className={video.vertical ? styles.verticalPlayer : styles.player} src={video.platform === 'Instagram' ? `https://www.instagram.com/p/${video.id.slice(3)}/embed/` : `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        <h2>{video.title}</h2>
        <a href={video.url} target="_blank" rel="noopener noreferrer">Ver en {video.platform} <ArrowUpRight size={16} aria-hidden /></a>
      </div>
    </dialog>}
  </>
}
