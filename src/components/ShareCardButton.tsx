'use client'

// Botón "Compartir" de las tarjetas del listado /emprendimientos.
//
// 25-oct-2026 (política de compartir del sitio):
//   · Celu: el toque abre la hoja nativa DIRECTO (un toque, sin menú).
//   · Compu (o sin hoja nativa): menú chico con Copiar link y WhatsApp.
//   · Link siempre con el dominio de producción y utm (antes salía el origin
//     del navegador: desde un preview se compartía un link de Vercel).
//   · "¡Copiado!" solo si copió de verdad: antes lo decía aunque el
//     portapapeles se negara (navegador de Instagram/Facebook).

import { useState, useRef, useEffect } from 'react'
import { Share2, Link2, MessageCircle, Check } from 'lucide-react'

import {
  abrirWhatsApp,
  compartirNativo,
  copiarLink,
  lineaDatos,
  puedeCompartirNativo,
  registrarCompartir,
  urlCompartible,
  type ContextoCompartir,
} from '@/lib/compartir'
import { haptico } from '@/lib/haptico'
import { showToast } from './Toast'

interface Props {
  slug: string
  title: string
  price?: string
  path?: string
  /** "Aldea Fisherton, Rosario": va en el texto que se comparte. */
  ubicacion?: string
}

export default function ShareCardButton({ slug, title, price, path, ubicacion }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      // haptico() en el iPhone hace un click sintético sobre un interruptor
      // escondido en <body>: sin este filtro, ese click "de afuera" cerraba el
      // menú en el acto y nunca se veía el "¡Copiado!".
      if (!e.isTrusted) return
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handler, true)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('click', handler, true)
      document.removeEventListener('keydown', tecla)
    }
  }, [open])

  const pathname = path || `/propiedades/${slug}`
  const contexto: ContextoCompartir = pathname.startsWith('/emprendimientos') ? 'emprendimiento' : 'tarjeta'
  const linea = lineaDatos({ precio: price, ubicacion })

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!open && puedeCompartirNativo()) {
      // Sincrónico: navigator.share es lo primero que corre en el toque.
      haptico()
      void compartirNativo({
        title,
        text: [title, linea].filter(Boolean).join('\n'),
        url: urlCompartible(pathname, 'nativo', contexto),
      }).then(r => {
        if (r === 'ok') registrarCompartir('nativo', contexto)
        else if (r === 'error') setOpen(true) // la hoja falló: el menú de siempre
      })
      return
    }
    setOpen(o => !o)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = urlCompartible(pathname, 'copiar', contexto)
    void copiarLink(url).then(ok => {
      if (!ok) {
        showToast(`No se pudo copiar. Copialo a mano: ${url}`, { variant: 'error', duration: 8000 })
        setOpen(false)
        return
      }
      haptico()
      registrarCompartir('copiar', contexto)
      setCopied(true)
      showToast('Link copiado')
      window.setTimeout(() => { setCopied(false); setOpen(false) }, 1200)
    })
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = urlCompartible(pathname, 'whatsapp', contexto)
    abrirWhatsApp([`*${title}*`, linea, url].filter(Boolean).join('\n'))
    haptico()
    registrarCompartir('whatsapp', contexto)
    setOpen(false)
  }

  const item =
    'w-full flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-lg text-sm text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-50 active:bg-[var(--theme-border,#F3F4F6)]'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="si-tap relative w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 flex items-center justify-center hover:bg-[var(--theme-surface,#fff)] before:absolute before:-inset-1 before:content-['']"
        aria-label="Compartir"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Compartir"
      >
        <Share2 className="w-4 h-4 text-gray-500" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 min-w-[190px] z-50 origin-bottom-right motion-safe:animate-[si-pop-cmp_160ms_cubic-bezier(.22,1,.36,1)]"
        >
          {/* Keyframes locales (globals.css no es de este componente). */}
          <style dangerouslySetInnerHTML={{ __html: '@keyframes si-pop-cmp{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}' }} />
          <button type="button" role="menuitem" onClick={handleCopy} className={item}>
            {copied ? <Check className="w-4 h-4 text-[color:var(--theme-accent,#1A5C38)]" aria-hidden /> : <Link2 className="w-4 h-4 text-gray-400" aria-hidden />}
            <span aria-live="polite">{copied ? '¡Copiado!' : 'Copiar link'}</span>
          </button>
          <button type="button" role="menuitem" onClick={handleWhatsApp} className={item}>
            <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden />
            Enviar por WhatsApp
          </button>
        </div>
      )}
    </div>
  )
}
