// Página pública white-label de la ficha. Server component dinámico.
//
// Diseño "foto protagonista" (3-oct-2026, David: "se ve muy larga"; de 5
// pantallas de celu a ~2):
//   • Celu/tablet: foto grande con operación, precio y zona encima + tira de
//     miniaturas, titular, fila de datos, descripción plegada, datos chicos,
//     plano (alto, para que entre entero) y mapa grande, "Cerca" en chips y
//     barra fija abajo (¿Te gusta? + Compartir).
//   • Compu (≥1024): mosaico de fotos, contenido a la izquierda y tarjeta fija
//     a la derecha (precio, datos, Compartir, ¿Qué te parece?). Plano y mapa
//     uno debajo del otro, a todo el ancho de la columna.
// Llama getFicha() del lib directo (no hop al endpoint /api) para preservar
// la IP real del usuario en el tracking. generateMetadata y la page comparten
// getFichaCached vía React.cache para no leer Redis dos veces por request.
//
// NO renderiza ninguna referencia a SI: la única identidad visible es el
// dominio "verficha.casa" en el footer.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { cache } from 'react'

import { getFicha, isLikelyBot, trackView } from '@/lib/ficha'
import { publicImageUrl } from '@/lib/external-images'
import { limpiarTextoNeutro, titularDeDescripcion } from '@/lib/ficha-titular'
import { formatDescription } from '@/lib/formatDescription'
import HeroGallery from '@/components/v/HeroGallery'
import AudioSummaryNeutral from '@/components/v/AudioSummaryNeutral'
import { DatosFicha, StatsFicha } from '@/components/v/DatosClave'
import StructuredDescription from '@/components/v/StructuredDescription'
import AmenityChips from '@/components/v/AmenityChips'
import BlueprintGallery from '@/components/v/BlueprintGallery'
import LocationMap from '@/components/v/LocationMap'
import CercaChips from '@/components/v/CercaChips'
import CompartirMenu from '@/components/v/CompartirMenu'
import BarraAccionesMovil from '@/components/v/BarraAccionesMovil'
import { VotoColega } from '@/components/neutral/FeedbackColega'
import { APAGADO, FONDO_SUAVE, LINEA, SUAVE, TINTA, tituloSeccion, volanta } from '@/components/v/estilos'

const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

// Revocada a secas (baja manual de SI) = 404 genérico. Revocada por Hilo con
// motivo 'no_disponible' (la propiedad se vendió o el colega la bajó) = la
// página lo dice, sin fotos ni precio: el cliente que guardó el link no tiene
// que seguir viendo una casa que ya no se vende (30-sep-2026).
const getFichaCached = cache(async (slug: string) => {
  const f = await getFicha(slug)
  if (!f) return null
  if (f.revokedAt && f.revokedReason !== 'no_disponible') return null
  return f
})

function NoDisponible({ titulo, zona }: { titulo: string; zona: string }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          {[titulo, zona].filter(Boolean).join(' · ')}
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', margin: '12px 0 0', letterSpacing: '-0.01em' }}>
          Esta propiedad ya no está disponible
        </h1>
        <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 12, lineHeight: 1.6 }}>
          Se vendió o se retiró de la venta.
        </p>
      </div>
      <footer style={{ position: 'absolute', bottom: 24, fontSize: 12, color: '#9A9A9A' }}>{NEUTRAL_DOMAIN}</footer>
    </main>
  )
}

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

// Sin precio publicado el snapshot trae "Consultar" (fichas externas) o
// "Consultar precio" (las de Tokko/HILO, vía formatPrice).
function tienePrecio(precio: string | null | undefined): boolean {
  return Boolean(precio) && !/^consultar/i.test(String(precio).trim())
}

// Con titular, la descripción de la tarjeta de WhatsApp sale del primer párrafo
// de verdad (o de la primera lista): el primer renglón ES el titular y se
// repetía abajo del título, casi siempre EN MAYÚSCULAS.
function resumenSinTitular(texto: string, titular: string | null): string {
  if (!titular || !texto) return texto
  const bloques = formatDescription(texto)
  for (const b of bloques) {
    if (b.type === 'paragraph') return b.content
    if (b.type === 'list') return b.items.join(' · ')
  }
  return ''
}

