// Cierre de la landing: la frase que empuja a no esperar, el plan de pago por
// tipo de lote y los tres caminos (plano, WhatsApp, teléfono), con una imagen
// grande de una pareja mirando su lote (ilustrativa).
//
// WhatsApp va por /w/distritoroldan (22-oct-2026): el link de Hilo que reparte
// la consulta entre los agentes y deja anotado el toque; con pl=landing se
// distingue de los anuncios. El camino principal sigue siendo el plano, donde
// el pedido por lote entra a Hilo con todos sus datos.

import Image from '@/components/Imagen'
import Link from 'next/link'
import { ArrowRight, Map as MapIcon, MessageCircle, Phone } from 'lucide-react'
import { FinanciacionTarjetas } from './FinanciacionLineas'

export default function SeccionCtaFinanciacion() {
  return (
    <section data-sin-fab className="relative isolate overflow-hidden bg-dr-noche text-white">
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative order-2 px-6 py-16 sm:px-10 md:py-24 lg:order-1 lg:px-14 lg:py-28 xl:pl-[max(3.5rem,calc((100vw-1320px)/2+2rem))]">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-oro">Financiación propia</p>
          <h2 className="mt-5 max-w-[16ch] text-balance text-[clamp(36px,5vw,68px)] font-extrabold leading-[1] tracking-[-0.035em] text-dr-claro">
            El que espera a verlo terminado, llega tarde.
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-8 text-white/75">
            Elegí tu lote en el plano: cada uno muestra su precio, su entrega y su cuota. Y si lo querés ver en persona, te mostramos
            el predio los sábados.
          </p>

          <div className="mt-9 max-w-[620px]">
            <FinanciacionTarjetas />
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {/* 06-sep-2026: el camino principal es el plano: ahí se elige el
                lote y el pedido rota entre todos los agentes. */}
            <Link
              href="/distrito-roldan-precios"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#B35E21] px-7 text-base font-bold text-white shadow-[0_10px_30px_rgba(179,94,33,.4)] transition-colors hover:bg-[#9d4f18]"
            >
              <MapIcon className="h-5 w-5" aria-hidden />
              Ver lotes y precios
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="/w/distritoroldan?pl=landing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/[0.06] px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/70"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Escribinos por WhatsApp
            </a>
            <a
              href="tel:+5493413340916"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/70"
            >
              <Phone className="h-5 w-5" aria-hidden />
              <span className="font-numeric">(341) 334-0916</span>
            </a>
          </div>
        </div>

        <div className="relative order-1 min-h-[420px] sm:min-h-[560px] lg:order-2 lg:min-h-full">
          <Image
            src="/images/distrito-roldan/cierre-lote-ilustrativa.webp"
            alt="Una pareja de pie en un lote de Distrito Roldán al atardecer, mirando hacia la calle nueva. Imagen ilustrativa"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[50%_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dr-noche via-transparent to-transparent lg:bg-gradient-to-r" />
          <span className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            Imagen ilustrativa
          </span>
        </div>
      </div>
    </section>
  )
}
