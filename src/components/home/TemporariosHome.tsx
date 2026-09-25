// Fila "Temporarios" de la home (David, 25-sep-2026): tiene que distinguirse del
// resto → banda color arena con sol, sello amarillo "Temporario" sobre la foto
// y barra de precios partida quincena | mes. Solo aparece si hay al menos un
// temporario publicado (nunca una fila vacía).
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Sun, Clock, ArrowRight } from 'lucide-react'
import HorizontalCarousel from '@/components/HorizontalCarousel'
import { generatePropertySlug, getMainPhoto, tituloVisible } from '@/lib/tokko'
import { cargarTemporarios, esTemporadaVerano, type Temporario } from '@/lib/temporarios-data'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const ARENA = '#FBF3E3'
const SOL = '#F4B63F'
const TINTA = '#3B2A12'

function Tarjeta({ property, condiciones: c }: Temporario) {
  const foto = getMainPhoto(property)
  const titulo = tituloVisible(property) || property.address
  const zona = property.location?.name || property.location?.short_location || ''
  const extras = c.incluye.length > 3 ? ` +${c.incluye.length - 3}` : ''

  return (
    <Link
      href={`/propiedades/${generatePropertySlug(property)}`}
      className="group flex-shrink-0 snap-start w-[82vw] max-w-[340px] md:w-[320px] bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(59,42,18,0.08), 0 8px 24px rgba(59,42,18,0.08)', textDecoration: 'none' }}
    >
      <div className="relative aspect-[4/3] bg-[#efe6d4] overflow-hidden">
        {foto && (
          <Image
            src={foto}
            alt={titulo}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 82vw, 320px"
          />
        )}
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: SOL, color: TINTA, fontFamily: POPPINS }}
        >
          <Sun className="w-3.5 h-3.5" aria-hidden /> Temporario
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          <h3 className="line-clamp-1" style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>
            {titulo}
          </h3>
          {zona && (
            <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-500" style={{ margin: 0 }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> {zona}
            </p>
          )}
        </div>

        {c.precios.length > 0 ? (
          <div className="grid rounded-xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${c.precios.length}, 1fr)`, background: '#EAF4EE' }}>
            {c.precios.map((p, i) => (
              <div key={p.periodo} className="px-3 py-2.5" style={i > 0 ? { borderLeft: '1px solid #cfe3d7' } : undefined}>
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>
                  {p.periodo === 'quincena' ? 'Quincena' : 'Mes'}
                </span>
                <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 16, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                  {p.texto}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="font-bold" style={{ color: GREEN }}>Consultar valor</span>
        )}

        {(c.estadiaMinima || c.incluye.length > 0) && (
          <p className="mt-auto text-[12.5px] text-gray-600 line-clamp-2" style={{ margin: 0 }}>
            {c.estadiaMinima && (
              <span className="inline-flex items-center gap-1 mr-2 font-semibold text-gray-800">
                <Clock className="w-3.5 h-3.5" aria-hidden /> Mín. {c.estadiaMinima}
              </span>
            )}
            {c.incluye.length > 0 && <>Incluye {c.incluye.slice(0, 3).join(', ').toLowerCase()}{extras}</>}
          </p>
        )}
      </div>
    </Link>
  )
}

export default async function TemporariosHome() {
  const temporarios = await cargarTemporarios(12)
  if (temporarios.length === 0) return null
  const verano = esTemporadaVerano()

  return (
    <section className="relative overflow-hidden" style={{ background: ARENA }} aria-labelledby="temporarios-home">
      {/* Sol de fondo: el distintivo de la fila */}
      <svg
        aria-hidden
        className="absolute -top-16 -right-16 w-64 h-64 md:w-80 md:h-80 pointer-events-none"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="46" fill={SOL} opacity="0.35" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="97" y="18" width="6" height="26" rx="3" fill={SOL} opacity="0.3" transform={`rotate(${i * 30} 100 100)`} />
        ))}
      </svg>

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-10">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: SOL, color: TINTA, fontFamily: POPPINS }}
        >
          <Sun className="w-3.5 h-3.5" aria-hidden /> {verano ? 'Temporada de verano' : 'Alquileres temporarios'}
        </span>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2
              id="temporarios-home"
              className="text-2xl md:text-3xl tracking-tight"
              style={{ fontFamily: RALEWAY, fontWeight: 800, color: TINTA, lineHeight: 1.2, margin: 0 }}
            >
              Por quincena o por mes
            </h2>
            <p className="mt-1 text-sm" style={{ fontFamily: RALEWAY, color: '#6b5a3e', margin: 0 }}>
              Valor y condiciones a la vista: depósito, estadía mínima, horarios y qué incluye.
            </p>
          </div>
          <Link
            href="/alquileres-temporarios"
            className="hidden md:inline-flex items-center gap-1.5 flex-shrink-0 font-semibold text-sm"
            style={{ color: GREEN, fontFamily: RALEWAY, textDecoration: 'none' }}
          >
            Ver todos <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <HorizontalCarousel className="mt-4 -mx-5 px-5 md:mx-0 md:px-1 flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 pb-3 scrollbar-none">
          {temporarios.map((t) => (
            <Tarjeta key={t.property.id} {...t} />
          ))}
          <Link
            href="/alquileres-temporarios"
            className="flex-shrink-0 self-center snap-start inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm text-white"
            style={{ background: GREEN, fontFamily: RALEWAY, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Ver todos los temporarios <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </HorizontalCarousel>
      </div>
    </section>
  )
}
