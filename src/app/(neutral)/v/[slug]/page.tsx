// Página pública white-label de la ficha. Server component dinámico.
//
// Orquesta las 9 secciones de la versión premium. Llama getFicha() del lib
// directo (no hop al endpoint /api) para preservar la IP real del usuario en
// el tracking. generateMetadata y la page comparten getFichaCached vía
// React.cache para no leer Redis dos veces por request.
//
// NO renderiza ninguna referencia a SI: la única identidad visible es el
// dominio "verficha.casa" en el footer.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { cache } from 'react'

import { getFicha, isLikelyBot, trackView } from '@/lib/ficha'
import HeroGallery from '@/components/v/HeroGallery'
import PriceHero from '@/components/v/PriceHero'
import KeyDataGrid from '@/components/v/KeyDataGrid'
import Surfaces from '@/components/v/Surfaces'
import StructuredDescription from '@/components/v/StructuredDescription'
import AmenityChips from '@/components/v/AmenityChips'
import BlueprintGallery from '@/components/v/BlueprintGallery'
import LocationMap from '@/components/v/LocationMap'
import ShareCTA from '@/components/v/ShareCTA'
import FloatingShareButton from '@/components/v/FloatingShareButton'

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
  const cut = clean.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await getFichaCached(params.slug)

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
              { url: img, width: 1200, height: 630, alt: s.tituloGenerico },
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

  const hasCoords = typeof s.lat === 'number' && typeof s.lng === 'number'
  const hasBlueprints = (s.blueprints?.length ?? 0) > 0
  const tieneAmenities = (s.caracteristicas?.length ?? 0) > 0 || (s.extras?.length ?? 0) > 0

  // "Bv Sarmiento y alrededores · Charquito, Roldán" — sin número
  const ubicTexto = (() => {
    const parts: string[] = []
    if (s.direccionCalle) parts.push(`${s.direccionCalle} y alrededores`)
    if (s.zonaCompleta) parts.push(s.zonaCompleta)
    else if (s.zonaAprox) parts.push(s.zonaAprox)
    return parts.join(' · ')
  })()

  return (
    <>
      {/* Sección 1: hero galería full-bleed mobile, contenida desktop */}
      <HeroGallery photos={s.fotos} />

      {/* Container central para todo lo demás */}
      <main
        className="ficha-main"
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: '0 20px 40px',
        }}
      >
        {/* Sección 2: precio + operación + tipología + zona */}
        <PriceHero snapshot={s} />

        {/* H1 oculto pero presente para SEO/accessibility */}
        <h1
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {s.tituloGenerico} {s.precio && s.precio !== 'Consultar' ? `· ${s.precio}` : ''}
        </h1>

        {/* Sección 3a: datos clave (sin superficies) */}
        <KeyDataGrid snapshot={s} />

        {/* Sección 3b: superficies (cubierta / total / terreno / frente / fondo) */}
        <Surfaces snapshot={s} />

        {/* Sección 4: descripción estructurada (parser SI replicado) */}
        <StructuredDescription text={s.descripcion} />

        {/* Sección 5: características */}
        {tieneAmenities && (
          <AmenityChips
            caracteristicas={s.caracteristicas}
            extras={s.extras}
          />
        )}

        {/* Sección 6: planos */}
        {hasBlueprints && (
          <section style={{ marginTop: 36 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 14,
              }}
            >
              Planos
            </h2>
            <BlueprintGallery blueprints={s.blueprints} />
          </section>
        )}

        {/* Sección 7: ubicación + mapa */}
        {hasCoords && (
          <section style={{ marginTop: 36 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              Ubicación
            </h2>
            {ubicTexto && (
              <p style={{ fontSize: 15, color: '#4A4A4A', margin: '0 0 14px', lineHeight: 1.5 }}>
                {ubicTexto}
              </p>
            )}
            <LocationMap lat={s.lat as number} lng={s.lng as number} />
          </section>
        )}

        {/* Sección 8: CTA compartir */}
        <ShareCTA url={url} />

        {/* Sección 9: footer mínimo */}
        <footer
          style={{
            marginTop: 56,
            paddingTop: 24,
            paddingBottom: 32,
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center',
            fontSize: 12,
            color: '#9CA3AF',
          }}
        >
          {NEUTRAL_DOMAIN}
        </footer>
      </main>

      {/* FAB — mobile only (CSS media query oculta en ≥768px) */}
      <FloatingShareButton url={url} />

      <style>{`
        @media (min-width: 768px) {
          .ficha-main { padding: 0 32px 60px !important; }
        }
      `}</style>
    </>
  )
}
