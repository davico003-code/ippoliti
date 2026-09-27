// Banda oscura premium (el "SERHANT. Signature" de la home de SERHANT):
// Colección Hausing con foto grande y tres casas con el precio sobre la foto.
// Las casas salen de la lista de la colección; si una se despublica, se saltea.

import Link from 'next/link'
import Image from 'next/image'
import { HAUSING_PROPERTY_IDS, fotoPro } from '@/lib/hausing'
import { getPropertyById, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea, type TokkoProperty } from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'
import { Flecha, POPPINS, RALEWAY } from './ui'

export default async function PremiumV2() {
  const casas = (await Promise.all(HAUSING_PROPERTY_IDS.slice(0, 5).map(id => getPropertyById(id).catch(() => null))))
    .filter((p): p is TokkoProperty => !!p)
    .slice(0, 3)

  return (
    <section className="bg-[#0b0b0c] text-white">
      <div className="relative h-[560px] overflow-hidden md:h-[640px]">
        <Image src="/images/hausing/hero-poster.jpg" alt="Colección Hausing — casas premium de SI INMOBILIARIA en Funes" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(11,11,12,.25) 0%, rgba(11,11,12,.35) 50%, #0b0b0c 100%)' }} />
        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col items-center justify-end px-5 pb-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hausing-logo.svg" alt="Hausing" className="revela h-10 w-auto invert md:h-14" />
          <p className="revela mt-5 text-[12px] font-bold uppercase tracking-[0.3em] text-white/70" style={{ fontFamily: RALEWAY }}>Colección premium · SI INMOBILIARIA</p>
          <p className="revela mt-4 max-w-[640px] text-[18px] font-semibold leading-relaxed text-white/85 md:text-[21px]" style={{ fontFamily: RALEWAY }}>
            Casas de autor en Kentucky, Cadaqués, Vida y Don Mateo. Diseño, obra y financiación en dólares, en un solo lugar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-6 md:pb-24">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {casas.map(p => {
            const foto = getMainPhoto(p)
            const cub = getRoofedArea(p)
            return (
              <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="revela group relative block aspect-[4/5] overflow-hidden rounded-2xl" style={{ textDecoration: 'none' }}>
                {foto && <Image src={fotoPro(foto)} alt={p.publication_title || 'Casa Hausing'} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 55%)' }} />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="font-numeric text-[26px] font-semibold tracking-[-0.02em]" style={{ fontFamily: POPPINS }}>{formatPrice(p)}</p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-white/85" style={{ fontFamily: RALEWAY }}>{formatDireccionCompleta(p, p.fake_address || p.address, ' · ')}</p>
                  {cub && <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/60" style={{ fontFamily: RALEWAY }}>{cub} m² cubiertos</p>}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/hausing" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-extrabold text-gray-900" style={{ fontFamily: RALEWAY, textDecoration: 'none' }}>
            Ver la colección Hausing <Flecha />
          </Link>
        </div>
      </div>
    </section>
  )
}
