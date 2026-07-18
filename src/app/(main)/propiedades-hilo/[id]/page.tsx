import { notFound } from 'next/navigation'

import PropertyGalleryHero from '@/components/property-detail/PropertyGalleryHero'
import PropertyDetailBody from '@/components/property-detail/PropertyDetailBody'
import {
  sanitizeProperty,
  generatePropertySlug,
  buildPropertyWhatsappUrl,
  type TokkoProperty,
} from '@/lib/tokko'

/**
 * PÁGINA DE PRUEBA — puente Tokko → Hilo.
 * Trae UNA propiedad del feed público de Hilo (no de Tokko) y la renderiza con
 * los componentes REALES de la ficha. Sirve para validar de punta a punta que
 * el sitio puede vivir de la base de Hilo antes de migrar todo. Ruta aislada:
 * no toca el flujo en vivo. `[id]` es el tokko_id (mismo que usan los slugs).
 */

export const dynamic = 'force-dynamic'

// Ruta de prueba que DUPLICA la ficha real → nunca indexar (además del disallow
// en robots.txt, que por sí solo no evita la indexación si la enlazan).
export const metadata = { robots: { index: false, follow: false } }

const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com'

export default async function PropiedadHiloTestPage({ params }: { params: { id: string } }) {
  let property: TokkoProperty
  try {
    const res = await fetch(`${HILO_BASE}/api/public/propiedades/${params.id}`, { cache: 'no-store' })
    if (!res.ok) notFound()
    property = sanitizeProperty((await res.json()) as TokkoProperty)
  } catch {
    notFound()
  }

  const slug = generatePropertySlug(property)
  const whatsappUrl = buildPropertyWhatsappUrl(property, slug)

  return (
    <main>
      <div
        style={{
          background: '#15603C',
          color: '#fff',
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        PRUEBA · datos servidos desde Hilo (no Tokko) · propiedad #{property.id}
      </div>
      <PropertyGalleryHero property={property} />
      <PropertyDetailBody property={property} whatsappUrl={whatsappUrl} />
    </main>
  )
}
