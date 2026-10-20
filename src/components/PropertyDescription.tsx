'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  entradaDelParrafo,
  formatDescription,
  quitarTitularInicial,
  type FormattedBlock,
} from '@/lib/formatDescription'

// Estilo Apple (David 20-oct, sobre apple.com/la/macbook-air): todo en 600, la
// relevancia la marca el COLOR — la primera oración de cada párrafo en tinta y
// el resto en gris —, así quien lee solo lo oscuro se lleva lo esencial.
// Letra del sistema (SF en iPhone/Mac, la misma de Apple): 'Raleway' por nombre
// nunca cargó acá (next/font la registra con otro nombre) y ya caía en system-ui.
const LETRA = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const TINTA = 'var(--theme-ink, #1D1D1F)'
// #6E6E73 y no el #86868B de Apple: contraste 5:1, legible para los mayores
// (David 3-oct: "tendría que ser más legible, un poco más gruesa").
const GRIS = 'var(--theme-subtle, #6E6E73)'
const VERDE = 'var(--theme-accent, #1A5C38)'
const PESO = 600
const INTERLINEA = 1.42

// Tamaños en em: el contenedor manda (19 px en el celular, 21 px en desktop,
// los de Apple) y todo escala junto.
const esMayusculas = (s: string) => {
  const letras = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  return letras.length >= 3 && letras === letras.toLocaleUpperCase('es-AR')
}

// "Cocina: mesada a definir, pileta de acero…" → la etiqueta en tinta, para
// que una lista de ítems largos se pueda escanear.
function itemConEtiqueta(item: string): { key: string; rest: string } | null {
  const m = item.match(/^([^:]{2,32}):\s+(.+)$/)
  if (!m || m[1].trim().split(/\s+/).length > 4) return null
  return { key: m[1].trim(), rest: m[2] }
}

const Tinta = ({ children }: { children: ReactNode }) => <span style={{ color: TINTA }}>{children}</span>

function Block({ block, primero, abreSeccion }: { block: FormattedBlock; primero: boolean; abreSeccion: boolean }) {
  if (block.type === 'title') {
    // Los títulos en MAYÚSCULAS gritaban: van chicos, espaciados y en verde, como
    // rótulo de sección. Los normales, en tinta y más grandes que el texto.
    const caps = esMayusculas(block.content)
    return (
      <span
        className="section-title block text-pretty"
        style={{
          fontWeight: 700,
          fontSize: caps ? '0.72em' : '1.2em',
          letterSpacing: caps ? '0.07em' : '-0.01em',
          color: caps ? VERDE : TINTA,
          marginTop: primero ? 0 : '1.4em',
          marginBottom: caps ? '0.6em' : '0.4em',
          lineHeight: 1.25,
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
                color: GRIS,
                lineHeight: INTERLINEA,
                marginBottom: i === block.items.length - 1 ? 0 : '0.4em',
              }}
            >
              <span aria-hidden style={{ position: 'absolute', left: 1, top: 0, color: VERDE, fontWeight: 700 }}>
                ✓
              </span>
              {et ? (
                <>
                  <Tinta>{et.key}:</Tinta> {et.rest}
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
            style={{ color: GRIS, lineHeight: INTERLINEA, marginBottom: i === block.content.length - 1 ? 0 : '0.25em' }}
          >
            <Tinta>{dl.key}:</Tinta> {dl.value}
          </span>
        ))}
      </div>
    )
  }

  // paragraph — entrada en tinta + resto en gris. Un párrafo de una sola oración
  // va en tinta solo si abre la descripción o una sección; si no, en gris (si no,
  // un aviso de renglones sueltos —el 65 % de los párrafos— quedaba todo negro).
  const { entrada, resto } = block.subtitle
    ? { entrada: `${block.subtitle}.`, resto: block.content }
    : entradaDelParrafo(block.content)
  return (
    <p
      className="text-pretty"
      style={{ color: GRIS, lineHeight: INTERLINEA, marginBottom: block.compact ? '0.15em' : '0.9em' }}
    >
      {resto ? (
        <>
          <Tinta>{entrada}</Tinta> {resto}
        </>
      ) : abreSeccion ? (
        <Tinta>{entrada}</Tinta>
      ) : (
        entrada
      )}
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
    // Renglón de ~70 caracteres (max-w 34em): a lo ancho de la tarjeta eran ~95 y
    // el ojo se perdía al volver al inicio del renglón siguiente.
    <div
      className="prose-description max-w-[34em] break-words text-[19px] lg:text-[21px]"
      style={{ fontFamily: LETRA, fontWeight: PESO }}
    >
      <div className="relative">
        <div
          className={isLong && !expanded ? 'overflow-hidden' : ''}
          // ~13 renglones antes de "Ver más": con la letra a 19/21 px, los 250 px de
          // antes mostraban apenas el primer párrafo.
          style={isLong && !expanded ? { maxHeight: 400 } : undefined}
        >
          {blocks.map((b, i) => (
            <Block key={i} block={b} primero={i === 0} abreSeccion={i === 0 || blocks[i - 1].type !== 'paragraph'} />
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
          style={{ color: VERDE, fontWeight: 600 }}
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
