'use client'

import Link from 'next/link'
import { Download, MessageCircle, FileText } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface Props {
  slug: string
  nombre: string
  planoUrl: string | null
}

export default function BarrioDescargas({ slug, nombre, planoUrl }: Props) {
  const waText = `Hola SI, ¿me pasan el plano de ${nombre}?`
  const waUrl = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
      <header className="mb-12 flex flex-col items-start gap-4 border-b border-[rgba(15,15,15,0.08)] pb-6 md:flex-row md:items-baseline md:justify-between md:gap-6">
        <h2 className="max-w-[720px] font-raleway text-[clamp(36px,4.5vw,56px)] font-light leading-[1.05] tracking-tight">
          Descargá el{' '}
          <span className="font-light italic text-[#8B7355]">plano.</span>
        </h2>
        <span className="whitespace-nowrap font-raleway text-[12px] italic uppercase tracking-[0.3em] text-[#8B7355]">
          Material de planificación
        </span>
      </header>

      <div className="max-w-[720px]">
        <div className="flex flex-col gap-5 rounded-sm border border-[rgba(15,15,15,0.1)] bg-white p-6 md:flex-row md:items-center md:p-7">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm bg-[#1A5C38]/8 text-[#1A5C38]">
            <FileText className="h-6 w-6" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <h3 className="font-raleway text-[20px] font-medium leading-tight text-[#0F0F0F]">
              Plano del barrio
            </h3>
            <p className="mt-1 text-[14px] leading-snug text-[#6B6B6B]">
              {planoUrl
                ? `PDF · masterplan de ${nombre} con lotes, amenities y manzaneo.`
                : `Pedí el plano de ${nombre} por WhatsApp — te lo pasamos al toque.`}
            </p>
          </div>

          {planoUrl ? (
            <Link
              href={planoUrl}
              target="_blank"
              rel="noopener"
              download
              onClick={() =>
                trackEvent('barrios_descarga_plano', { slug, kind: 'pdf' })
              }
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-[#0F0F0F] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#1A5C38]"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Descargar PDF
            </Link>
          ) : (
            <Link
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('barrios_descarga_plano', { slug, kind: 'whatsapp-fallback' })
              }
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-[rgba(15,15,15,0.18)] bg-white px-5 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[#0F0F0F] transition hover:border-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Pedir por WhatsApp
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
