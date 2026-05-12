// Página pública white-label de la ficha. Server component dinámico.
//
// Importante:
// - Llama getFicha() del lib directo (no hop al endpoint /api) para no perder
//   IP real del usuario en el tracking. Para que el conteo coincida con lo
//   que haría el endpoint, usamos isLikelyBot() del mismo lib.
// - generateMetadata y la page comparten getFichaCached vía React.cache para
//   no leer Redis dos veces por request.
// - NO renderiza ninguna referencia a SI: la única identidad visible es la
//   del colega (ContactCard) y el dominio "verficha.casa" en el footer.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { cache } from 'react'

import { getFicha, isLikelyBot, trackView } from '@/lib/ficha'
import NeutralGallery from '@/components/v/NeutralGallery'
import NeutralMap from '@/components/v/NeutralMap'
import NeutralShareButton from '@/components/v/NeutralShareButton'

const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

const getFichaCached = cache(async (slug: string) => {
  const f = await getFicha(slug)
  if (!f || f.revokedAt) return null
  return f
})

interface Props {
  params: { slug: string }
}

function firstParagraph(text: string, maxLen = 160): string {
  const para = (text || '').split(/\n+/)[0] || ''
  const clean = para.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  // Cortar en el último espacio antes de maxLen para no partir palabras
  const cut = clean.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await getFichaCached(params.slug)

  // Sin ficha → metadata genérica con noindex. La page va a notFound() igual.
  if (!ficha) {
    return {
      title: 'Enlace no disponible',
      description: 'El enlace puede haber expirado o ser inválido.',
      robots: { index: false, follow: false },
    }
  }

  const s = ficha.snapshot
  const titulo =
    s.precio && s.precio !== 'Consultar'
      ? `${s.tituloGenerico} · ${s.precio}`
      : s.tituloGenerico
  const desc = firstParagraph(s.descripcion, 160)
  const url = `https://${NEUTRAL_DOMAIN}/${params.slug}`
  const img = s.ogImage || s.fotos[0] || null

  return {
    title: titulo,
    description: desc || s.tituloGenerico,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: {
      title: titulo,
      description: desc || s.tituloGenerico,
      url,
      type: 'website',
      siteName: NEUTRAL_DOMAIN,
      ...(img
        ? {
            images: [
              {
                url: img,
                width: 1200,
                height: 630,
                alt: s.tituloGenerico,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: desc || s.tituloGenerico,
      ...(img ? { images: [img] } : {}),
    },
  }
}

export default async function NeutralFichaPage({ params }: Props) {
  const ficha = await getFichaCached(params.slug)
  if (!ficha) notFound()

  const s = ficha.snapshot
  const url = `https://${NEUTRAL_DOMAIN}/${params.slug}`

  // Tracking — fire-after-await, ignorando errores. Misma regla de bots que
  // el endpoint /api/ficha/[slug] (compartido vía isLikelyBot del lib).
  const h = headers()
  const ua = h.get('user-agent')
  if (!isLikelyBot(ua)) {
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      'unknown'
    try {
      await trackView(params.slug, ip)
    } catch {
      // tracking nunca debe romper el render
    }
  }

  // Datos clave — solo los que tienen valor
  const datos: Array<{ label: string; value: string }> = []
  if (s.ambientes) datos.push({ label: 'Ambientes', value: String(s.ambientes) })
  if (s.dormitorios) datos.push({ label: 'Dormitorios', value: String(s.dormitorios) })
  if (s.banos) datos.push({ label: 'Baños', value: String(s.banos) })
  if (s.cocheras) datos.push({ label: 'Cocheras', value: String(s.cocheras) })
  if (s.m2cubiertos) datos.push({ label: 'M² cubiertos', value: `${s.m2cubiertos} m²` })
  if (s.m2totales) datos.push({ label: 'M² totales', value: `${s.m2totales} m²` })
  if (typeof s.antiguedad === 'number') {
    datos.push({
      label: 'Antigüedad',
      value: s.antiguedad === 0 ? 'A estrenar' : `${s.antiguedad} años`,
    })
  }

  const hasCoords = typeof s.lat === 'number' && typeof s.lng === 'number'

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '24px 20px 40px',
      }}
    >
      <NeutralGallery photos={s.fotos} />

      <div
        style={{
          marginTop: 24,
          fontSize: 28,
          fontWeight: 700,
          color: '#1A1A1A',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {s.precio}
      </div>
      {s.operacion && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: '#6B6B6B',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {s.operacion}
        </div>
      )}

      <h1
        style={{
          marginTop: 14,
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
        }}
      >
        {s.tituloGenerico}
      </h1>

      {datos.length > 0 && (
        <div
          style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10,
          }}
        >
          {datos.map(d => (
            <div
              key={d.label}
              style={{
                background: '#F8F8F8',
                padding: '12px 14px',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#6B6B6B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}
              >
                {d.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {s.descripcion && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            Descripción
          </h2>
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#3A3A3A',
              whiteSpace: 'pre-wrap',
            }}
          >
            {s.descripcion}
          </div>
        </section>
      )}

      {s.caracteristicas.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            Características
          </h2>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {s.caracteristicas.map(c => (
              <li
                key={c}
                style={{
                  background: '#F8F8F8',
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 13,
                  color: '#3A3A3A',
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasCoords && (
        <section style={{ marginTop: 36 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            Ubicación aproximada
          </h2>
          <NeutralMap lat={s.lat as number} lng={s.lng as number} />
          <div style={{ marginTop: 8, fontSize: 12, color: '#6B6B6B' }}>
            {s.zonaAprox ? `${s.zonaAprox}. ` : ''}Ubicación aproximada (radio 300 m).
          </div>
        </section>
      )}

      <section style={{ marginTop: 44 }}>
        <NeutralShareButton url={url} />
      </section>

      <footer
        style={{
          marginTop: 56,
          paddingTop: 20,
          borderTop: '1px solid #EAEAEA',
          textAlign: 'center',
          fontSize: 12,
          color: '#9A9A9A',
        }}
      >
        {NEUTRAL_DOMAIN}
      </footer>
    </main>
  )
}
