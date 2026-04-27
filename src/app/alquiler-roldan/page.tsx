import type { Metadata } from 'next'
import Link from 'next/link'
import { getProperties, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import PropertyGrid from '@/components/PropertyGrid'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Alquiler de Propiedades en Roldán | Casas y Departamentos',
  description:
    'Propiedades en alquiler en Roldán, Santa Fe. Casas, departamentos y locales comerciales. SI Inmobiliaria - administración profesional de alquileres desde 1983.',
  openGraph: {
    title: 'Alquiler de Propiedades en Roldán | SI Inmobiliaria',
    description: 'Casas y departamentos en alquiler en Roldán.',
  },
}

function filterRentRoldan(properties: TokkoProperty[]): TokkoProperty[] {
  return properties.filter(p => {
    const loc = (p.location?.short_location ?? p.location?.name ?? '').toLowerCase()
    const addr = (p.fake_address ?? p.address ?? '').toLowerCase()
    const inRoldan = `${loc} ${addr}`.includes('roldan') || `${loc} ${addr}`.includes('roldán')
    const isRent = p.operations?.[0]?.operation_type === 'Rent'
    return inRoldan && isRent
  })
}

export default async function AlquilerRoldanPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = filterRentRoldan(data.objects ?? []).map(sanitizeProperty)
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">Alquileres en Roldán</p>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Alquiler de Propiedades en Roldán
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            Encontrá tu próximo hogar en alquiler en Roldán. Casas, departamentos y locales comerciales con administración profesional.
          </p>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Alquilar en Roldán con respaldo profesional</h2>
          <p>
            Alquilar una propiedad en Roldán es cada vez más buscado por familias y profesionales que trabajan en Rosario pero prefieren la calidad de vida que ofrece una ciudad más tranquila, segura y con espacios verdes. Roldán cuenta con excelentes opciones de alquiler que van desde departamentos céntricos hasta casas amplias en barrios residenciales, con valores significativamente más accesibles que Rosario.
          </p>
          <p>
            <strong>SI Inmobiliaria</strong> administra alquileres en Roldán desde 1983. Nuestra oficina de administración en <strong>1ro de Mayo 258</strong> se encarga de todo el proceso: búsqueda de la propiedad ideal, verificación del estado, confección del contrato con nuestro estudio jurídico, gestión de garantías y administración mensual del alquiler. Tanto inquilinos como propietarios cuentan con un servicio serio, transparente y profesional.
          </p>
          <p>
            Para <strong>inquilinos</strong>: te ayudamos a encontrar la propiedad que se ajuste a tus necesidades y presupuesto. Coordinamos visitas, verificamos el estado del inmueble y gestionamos todo el proceso contractual. No cobramos comisión de renovación y atendemos cualquier reclamo durante la vigencia del contrato.
          </p>
          <p>
            Para <strong>propietarios</strong>: administramos tu propiedad con total transparencia. Nos encargamos de la publicación, selección de inquilinos con verificación de antecedentes, cobranza mensual, liquidación de haberes y gestión de mantenimiento. Tu propiedad en buenas manos, con más de 40 años de experiencia respaldándonos.
          </p>
          <p>
            Las zonas más demandadas para alquiler en Roldán incluyen el casco céntrico (por su cercanía a comercios y transporte), Barrio Sur, las inmediaciones de la Autopista y los barrios residenciales con fácil acceso a colegios. Los valores de alquiler en Roldán se mantienen competitivos frente a Rosario y Funes, convirtiéndola en una excelente opción para quienes priorizan relación precio-calidad de vida.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} en alquiler en Roldán
            </h2>
          </div>
          <PropertyGrid properties={properties.slice(0, 18)} />
          {properties.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay propiedades en alquiler en Roldán en este momento.</p>
              <Link href="/propiedades" className="text-brand-600 font-semibold hover:text-brand-700">
                Ver todas las propiedades disponibles →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3">¿Tenés una propiedad para alquilar en Roldán?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">Administramos tu propiedad con transparencia y profesionalismo. Más de 40 años de experiencia.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="https://wa.me/5493412101694?text=Hola!%20Quiero%20consultar%20por%20administración%20de%20alquiler" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors">
            Consultar por WhatsApp
          </a>
          <Link href="/tasaciones" className="px-8 py-4 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-bold rounded-lg transition-colors">
            Tasá tu propiedad
          </Link>
        </div>
      </section>
    </div>
  )
}
