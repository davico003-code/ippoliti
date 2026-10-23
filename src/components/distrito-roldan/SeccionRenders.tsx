// Los dos tipos de lote, con su render en grande (22-oct-2026: antes iban a
// media columna; David pidió imágenes más grandes y llamativas). El residencial
// es el protagonista —es lo que se empuja— y va a lo ancho con el texto encima;
// el comercial va abajo, en dos columnas.

import Image from '@/components/Imagen'
import { ArrowRight } from 'lucide-react'

const RESIDENCIAL = {
  img: '/images/distrito-roldan/render-residencial.webp',
  alt: 'Render de una calle residencial de Distrito Roldán con luminarias, árboles y veredas',
  rasgos: ['Calles pavimentadas', 'Servicios subterráneos', 'Forestación planificada', 'Sin expensas'],
}

const COMERCIAL = {
  img: '/images/distrito-roldan/render-comercial.webp',
  alt: 'Render del área comercial de Distrito Roldán',
  galeria: [
    { img: '/images/distrito-roldan/galeria-comercial-01.webp', alt: 'Vista de los locales comerciales sobre Ruta 9 en Distrito Roldán' },
    { img: '/images/distrito-roldan/galeria-comercial-02.webp', alt: 'Dársenas de estacionamiento del área comercial de Distrito Roldán' },
  ],
}

export default function SeccionRenders() {
  return (
    // id="barrio": destino de "El barrio" en el menú del hero. Vive acá y no en
    // la galería de fotos, que se oculta cuando no hay fotos reales nuevas.
    <section id="barrio" className="bg-dr-fondo py-20 md:py-32">
      <div className="mx-auto max-w-[1320px] md:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-dr-noche md:rounded-[28px]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]">
            <Image src={RESIDENCIAL.img} alt={RESIDENCIAL.alt} fill sizes="(max-width: 1320px) 100vw, 1320px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--dr-noche)/.96)_0%,rgb(var(--dr-noche)/.78)_45%,rgb(var(--dr-noche)/.2)_75%,rgb(var(--dr-noche)/0)_90%)] sm:bg-[linear-gradient(0deg,rgb(var(--dr-noche)/.94)_0%,rgb(var(--dr-noche)/.62)_40%,rgb(var(--dr-noche)/0)_72%)]" />
            <span className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              Imagen ilustrativa
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <p className="inline-flex rounded-full bg-[#B35E21] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white sm:text-sm">
                Lotes residenciales
              </p>
              <h2 className="mt-4 max-w-[18ch] text-balance text-[clamp(34px,4.8vw,68px)] font-extrabold leading-[1] tracking-[-0.035em] text-dr-claro">
                La calma que buscás, con la conexión que necesitás.
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {RESIDENCIAL.rasgos.map((r) => (
                  <li key={r} className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md sm:text-sm">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 px-6 md:px-0 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="max-w-[62ch] text-pretty text-lg leading-8 text-dr-tinta/80">
            Pensados para vivir tranquilo: calles pavimentadas, forestación planificada y servicios subterráneos, en un barrio abierto y
            conectado con Roldán, Funes y Rosario.
          </p>
          <a
            href="#plano"
            className="inline-flex min-h-12 items-center gap-2 justify-self-start rounded-full border border-dr-tinta/30 px-6 text-sm font-bold text-dr-tinta transition-colors hover:border-dr-acento hover:text-dr-acento"
          >
            Ver los lotes en el masterplan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>

      {/* Comerciales: segundo plano, dos columnas. */}
      <div className="mx-auto mt-24 grid max-w-[1320px] items-center gap-10 px-6 md:mt-32 lg:grid-cols-[1.2fr_.8fr] lg:gap-16 lg:px-8">
        <div>
          <div className="relative aspect-[1672/941] overflow-hidden rounded-[20px]">
            <Image src={COMERCIAL.img} alt={COMERCIAL.alt} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
            <span className="absolute right-3 top-3 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              Imagen ilustrativa
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {COMERCIAL.galeria.map((g) => (
              <div key={g.img} className="relative aspect-[16/9] overflow-hidden rounded-[14px]">
                <Image src={g.img} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 380px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-etiqueta">Lotes comerciales</p>
          <h2 className="mt-4 text-balance text-[clamp(30px,3.6vw,48px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-dr-tinta">
            Con frente a Ruta 9 y dársenas de estacionamiento.
          </h2>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-7 text-dr-tinta/75">
            Al frente sobre Ruta Nacional 9, ideales para locales, oficinas o desarrollos de renta. Superficie promedio de 630 m²,
            con visibilidad y tránsito asegurado en una zona en plena expansión.
          </p>
          <a
            href="#plano"
            className="mt-7 inline-flex min-h-11 items-center border-b-2 border-dr-acento text-sm font-bold text-dr-tinta transition-colors hover:text-dr-acento"
          >
            Ver ubicación de los lotes
          </a>
        </div>
      </div>
    </section>
  )
}
