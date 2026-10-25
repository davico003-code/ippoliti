'use client'

import { ESTILO_TITULO_SECCION, TITULO_SECCION } from './property-detail/titulo-seccion'
import Image from '@/components/Imagen'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  getRoofedArea,
  getOperationType,
  translatePropertyType,
  operationBadgeColor,
  tituloVisible,
} from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'

interface Props {
  properties: TokkoProperty[]
  /** @deprecated — ya no se usa, se mantiene por compat con llamadas existentes */
  currentPropertyId?: number
}

// Sin buscador ni botones de orden: el endpoint devuelve las 4 más parecidas y
// ordenar o filtrar 4 tarjetas era puro ruido (y casi siempre terminaba en "No
// se encontraron propiedades"). Van en el orden en que las eligió el servidor.
export default function SimilarProperties({ properties }: Props) {
  if (properties.length === 0) {
    return (
      <div className="mt-12">
        <h2 className={`${TITULO_SECCION} mb-2`} style={ESTILO_TITULO_SECCION}>Otras opciones para vos</h2>
        <p className="text-gray-400 text-sm">No hay propiedades similares disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className={TITULO_SECCION} style={ESTILO_TITULO_SECCION}>Otras opciones para vos</h2>
      </div>

      {/* Cards grid — desktop 4 cols, mobile 1 col full-width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {properties.map(property => {
          const photo = getMainPhoto(property)
          const slug = generatePropertySlug(property)
          const price = formatPrice(property)
          const area = getTotalSurface(property)
          const roofed = getRoofedArea(property)
          const typeName = translatePropertyType(property.type?.name)
          // La operación que muestra el precio (operacionPrincipal vía getOperationType),
          // no operations[0] a ciegas: si la primera viene sin precio, el cartel decía
          // "Venta" con el precio del alquiler. El color va con el nombre completo
          // ("Alquiler temporario" → rojo de alquiler; con "Temporario" salía violeta).
          const operacion = getOperationType(property)
          const op = operacion === 'Venta' || operacion === 'Alquiler'
            ? operacion
            : operacion === 'Alquiler temporario'
              ? 'Temporario'
              : null
          const beds = property.suite_amount || property.room_amount || 0
          const baths = property.bathroom_amount || 0
          const m2 = (n: number) => `${n.toLocaleString('es-AR')} m²`
          const sizeLabel = roofed && roofed > 0 ? m2(roofed) : area && area > 0 ? m2(area) : null
          const specsBits: string[] = []
          if (beds > 0) specsBits.push(`${beds} dorm`)
          if (baths > 0) specsBits.push(`${baths} baño${baths > 1 ? 's' : ''}`)
          if (sizeLabel) specsBits.push(sizeLabel)
          const addr = property.fake_address || property.address
          const direccion = formatDireccionCompleta(property, addr, ' | ')

          return (
            <Link
              key={property.id}
              href={`/propiedades/${slug}`}
              className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-[#1A5C38]"
            >
              {/* Photo 16:9, sin overlay de texto */}
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                {photo && (
                  <Image
                    src={photo}
                    alt={tituloVisible(property) || addr}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                )}
                {/* Badges como en /propiedades: operación (color) + tipo (blanco) */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  {op && (
                    <span
                      className="px-3.5 py-2 text-[12px] font-semibold leading-none rounded-full text-white font-raleway"
                      style={{ background: operationBadgeColor(operacion) }}
                    >
                      {op}
                    </span>
                  )}
                  {typeName && (
                    <span className="px-3.5 py-2 text-[12px] font-semibold leading-none rounded-full bg-white/90 text-gray-900 font-raleway backdrop-blur-[2px]">
                      {typeName}
                    </span>
                  )}
                </div>
              </div>

              {/* Info — debajo de la foto */}
              <div className="p-4">
                <p className="text-gray-900 font-black text-xl font-numeric leading-none mb-2">
                  {price}
                </p>
                {specsBits.length > 0 && (
                  <p className="text-gray-600 text-sm mb-2 font-poppins">
                    {specsBits.join(' · ')}
                  </p>
                )}
                <h3 className="text-gray-900 text-sm font-semibold line-clamp-2 leading-snug mb-2 font-raleway">
                  {tituloVisible(property) || addr}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-[#1A5C38]" />
                  <span className="truncate">
                    {direccion}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
