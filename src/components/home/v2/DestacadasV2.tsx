// "Propiedades destacadas" en grilla de 3 (como SERHANT): foto con la
// operación arriba y la etiqueta "SI Selección" abajo, precio grande y datos
// en una línea. Datos reales del inventario.

import Link from 'next/link'
import Image from 'next/image'
import {
  getFeaturedProperties, generatePropertySlug, getMainPhoto, formatPrice, getOperationType,
  getRoofedArea, getLotSurface, isLand, propertyTypeLabelById, type TokkoProperty,
} from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'
import { Flecha, POPPINS, RALEWAY, Titulo, VERDE } from './ui'

function datos(p: TokkoProperty): string[] {
  const out: string[] = []
  const land = isLand(p)
  const dorm = p.suite_amount ?? p.room_amount
  if (!land && dorm) out.push(`${dorm} dorm`)
  if (!land && p.bathroom_amount) out.push(`${p.bathroom_amount} baño${p.bathroom_amount > 1 ? 's' : ''}`)
  const cub = getRoofedArea(p)
  if (cub) out.push(`${cub} m²`)
  const lote = getLotSurface(p)
  if (lote && lote !== cub) out.push(`${lote.toLocaleString('es-AR')} m² ${land ? '' : 'lote'}`.trim())
  return out
}

export default async function DestacadasV2() {
  let props: TokkoProperty[] = []
  try { props = await getFeaturedProperties(6) } catch { /* feed caído: queda el botón */ }
  return (
    <section className="bg-white px-5 pb-20 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <Titulo bajada="Elegidas con criterio, no por algoritmo: casas, departamentos y terrenos que recomendamos hoy.">Propiedades destacadas</Titulo>
        <div className="mt-9 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {props.map(p => {
            const op = getOperationType(p)
            const dir = formatDireccionCompleta(p, p.fake_address || p.address, ' · ')
            const tipo = propertyTypeLabelById(p.type?.id)
            return (
              <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="revela group block" style={{ textDecoration: 'none' }}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                  {getMainPhoto(p) && <Image src={getMainPhoto(p)!} alt={p.publication_title || dir} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}
                  {op && <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: VERDE, fontFamily: RALEWAY }}>{op}</span>}
                  <span className="absolute bottom-0 left-0 rounded-tr-2xl px-4 py-2 text-[12px] font-bold text-white" style={{ background: 'rgba(17,17,17,.88)', fontFamily: RALEWAY }}>SI Selección{tipo ? ` · ${tipo}` : ''}</span>
                </div>
                <p className="font-numeric mt-4 text-[24px] font-semibold tracking-[-0.02em] text-gray-900" style={{ fontFamily: POPPINS }}>{formatPrice(p)}</p>
                <p className="mt-1 truncate text-[15px] font-semibold text-gray-800" style={{ fontFamily: RALEWAY }}>{dir}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500" style={{ fontFamily: RALEWAY }}>{datos(p).join('  ·  ')}</p>
              </Link>
            )
          })}
        </div>
        <div className="mt-10">
          <Link href="/propiedades" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-extrabold text-white" style={{ background: VERDE, fontFamily: RALEWAY, textDecoration: 'none' }}>
            Ver todas las propiedades <Flecha />
          </Link>
        </div>
      </div>
    </section>
  )
}
