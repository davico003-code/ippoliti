// Fila "Temporarios" de la home (David, 25-sep-2026): fondo ARENA con sol como
// distintivo, sello "Temporario" sobre la foto, para cuántas personas, precio
// quincena | mes, cuadro de quincenas libres de la temporada y comodidades.
// Solo aparece si hay al menos un temporario publicado (nunca una fila vacía).
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Sun, Clock, ArrowRight, Users } from 'lucide-react'
import HorizontalCarousel from '@/components/HorizontalCarousel'
import DisponibilidadTemporada from '@/components/temporarios/DisponibilidadTemporada'
import { generatePropertySlug, getMainPhoto, tituloVisible } from '@/lib/tokko'
import { comodidadesTemporario } from '@/lib/temporarios'
import { cargarTemporarios, esTemporadaVerano, type Temporario } from '@/lib/temporarios-data'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const ARENA = '#FBF3E3'
const SOL = '#EFD9AE'
const TINTA = '#2F2418'
const SUB = '#6b5a3e'

// Paleta CAFÉ sobre el arena (elegida por David, 25-sep): todo en tonos tierra,
// sin naranja ni verde compitiendo. Sello café con sol dorado.
const PALETA = {
  sello: TINTA, selloTexto: ARENA, selloIcono: '#E8C27A',
  precioFondo: '#F5ECDC', precioBorde: '#E6D7BC', precioLabel: '#8A6A3F',
  accion: TINTA,
}
type Paleta = typeof PALETA

function Sello({ paleta, children }: { paleta: Paleta; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
      style={{ background: paleta.sello, color: paleta.selloTexto, fontFamily: POPPINS, boxShadow: '0 1px 4px rgba(47,36,24,0.18)' }}
    >
      <Sun className="w-3.5 h-3.5" style={{ color: paleta.selloIcono }} aria-hidden /> {children}
    </span>
  )
}

function Tarjeta({ property, condiciones: c, paleta }: Temporario & { paleta: Paleta }) {
  const foto = getMainPhoto(property)
  const titulo = tituloVisible(property) || property.address
  const zona = property.location?.name || property.location?.short_location || ''
  const dorm = property.suite_amount || 0
  const banos = property.bathroom_amount || 0
  const comodidades = comodidadesTemporario(c, property.tags ?? [], property.parking_lot_amount || 0)
  const datos = [
    c.personas ? `Hasta ${c.personas} persona${c.personas === '1' ? '' : 's'}` : null,
    dorm > 0 ? `${dorm} dorm.` : null,
    banos > 0 ? `${banos} baño${banos > 1 ? 's' : ''}` : null,
  ].filter(Boolean)

  return (
    <Link
      href={`/propiedades/${generatePropertySlug(property)}?operacion=temporario`}
      className="group flex-shrink-0 snap-start w-[84vw] max-w-[350px] md:w-[330px] bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(47,36,24,0.08), 0 8px 24px rgba(47,36,24,0.08)', textDecoration: 'none' }}
    >
      <div className="relative aspect-[4/3] bg-[#efe6d4] overflow-hidden">
        {foto && (
          <Image src={foto} alt={titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 84vw, 330px" />
        )}
        <span className="absolute top-3 left-3">
          <Sello paleta={paleta}>Temporario</Sello>
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          <h3 className="line-clamp-1" style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{titulo}</h3>
          {zona && (
            <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-500" style={{ margin: 0 }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> {zona}
            </p>
          )}
          {datos.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: TINTA, margin: '6px 0 0' }}>
              <Users className="w-4 h-4 flex-shrink-0" aria-hidden /> {datos.join(' · ')}
            </p>
          )}
        </div>

        {c.precios.length > 0 ? (
          <div
            className="grid rounded-xl overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${c.precios.length}, 1fr)`, background: paleta.precioFondo, boxShadow: `inset 0 0 0 1px ${paleta.precioBorde}` }}
          >
            {c.precios.map((p, i) => (
              <div key={p.periodo} className="px-3 py-2.5" style={i > 0 ? { borderLeft: `1px solid ${paleta.precioBorde}` } : undefined}>
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: paleta.precioLabel }}>
                  {p.periodo === 'quincena' ? 'Quincena' : 'Mes'}
                </span>
                <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 16, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{p.texto}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="font-bold" style={{ color: paleta.accion }}>Consultar valor</span>
        )}

        <DisponibilidadTemporada alquiladas={c.alquiladas} />

        {comodidades.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" style={{ margin: 0, padding: 0, listStyle: 'none' }} aria-label="Comodidades">
            {comodidades.slice(0, 4).map((x) => (
              <li key={x} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: '#F5F1EA', color: '#44403C' }}>{x}</li>
            ))}
            {comodidades.length > 4 && (
              <li className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: '#F5F1EA', color: '#78716C' }}>+{comodidades.length - 4}</li>
            )}
          </ul>
        )}

        {c.estadiaMinima && (
          <p className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-gray-700" style={{ margin: 0 }}>
            <Clock className="w-3.5 h-3.5" aria-hidden /> Mínimo {c.estadiaMinima}
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
  const paleta = PALETA
  const idTitulo = 'temporarios-home'

  return (
    <section className="relative overflow-hidden" style={{ background: ARENA }} aria-labelledby={idTitulo}>
      {/* Sol de fondo: el distintivo de la fila */}
      <svg aria-hidden className="absolute -top-16 -right-16 w-64 h-64 md:w-80 md:h-80 pointer-events-none" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="46" fill={SOL} opacity="0.55" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="97" y="18" width="6" height="26" rx="3" fill={SOL} opacity="0.5" transform={`rotate(${i * 30} 100 100)`} />
        ))}
      </svg>

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-10">
        <Sello paleta={paleta}>{verano ? 'Temporada de verano' : 'Alquileres temporarios'}</Sello>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 id={idTitulo} className="text-2xl md:text-3xl tracking-tight" style={{ fontFamily: RALEWAY, fontWeight: 800, color: TINTA, lineHeight: 1.2, margin: 0 }}>
              Por quincena o por mes
            </h2>
            <p className="mt-1 text-sm" style={{ fontFamily: RALEWAY, color: SUB, margin: 0 }}>
              Mirá qué quincenas quedan libres en diciembre, enero y febrero.
            </p>
          </div>
          <Link
            href="/alquileres-temporarios"
            className="hidden md:inline-flex items-center gap-1.5 flex-shrink-0 font-semibold text-sm"
            style={{ color: paleta.accion, fontFamily: RALEWAY, textDecoration: 'none' }}
          >
            Ver todos <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <HorizontalCarousel className="mt-4 -mx-5 px-5 md:mx-0 md:px-1 flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 pb-3 scrollbar-none">
          {temporarios.map((t) => (
            <Tarjeta key={t.property.id} {...t} paleta={paleta} />
          ))}
          <Link
            href="/alquileres-temporarios"
            className="flex-shrink-0 self-center snap-start inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm"
            style={{ background: paleta.accion, color: '#FFFFFF', fontFamily: RALEWAY, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Ver todos los temporarios <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </HorizontalCarousel>
      </div>
    </section>
  )
}
