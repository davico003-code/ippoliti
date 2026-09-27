// "Nuestra selección" con tarjetas grandes: grilla de 3 en compu y una debajo
// de la otra en celular (4 en celular, 6 en compu). La foto manda: 4:3, con la
// operación arriba, "SI Selección · tipo" abajo y el precio grande debajo.
// Conserva lo de las tarjetas anteriores: video/me gusta, "Oportunidad ·
// Consultanos" y el destaque del día de partido.

import Link from 'next/link'
import Image from 'next/image'
import CardMediaButtons from '@/components/CardMediaButtons'
import { esDiaDePartido } from '@/lib/mundial'
import {
  getFeaturedProperties, getPropertyCount, generatePropertySlug, getMainPhoto, formatPrice,
  getOperationType, operationBadgeColor, getRoofedArea, getLotSurface, isLand, isMonoambiente,
  esOportunidadConsultanos, propertyTypeLabelById, tituloVisible, type TokkoProperty,
} from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'
import EncabezadoSeccion from './EncabezadoSeccion'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const VERDE = '#1A5C38'

function datos(p: TokkoProperty): string[] {
  const out: string[] = []
  const land = isLand(p)
  const dorm = p.suite_amount ?? p.room_amount
  if (!land && isMonoambiente(p)) out.push('Monoambiente')
  else if (!land && dorm) out.push(`${dorm} dorm`)
  if (!land && p.bathroom_amount) out.push(`${p.bathroom_amount} baño${p.bathroom_amount > 1 ? 's' : ''}`)
  const cub = getRoofedArea(p)
  if (cub) out.push(`${cub.toLocaleString('es-AR')} m²`)
  const lote = getLotSurface(p)
  if (lote && (land || lote !== cub)) out.push(`${lote.toLocaleString('es-AR')} m²${land ? '' : ' lote'}`)
  return out
}

function Tarjeta({ p, i, destacada, prioridad }: { p: TokkoProperty; i: number; destacada: boolean; prioridad: boolean }) {
  const foto = getMainPhoto(p)
  const op = getOperationType(p)
  const tipo = propertyTypeLabelById(p.type?.id)
  const direccion = formatDireccionCompleta(p, p.fake_address || p.address, ' · ')
  return (
    <Link
      href={`/propiedades/${generatePropertySlug(p)}`}
      className={`revela group block ${i >= 4 ? 'hidden sm:block' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100"
        style={{ boxShadow: destacada ? '0 0 0 2px #75AADB, 0 0 0 6px rgba(117,170,219,0.22)' : undefined }}
      >
        {foto ? (
          <Image
            src={foto}
            alt={tituloVisible(p) || direccion}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            priority={prioridad && i === 0}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">Sin foto</div>
        )}
        {op && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase leading-none tracking-[0.12em]" style={{ color: operationBadgeColor(op), fontFamily: RALEWAY }}>
            {op}
          </span>
        )}
        {destacada ? (
          <span className="absolute right-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: '#75AADB', color: '#0d3a5c', fontFamily: POPPINS }}>
            ★ La jugada del partido
          </span>
        ) : (
          <CardMediaButtons propertyId={p.id} size={38} className="absolute right-3 top-3" />
        )}
        <span className="absolute bottom-0 left-0 rounded-tr-2xl px-4 py-2 text-[12px] font-bold text-white" style={{ background: 'rgba(17,17,17,.88)', fontFamily: RALEWAY }}>
          SI Selección{tipo ? ` · ${tipo}` : ''}
        </span>
      </div>
      {esOportunidadConsultanos(p.id) ? (
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-900" style={{ background: '#fbce07', fontFamily: POPPINS }}>Oportunidad</span>
          <span className="rounded-full px-3.5 py-1.5 text-[14px] font-bold text-white" style={{ background: VERDE, fontFamily: POPPINS }}>Consultanos →</span>
        </div>
      ) : (
        <p className="font-numeric mt-4 text-[24px] font-semibold tracking-[-0.02em] text-gray-900" style={{ fontFamily: POPPINS }}>{formatPrice(p)}</p>
      )}
      <p className="mt-1 truncate text-[15px] font-semibold text-gray-800" style={{ fontFamily: RALEWAY }}>{direccion}</p>
      {datos(p).length > 0 && (
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500" style={{ fontFamily: RALEWAY }}>{datos(p).join('  ·  ')}</p>
      )}
    </Link>
  )
}

// `prioridad`: precarga la primera foto (solo en el árbol de celular, donde
// la sección queda casi en la primera pantalla).
export default async function DestacadasGrandes({ prioridad = false }: { prioridad?: boolean }) {
  let props: TokkoProperty[] = []
  let total = 0
  try { props = await getFeaturedProperties(6) } catch { /* feed caído: queda el botón */ }
  try { total = await getPropertyCount() } catch { /* sin total */ }
  const partido = esDiaDePartido()

  return (
    <section className="bg-white px-5 pb-14 pt-10 md:px-0 md:pb-20 md:pt-14">
      {/* Mismo margen que el resto de la home: 1200 px con 24 px adentro. */}
      <div className="mx-auto max-w-[1200px] md:px-6">
        <EncabezadoSeccion eyebrow="Propiedades" titulo="Nuestra selección" bajada="Elegidas con criterio, no por algoritmo." />
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p, i) => <Tarjeta key={p.id} p={p} i={i} destacada={partido && i === 0} prioridad={prioridad} />)}
        </div>
        <div className="mt-10">
          <Link href="/propiedades" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90" style={{ background: VERDE, fontFamily: RALEWAY, textDecoration: 'none' }}>
            Ver todas las propiedades{total ? ` (${total})` : ''}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
