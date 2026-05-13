'use client'

import Link from 'next/link'
import type { Barrio } from '@/lib/barrios'
import BarrioImage from './BarrioImage'
import { trackEvent } from '@/lib/analytics'

const TIER_LABEL: Record<Barrio['tier'], { label: string; cls: string }> = {
  Premium: { label: 'Premium', cls: 'bg-gold-500 text-navy-900' },
  Consolidado: { label: 'Consolidado', cls: 'bg-brand-600 text-white' },
  'Consolidado con vida joven': { label: 'Consolidado · vida joven', cls: 'bg-[#3D8B5C] text-white' },
  'En desarrollo': { label: 'En desarrollo', cls: 'bg-white/90 text-navy-800' },
}

interface Props {
  barrio: Barrio
}

export default function BarrioHero({ barrio }: Props) {
  const tier = TIER_LABEL[barrio.tier]
  const waText = `Hola, me interesa ${barrio.nombre}. ¿Me pasan info actualizada?`
  const waUrl = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <BarrioImage
        src={barrio.imagenes.hero}
        nombre={barrio.nombre}
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 via-navy-900/40 to-navy-900/80" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-14 text-white">
        <span className={`mb-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${tier.cls}`}>
          {tier.label} · Funes
        </span>
        <h1 className="font-raleway text-4xl font-semibold leading-tight md:text-6xl">
          {barrio.nombreCompleto}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
          {barrio.miradaBroker.titular}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#lotes"
            className="rounded-lg bg-white px-6 py-3 font-raleway text-sm font-semibold text-brand-700 shadow-lg transition hover:scale-105"
          >
            Ver lotes
          </a>
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('barrios_whatsapp_click', { slug: barrio.slug, ubicacion: 'hero' })}
            className="rounded-lg border border-white/50 bg-white/10 px-6 py-3 font-raleway text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Hablar con asesor
          </Link>
        </div>
      </div>
    </section>
  )
}
