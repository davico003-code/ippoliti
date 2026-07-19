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
import { publicImageUrl } from '@/lib/external-images'
import HeroGallery from '@/components/v/HeroGallery'
import AudioSummaryNeutral from '@/components/v/AudioSummaryNeutral'
import PriceHero from '@/components/v/PriceHero'
import KeyDataGrid from '@/components/v/KeyDataGrid'
import Surfaces from '@/components/v/Surfaces'
import StructuredDescription from '@/components/v/StructuredDescription'
import AmenityChips from '@/components/v/AmenityChips'
import BlueprintGallery from '@/components/v/BlueprintGallery'
import LocationMap from '@/components/v/LocationMap'
import NearbyPlacesNeutral from '@/components/v/NearbyPlacesNeutral'
import QRCode from 'qrcode'
import ShareCTA from '@/components/v/ShareCTA'
import FloatingShareButton from '@/components/v/FloatingShareButton'
import FeedbackColega from '@/components/neutral/FeedbackColega'

const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

const getFichaCached = cache(async (slug: string) => {
  const f = await getFicha(slug)
  if (!f || f.revokedAt) return null
  return f
})

interface Props {
  params: { slug: string }
  searchParams?: { embed?: string }
}

function firstParagraph(text: string, maxLen = 160): string {
  const para = (text || '').split(/\n+/)[0] || ''
  const clean = para.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const cut = clean.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

// Defensa en profundidad: si una descripción de Tokko trajera branding SI,
// se filtra antes de meterlo en el preview de la ficha neutra.
const SI_TERMS = /\b(SI INMOBILIARIA|Susana Ippoliti|SusanaIppoliti|siinmobiliaria\.com|@davidflores\.pov|@inmobiliaria\.si)\b/gi
function stripSI(s: string): string {
  return s.replace(SI_TERMS, '').replace(/\s+/g, ' ').trim()
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
  const tituloBase =
    s.precio && s.precio !== 'Consultar'
      ? `${s.tituloGenerico} · ${s.precio}`
      : s.tituloGenerico
  const titulo = stripSI(tituloBase) || 'Ficha de propiedad'
  const descRaw = firstParagraph(s.descripcion, 160)
  const desc = stripSI(descRaw) || stripSI(s.tituloGenerico) || 'Ficha de propiedad'
  const url = `https://${NEUTRAL_DOMAIN}/${params.slug}`
  const img = publicImageUrl(s.ogImage || s.fotos[0] || null, `https://${NEUTRAL_DOMAIN}`)

  return {
    title: titulo,
    description: desc,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    // Sin siteName: la ficha es neutra (verficha.casa es solo el dominio,
    // no se expone como "marca" en og:site_name).
    openGraph: {
      title: titulo,
      description: desc,
      url,
      type: 'website',
      ...(img
        ? {
            images: [
              { url: img, width: 1200, height: 630, alt: titulo },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: desc,
      ...(img ? { images: [img] } : {}),
    },
  }
}

export default async function NeutralFichaPage({ params, searchParams }: Props) {
  const ficha = await getFichaCached(params.slug)
  if (!ficha) notFound()

  const s = ficha.snapshot
  const url = `https://${NEUTRAL_DOMAIN}/${params.slug}`

  // QR del link para la sección Compartir (screenshot / cartelería). Se genera
  // server-side; si falla, ShareCTA simplemente no lo muestra.
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 }).catch(() => null)

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
  const isEmbedded = searchParams?.embed === '1'

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
        {/* Sección 1b: audio narrado (entre hero y precio) */}
        <AudioSummaryNeutral propertyId={ficha.propertyId} title={s.tituloGenerico} />

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

        {/* Sección 7b: lugares cercanos (Overpass / OSM, lazy) */}
        {hasCoords && (
          <NearbyPlacesNeutral lat={s.lat as number} lng={s.lng as number} />
        )}

        {!isEmbedded && (
          <>
            {/* Sección 7c: feedback anónimo de colegas (final del scroll, antes del CTA) */}
            <FeedbackColega slug={params.slug} />

            {/* Sección 8: CTA compartir */}
            <ShareCTA url={url} slug={params.slug} qrDataUrl={qrDataUrl} />
          </>
        )}

        {!isEmbedded && (
          /* Sección 9: footer mínimo */
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
        )}
      </main>

      {!isEmbedded && (
        /* FAB — mobile only (CSS media query oculta en ≥768px) */
        <FloatingShareButton url={url} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .ficha-main { padding: 0 32px 60px !important; }
        }
      ` }} />
    </>
  )
}
