'use client'

// Replica del PropertyDescription del sitio SI con paleta neutra.
// Reusa el parser lib/formatDescription (3 tipos de bloques: title /
// dataGroup / paragraph con subtitle inline opcional).
//
// Plegada a ~6 renglones con "Leer todo" cuando es larga (>320 chars o >3
// bloques). Sin encabezado propio: el título de la ficha ya la presenta.
// omitirTituloInicial: el primer título de la descripción ya se usó como H1.

import { useMemo, useState } from 'react'
import { formatDescription, type FormattedBlock } from '@/lib/formatDescription'
import { type ColoresFicha, coloresFicha } from './estilos'

function Block({ block, c }: { block: FormattedBlock; c: ColoresFicha }) {
  const { TEXTO, TINTA } = c
  if (block.type === 'title') {
    return (
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: TINTA,
          marginTop: 22,
          marginBottom: 8,
          lineHeight: 1.35,
          letterSpacing: '-0.005em',
        }}
      >
        {block.content}
      </h3>
    )
  }

  if (block.type === 'list') {
    return (
      <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
        {block.items.map((item, i) => (
          <li
            key={i}
            className="desc-para"
            style={{
              position: 'relative',
              paddingLeft: 22,
              color: TEXTO,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.6,
              marginBottom: i === block.items.length - 1 ? 0 : 6,
            }}
          >
            <span aria-hidden style={{ position: 'absolute', left: 2, top: 0, color: TINTA, fontWeight: 700 }}>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    )
  }

  if (block.type === 'dataGroup') {
    return (
      <div className="desc-data" style={{ marginBottom: 16 }}>
        {block.content.map((dl, i) => (
          <div
            key={i}
            style={{
              color: TEXTO,
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: i === block.content.length - 1 ? 0 : 4,
            }}
          >
            <strong style={{ fontWeight: 600, color: TINTA }}>{dl.key}:</strong>{' '}
            {dl.value}
          </div>
        ))}
      </div>
    )
  }

  return (
    <p
      className="desc-para"
      style={{
        color: TEXTO,
        fontSize: 16,
        // 500 y tinta oscura: la letra de lectura en 400 se veía finita y
        // cansaba (regla de David 3-oct, misma que la ficha de la web).
        fontWeight: 500,
        lineHeight: 1.65,
        margin: '0 0 12px',
      }}
    >
      {block.subtitle && (
        <>
          <strong style={{ fontWeight: 700, color: TINTA }}>{block.subtitle}.</strong>{' '}
        </>
      )}
      {block.content}
    </p>
  )
}

export default function StructuredDescription({
  text,
  omitirTituloInicial = false,
  oscuro = false,
}: {
  text: string | null | undefined
  omitirTituloInicial?: boolean
  /** Sobre el negro del Tinder (Ver detalles). */
  oscuro?: boolean
}) {
  const c = coloresFicha(oscuro)
  const blocks = useMemo(() => {
    const parsed = formatDescription(text)
    if (parsed.length === 0) {
      const fallback = (text ?? '').trim()
      return fallback ? ([{ type: 'paragraph', content: fallback }] as FormattedBlock[]) : []
    }
    // Si la descripción era solo el titular, no queda nada (antes caía al
    // fallback y repetía el H1 abajo, en mayúsculas).
    if (omitirTituloInicial && parsed[0]?.type === 'title') parsed.shift()
    return parsed
  }, [text, omitirTituloInicial])
  const [expanded, setExpanded] = useState(false)

  if (blocks.length === 0) return null

  const rawLength = (text ?? '').length
  const isLong = rawLength > 320 || blocks.length > 3

  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ position: 'relative' }}>
        <div
          className={isLong && !expanded ? 'vf-desc-plegada' : undefined}
          style={isLong && !expanded ? { overflow: 'hidden' } : undefined}
        >
          {blocks.map((b, i) => (
            <div
              key={i}
              style={
                i === 0 && b.type === 'title' ? { marginTop: 0 } : undefined
              }
            >
              <Block block={b} c={c} />
            </div>
          ))}
        </div>
        {isLong && !expanded && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 64,
              pointerEvents: 'none',
              background: `linear-gradient(to bottom, rgba(${c.FONDO_RGB},0) 0%, ${c.FONDO} 85%)`,
            }}
          />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          style={{
            marginTop: 0,
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
            color: c.TINTA,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {expanded ? 'Leer menos' : 'Leer todo'}
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .vf-desc-plegada { max-height: 168px; }
        @media (min-width: 1024px) {
          .vf-desc-plegada { max-height: 224px; }
          .desc-para { font-size: 17px !important; }
          .desc-data > div { font-size: 16px !important; }
        }
      ` }} />
    </section>
  )
}