// Defensa en profundidad: si una descripción de Tokko trajera branding SI,
// se filtra antes de meterlo en el preview de la ficha neutra.
const SI_TERMS = /\b(SI INMOBILIARIA|Susana Ippoliti|SusanaIppoliti|siinmobiliaria\.com|@davidflores\.pov|@inmobiliaria\.si)\b/gi
function stripSI(s: string): string {
  return s.replace(SI_TERMS, '').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await getFichaCached(params.slug)
  if (ficha?.revokedAt) return { title: 'Propiedad ya no disponible', robots: { index: false, follow: false } }

  if (!ficha) {
    return {
      title: 'Enlace no disponible',
      description: 'El enlace puede haber expirado o ser inválido.',
      robots: { index: false, follow: false },
    }
  }

  const s = ficha.snapshot
  // El mismo titular que la página: es lo que se ve en la tarjeta de WhatsApp
  // cuando un colega reenvía el link.
  // Sin "Consultanos…", marca ni teléfonos (ver limpiarTextoNeutro).
  const descripcion = limpiarTextoNeutro(s.descripcion)
  const titularDesc = titularDeDescripcion(descripcion, [s.zonaCompleta || s.zonaAprox || ''])
  const nombre = titularDesc || s.tituloGenerico
  // Sin precio el título va solo: "· Consultar precio" en la tarjeta de
  // WhatsApp invitaba a consultar (la ficha neutra nunca lo hace).
  const tituloBase = tienePrecio(s.precio) ? `${nombre} · ${s.precio}` : nombre
  const titulo = stripSI(tituloBase) || 'Ficha de propiedad'
  const descRaw = firstParagraph(resumenSinTitular(descripcion, titularDesc), 160)
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
  if (ficha.revokedAt) return <NoDisponible titulo={s.tituloGenerico} zona={s.zonaCompleta || s.zonaAprox || ''} />

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

  const zona = s.zonaCompleta || s.zonaAprox || ''
  const precio = tienePrecio(s.precio) ? s.precio : 'Consultar precio'
  // "Casa en venta · a estrenar"
  const volantaTxt = [
    [s.tipo, s.operacion ? (s.tipo ? `en ${s.operacion.toLowerCase()}` : s.operacion) : ''].filter(Boolean).join(' '),
    s.antiguedad === 0 ? 'a estrenar' : '',
  ]
    .filter(Boolean)
    .join(' · ')
  // La descripción vino escrita para la web propia: se le sacan las oraciones
  // que invitan a contactar y las de marca/matrícula/teléfono.
  const descripcion = limpiarTextoNeutro(s.descripcion)
  const titularDesc = titularDeDescripcion(descripcion, [zona])
  const titular = stripSI(titularDesc || s.tituloGenerico) || s.tituloGenerico

  return (
    <>
      <div className="vf-hero-wrap">
        <HeroGallery photos={s.fotos} overlay={{ volanta: volantaTxt, precio, zona }} />
      </div>

      <main className={`vf-cuerpo${isEmbedded ? ' vf-sin-barra' : ''}`}>
        <div style={{ minWidth: 0 }}>
          <div className="hidden lg:block" style={{ ...volanta, color: APAGADO }}>{volantaTxt}</div>
          <h1 className="vf-h1">{titular}</h1>
          <div className="hidden lg:block" style={{ fontSize: 16, color: APAGADO, marginTop: 4 }}>{zona}</div>

          <div style={{ marginTop: 16 }}>
            <StatsFicha snapshot={s} />
          </div>

          <AudioSummaryNeutral propertyId={ficha.propertyId} title={s.tituloGenerico} />

          <StructuredDescription text={descripcion} omitirTituloInicial={Boolean(titularDesc)} />

          {/* En la compu estos datos van en la tarjeta de la derecha */}
          <div className="lg:hidden" style={{ marginTop: 22 }}>
            <DatosFicha snapshot={s} />
          </div>

          {tieneAmenities && <AmenityChips caracteristicas={s.caracteristicas} extras={s.extras} />}

          {(hasBlueprints || hasCoords) && (
            <div className="vf-medios">
              {hasBlueprints && (
                <section style={{ minWidth: 0 }}>
                  <h2 style={tituloSeccion}>{s.blueprints.length > 1 ? 'Planos' : 'Plano'}</h2>
                  <BlueprintGallery blueprints={s.blueprints} />
                </section>
              )}
              {hasCoords && (
                <section style={{ minWidth: 0 }}>
                  <h2 style={tituloSeccion}>Dónde queda</h2>
                  <LocationMap lat={s.lat as number} lng={s.lng as number} />
                </section>
              )}
            </div>
          )}

          {hasCoords && (
            <div style={{ marginTop: 14 }}>
              {ubicTexto && <p style={{ fontSize: 14, color: APAGADO, margin: '0 0 10px', lineHeight: 1.5 }}>{ubicTexto}</p>}
              <CercaChips lat={s.lat as number} lng={s.lng as number} />
            </div>
          )}

          {!isEmbedded && (
            <div className="lg:hidden" style={{ marginTop: 36, padding: '18px 20px', background: FONDO_SUAVE, borderRadius: 16, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TINTA }}>¿Te gustó?</p>
              <p style={{ margin: '4px 0 0', fontSize: 15, color: APAGADO, lineHeight: 1.5 }}>Compartila con un amigo.</p>
            </div>
          )}

          {!isEmbedded && <footer className="vf-footer">{NEUTRAL_DOMAIN}</footer>}
        </div>

        {/* Tarjeta fija de la compu */}
        <aside className="vf-lado">
          <div
            style={{
              border: `1px solid ${LINEA}`,
              borderRadius: 20,
              padding: 26,
              background: '#fff',
              boxShadow: '0 10px 36px rgba(0,0,0,0.07)',
            }}
          >
            {s.operacion && <div style={{ ...volanta, color: APAGADO }}>{s.operacion}</div>}
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: TINTA, marginTop: 2 }}>
              {precio}
            </div>
            <div style={{ marginTop: 18 }}>
              <DatosFicha snapshot={s} />
            </div>
            {!isEmbedded && (
              <>
                <p style={{ margin: '20px 0 0', fontSize: 14, color: APAGADO, lineHeight: 1.5 }}>
                  <b style={{ color: TINTA, fontWeight: 600 }}>¿Te gustó?</b> Compartila con un amigo.
                </p>
                <div style={{ marginTop: 12 }}>
                  <CompartirMenu url={url} slug={params.slug} variante="tarjeta" />
                </div>
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${LINEA}` }}>
                  <div style={{ fontSize: 13, color: APAGADO, marginBottom: 10 }}>¿Qué te parece?</div>
                  <VotoColega slug={params.slug} />
                </div>
              </>
            )}
          </div>
        </aside>
      </main>

      {!isEmbedded && <BarraAccionesMovil url={url} slug={params.slug} />}

      <style dangerouslySetInnerHTML={{ __html: `
        button, a { touch-action: manipulation; }
        .vf-cuerpo { max-width: 760px; margin: 0 auto; padding: 22px 20px 112px; box-sizing: border-box; }
        .vf-cuerpo.vf-sin-barra { padding-bottom: 40px; }
        .vf-h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.28; color: ${TINTA}; margin: 0; }
        .vf-lado { display: none; }
        .vf-plano { height: 320px; }
        .vf-mapa { height: 300px; }
        .vf-medios { display: grid; gap: 28px; margin-top: 32px; }
        .vf-footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid ${LINEA}; text-align: center; font-size: 12px; color: ${SUAVE}; }
        @media (min-width: 1024px) {
          .vf-hero-wrap { max-width: 1180px; margin: 0 auto; padding: 28px 40px 0; box-sizing: border-box; }
          .vf-cuerpo { max-width: 1180px; padding: 32px 40px 56px; display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 56px; align-items: start; }
          .vf-cuerpo.vf-sin-barra { padding-bottom: 40px; }
          .vf-h1 { font-size: 30px; line-height: 1.2; margin-top: 6px; }
          .vf-lado { display: block; position: sticky; top: 24px; }
          .vf-plano { height: 320px; }
          .vf-mapa { height: 320px; }
          .vf-medios { margin-top: 40px; gap: 36px; }
        }
      ` }} />
    </>
  )
}
