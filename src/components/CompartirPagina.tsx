'use client'

// Botón "Compartir" para páginas de contenido (notas del blog, fichas de
// barrio). Son las que más se reenvían en los grupos de WhatsApp de familias y
// barrios, y antes había que copiar la URL a mano.
//
// Un solo toque: en el celu abre la hoja nativa (WhatsApp, Instagram, Mensajes);
// en la compu copia el link y lo confirma ahí mismo. Toda la lógica (utm,
// dominio de producción, regla de iOS de no llamar share después de un await)
// vive en lib/compartir.ts: acá solo el botón y su feedback.
//
// Es client, pero chiquito: las páginas que lo usan siguen siendo ISR/estáticas.

import { useEffect, useRef, useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { compartirPagina, urlCompartible, type ContextoCompartir } from '@/lib/compartir'

type Variante = 'claro' | 'sobreFoto'

export default function CompartirPagina({
  titulo,
  texto,
  ruta,
  contexto,
  variante = 'claro',
  etiqueta = 'Compartir',
  className = '',
}: {
  titulo: string
  /** Lo que acompaña al link en la hoja nativa (por defecto, el título). */
  texto?: string
  /** Ruta del sitio ('/blog/…') o URL completa. */
  ruta: string
  contexto: ContextoCompartir
  /** 'sobreFoto' para heros oscuros (vidrio blanco); 'claro' sobre fondo blanco. */
  variante?: Variante
  etiqueta?: string
  className?: string
}) {
  const [copiado, setCopiado] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])

  function tocar() {
    // Sincrónico hasta navigator.share / el portapapeles: compartirPagina los
    // llama en el acto (iOS pierde el gesto si hay un await antes).
    void compartirPagina({ titulo, texto, ruta }, contexto).then((r) => {
      if (r === 'copiado') {
        setCopiado(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopiado(false), 2200)
      } else if (r === 'error') {
        // Sin portapapeles (webviews, permisos): el link a la vista para copiarlo a mano.
        showToast(`No se pudo copiar. Link: ${urlCompartible(ruta, 'copiar', contexto)}`, { variant: 'error', duration: 8000 })
      }
      // 'nativo' y 'cancelado': la hoja nativa ya fue el feedback; no se muestra nada.
    })
  }

  const estilo =
    variante === 'sobreFoto'
      ? 'border-white/35 bg-white/15 text-white backdrop-blur-md hover:bg-white/25'
      : 'border-[color:var(--line)] bg-[color:var(--card-surface)] text-[color:var(--foreground)] hover:border-[color:var(--brand)]'

  return (
    <button
      type="button"
      onClick={tocar}
      aria-label={copiado ? 'Link copiado' : `${etiqueta}: ${titulo}`}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${estilo} ${className}`}
      style={{ fontFamily: "var(--font-raleway, 'Raleway'), system-ui, sans-serif" }}
    >
      {copiado ? (
        <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden />
      )}
      <span aria-live="polite">{copiado ? 'Link copiado' : etiqueta}</span>
    </button>
  )
}
