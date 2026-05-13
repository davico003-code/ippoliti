import Image from 'next/image'
import type { Barrio } from '@/lib/barrios'

interface Props {
  barrio: Barrio
}

export default function BarrioMiradaBroker({ barrio }: Props) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[200px_1fr]">
      <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full bg-stone-200 ring-4 ring-white lg:mx-0">
        {/* TODO: subir foto real a /public/team/david-flores.jpg */}
        <Image
          src="/team/david-flores.jpg"
          alt="David Flores — broker"
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
          La mirada del broker
        </p>
        <h2 className="mb-4 font-raleway text-3xl font-semibold text-navy-700 md:text-4xl">
          {barrio.miradaBroker.titular}
        </h2>
        <p className="text-base leading-relaxed text-stone-700 md:text-lg">
          {barrio.miradaBroker.parrafo}
        </p>
        <p className="mt-6 text-sm text-stone-500">
          — David Flores, Mat. N° 0621
        </p>
      </div>
    </div>
  )
}
