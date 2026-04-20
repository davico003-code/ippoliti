// Renderer de placas — arma el chrome (head-bar + foot + logo) y monta los
// bloques en el body con spacing contextual. Usa next/og ImageResponse.
//
// Export principal: `renderPlaca(placa, pageInfo) → ArrayBuffer` (PNG).

import { ImageResponse } from 'next/og'
import type { ReactNode } from 'react'
import type { Placa, TipoBloque } from '../types'
import { DIMENSIONES, LAYOUT, TEMAS_FONDO, TIPO } from '../config/estilos-marca'
import { getBloqueRenderer, type RenderContext } from '../config/bloques-config'
import { cargarFuentesParaSatori } from './fonts'
import { LogoSI } from '../bloques/logo-si'

// ─── Spacing entre bloques ────────────────────────────────────────────────
// Según el tipo anterior y el actual, calculamos el margin-top del bloque.
// La matriz es conservadora: si no hay regla específica, default 40px.
// Los bloques como `bajada` y `breakdown` ya traen su propio separador
// (línea superior + padding), así que devuelven 0 para no duplicar.

function marginTopEntreBloques(
  previo: TipoBloque | undefined,
  actual: TipoBloque,
): number {
  if (!previo) return 0

  // Bloques que ya traen separador interno — no sumar margin-top
  if (actual === 'bajada' || actual === 'breakdown') return 0

  // Después de eyebrow, el contenido pega pegado
  if (previo === 'eyebrow') return 0

  // Después de título o bajada, un respiro grande
  if (previo === 'titulo') return 48
  if (previo === 'bajada') return 44

  // Entre datos numéricos
  if (previo === 'numero-hero' && actual === 'fuente') return 40
  if (previo === 'numero-shock' && actual === 'parrafo') return 32

  // Fuente después de cualquier dato
  if (actual === 'fuente') return 40

  // Default
  return 32
}

// ─── Componente: PlacaFrame ───────────────────────────────────────────────

function HeadBar({
  izquierda,
  derecha,
  tema,
}: {
  izquierda: string
  derecha: string
  tema: ReturnType<typeof temaPara>
}): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: `${LAYOUT.headBarPaddingBottom}px`,
        borderBottom: `${LAYOUT.borderWidth}px solid ${tema.linea}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${LAYOUT.headBarGap}px`,
          color: tema.muted,
          ...TIPO.headBar,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${LAYOUT.headBarDotSize}px`,
            height: `${LAYOUT.headBarDotSize}px`,
            borderRadius: '50%',
            backgroundColor: tema.acento,
          }}
        />
        <span style={{ display: 'flex' }}>{izquierda}</span>
      </div>
      <span
        style={{
          display: 'flex',
          color: tema.muted,
          fontFamily: TIPO.headBar.fontFamily,
          fontWeight: 400,
          fontSize: `${TIPO.headBar.fontSize}px`,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {derecha}
      </span>
    </div>
  )
}

function Foot({
  meta,
  tema,
  onDark,
}: {
  meta: string
  tema: ReturnType<typeof temaPara>
  onDark: boolean
}): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: `${LAYOUT.footPaddingTop}px`,
        borderTop: `${LAYOUT.borderWidth}px solid ${tema.linea}`,
      }}
    >
      <LogoSI scale={1} onDark={onDark} />
      <span
        style={{
          display: 'flex',
          color: tema.muted,
          ...TIPO.metaFoot,
        }}
      >
        {meta}
      </span>
    </div>
  )
}

function temaPara(fondo: Placa['fondo']): (typeof TEMAS_FONDO)[Placa['fondo']] {
  return TEMAS_FONDO[fondo]
}

function PlacaFrame({ placa }: { placa: Placa }): ReactNode {
  const tema = temaPara(placa.fondo)
  const onDark = placa.fondo === 'verde-profundo'

  const alineacion = placa.alineacion ?? 'centro'
  const justifyContent =
    alineacion === 'centro' ? 'center' : alineacion === 'arriba' ? 'flex-start' : 'flex-end'

  return (
    <div
      style={{
        width: `${DIMENSIONES.ancho}px`,
        height: `${DIMENSIONES.alto}px`,
        backgroundColor: tema.bg,
        display: 'flex',
      }}
    >
      {/* Zona segura con margen simétrico */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: `${DIMENSIONES.margenSuperior}px ${DIMENSIONES.margenLateral}px ${DIMENSIONES.margenInferior}px`,
        }}
      >
        <HeadBar
          izquierda={placa.head_bar_izquierda}
          derecha={placa.head_bar_derecha}
          tema={tema}
        />

        {/* Body: stack de bloques con alineación vertical */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent,
            paddingTop: '36px',
            paddingBottom: '36px',
          }}
        >
          {placa.bloques.map((bloque, i) => {
            const ctx: RenderContext = {
              fondo: placa.fondo,
              tema,
              indice: i,
              total: placa.bloques.length,
              tipoPrevio: i > 0 ? placa.bloques[i - 1].tipo : undefined,
              tipoSiguiente: i < placa.bloques.length - 1 ? placa.bloques[i + 1].tipo : undefined,
            }
            const renderer = getBloqueRenderer(bloque.tipo)
            const rendered = renderer(bloque as never, ctx)
            const mt = marginTopEntreBloques(ctx.tipoPrevio, bloque.tipo)
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: `${mt}px`,
                }}
              >
                {rendered}
              </div>
            )
          })}
        </div>

        <Foot meta={placa.meta_foot} tema={tema} onDark={onDark} />
      </div>
    </div>
  )
}

// ─── API pública ──────────────────────────────────────────────────────────

export async function renderPlaca(placa: Placa): Promise<ArrayBuffer> {
  const fonts = await cargarFuentesParaSatori()
  const response = new ImageResponse(<PlacaFrame placa={placa} />, {
    width: DIMENSIONES.ancho,
    height: DIMENSIONES.alto,
    fonts,
  })
  return await response.arrayBuffer()
}
