// Panel del barrio privado en la ficha: aparece cuando la propiedad está en un
// barrio cerrado conocido (match por findBarrioForProperty). Card sutil pero con
// impacto — hero + tier + frase del broker — que linkea a /barrios-privados/[slug].

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Barrio } from '@/lib/barrios'

export default function BarrioPanel({ barrio }: { barrio: Barrio }) {
  const hero = barrio.imagenes?.hero
  // Solo fotos reales existentes. Varios barrios tienen hero ".svg" que es un
  // placeholder inexistente en /public → mostraría una imagen rota. En ese caso
  // usamos un fondo verde de marca.
  const hasPhoto = !!hero && /\.(jpe?g|png|webp|avif)$/i.test(hero)
  const tagline = barrio.miradaBroker?.titular
  const amenities = barrio.amenities?.slice(0, 5) ?? []

  return (
    <section id="barrio" className="scroll-mt-40">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">Sobre el barrio</p>

      <Link
        href={`/barrios-privados/${barrio.slug}`}
        className="group block relative overflow-hidden rounded-2xl aspect-[16/8] shadow-sm ring-1 ring-black/5"
        style={{ background: 'linear-gradient(135deg, #1A5C38 0%, #0F3A23 100%)' }}
      >
        {hasPhoto && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt={barrio.nombre}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ background: '#1A5C38' }}
          >
            Barrio {barrio.tier}
          </span>
          <h3 className="mt-3 text-2xl md:text-[1.7rem] font-black text-white leading-tight">{barrio.nombre}</h3>
          {tagline && <p className="mt-1.5 max-w-xl text-sm text-white/85 line-clamp-2">{tagline}</p>}
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-all group-hover:gap-2.5">
            Conocé el barrio
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map(a => (
            <span key={a.id} className="rounded-full border border-gray-200 px-3 py-1.5 text-[13px] text-gray-600">
              {a.label}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
