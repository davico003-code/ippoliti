'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDescription, quitarTitularInicial, type FormattedBlock } from '@/lib/formatDescription'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"
// Texto de lectura oscuro y en 500: Raleway 400 en gris se veía finito y cansaba
// a los mayores (David 3-oct: "tendría que ser más legible, un poco más gruesa").
const TEXTO = '#1F2937'
// Escala de grosores: texto 500 · etiquetas ("Cocina:", "Superficie:", subtítulos)
// 600 · títulos 700. Las etiquetas en 700 competían con los títulos y la
// descripción quedaba salpicada de negro.

// Tamaños en em: el contenedor manda (17 px en el celular, 18 px en desktop) y
// todo escala junto.
const esMayusculas = (s: string) => {
  const letras = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  return letras.length >= 3 && letras === letras.toLocaleUpperCase('es-AR')
}

// "Cocina: mesada a definir, pileta de acero…" → la etiqueta en negrita, para
// que una lista de ítems largos se pueda escanear.
function itemConEtiqueta(item: string): { key: string; rest: string } | null {
  const m = item.match(/^([^:]{2,32}):\s+(.+)$/)
  if (!m || m[1].trim().split(/\s+/).length > 4) return null
  return { key: m[1].trim(), rest: m[2] }
}

function Block({ block, primero }: { block: FormattedBlock; primero: boolean }) {
  if (block.type === 'title') {
    // Los títulos en MAYÚSCULAS gritaban: van chicos, espaciados y en verde, como
    // rótulo de sección. Los normales, en negrita un poco más grandes que el texto.
    const caps = esMayusculas(block.content)
    return (
      <span
        className="section-title block text-pretty"
        style={{
          fontFamily: R,
          fontWeight: 700,
          fontSize: caps ? '0.8em' : '1.1em',
          letterSpacing: caps ? '0.07em' : undefined,
          color: caps ? GREEN : '#111827',
          marginTop: primero ? 0 : '1.5em',
          marginBottom: caps ? '0.6em' : '0.5em',
          lineHeight: 1.35,
        }}
      >
        {block.content}
      </span>
    )
  }

  if (block.type === 'list') {
    return (
      <ul style={{ listStyle: 'none', margin: '0 0 1em', padding: 0 }}>
        {block.items.map((item, i) => {
          const et = itemConEtiqueta(item)
          return (
            <li
              key={i}
              className="text-pretty"
              style={{
                position: 'relative',
                paddingLeft: '1.3em',
                color: TEXTO,
                lineHeight: 1.6,
                marginBottom: i === block.items.length - 1 ? 0 : '0.45em',
                fontWeight: 500,
              }}
            >
              <span
                aria-hidden
                style={{ position: 'absolute', left: 1, top: 0, color: 'var(--theme-accent, #1A5C38)', fontWeight: 700 }}
              >
                ✓
              </span>
              {et ? (
                <>
                  <strong style={{ fontWeight: 600, color: 'var(--theme-ink, #111827)' }}>{et.key}:</strong> {et.rest}
                </>
              ) : (
                item
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  if (block.type === 'dataGroup') {
    return (
      <div className="data-group" style={{ marginBottom: '1em' }}>
        {block.content.map((dl, i) => (
          <span
            key={i}
            className="data-line block"
            style={{
              color: TEXTO,
              lineHeight: 1.6,
              marginBottom: i === block.content.length - 1 ? 0 : '0.25em',
              fontWeight: 500,
            }}
          >
            <strong style={{ fontWeight: 600, color: 'var(--theme-ink, #111827)' }}>{dl.key}:</strong>{' '}
            {dl.value}
          </span>
        ))}
      </div>
    )
  }

  // paragraph
  return (
    <p
      className="text-pretty"
      style={{
        color: TEXTO,
        lineHeight: 1.7,
        marginBottom: block.compact ? '0.15em' : '1em',
        fontWeight: 500,
      }}
    >
      {block.subtitle && (
        <>
          <strong style={{ fontWeight: 600, color: 'var(--theme-ink, #111827)' }}>{block.subtitle}.</strong>{' '}
        </>
      )}
      {block.content}
    </p>
  )
}

export default function PropertyDescription({ text }: { text: string | null | undefined }) {
  const blocks = useMemo(() => {
    const parsed = quitarTitularInicial(formatDescription(text))
    if (parsed.length > 0) return parsed
    const fallback = (text ?? '').trim()
    if (!fallback) return []
    return [{ type: 'paragraph', content: fallback }] as FormattedBlock[]
  }, [text])
  const [expanded, setExpanded] = useState(false)

  if (blocks.length === 0) return null

  const rawLength = (text ?? '').length
  const isLong = rawLength > 420 || blocks.length > 5

  return (
    // Renglón de ~75 caracteres en desktop (max-w 34em): a lo ancho de la tarjeta
    // eran ~95 y el ojo se perdía al volver al inicio del renglón siguiente.
    <div className="prose-description max-w-[34em] break-words text-[17px] lg:text-[18px]" style={{ fontFamily: R }}>
      <div className="relative">
        <div
          className={isLong && !expanded ? 'overflow-hidden' : ''}
          style={isLong && !expanded ? { maxHeight: 250 } : undefined}
        >
          {blocks.map((b, i) => (
            <Block key={i} block={b} primero={i === 0} />
          ))}
        </div>
        {isLong && !expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--card-surface) 85%)' }}
          />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="mt-1 min-h-11 font-semibold text-base hover:underline inline-flex items-center gap-1.5"
          style={{ color: 'var(--theme-accent, #1A5C38)', fontFamily: R, fontWeight: 600 }}
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="h-4 w-4" aria-hidden /></>
          ) : (
            <>Ver más <ChevronDown className="h-4 w-4" aria-hidden /></>
          )}
        </button>
      )}
    </div>
  )
}
