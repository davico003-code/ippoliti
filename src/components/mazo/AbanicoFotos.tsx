'use client'

import Image from 'next/image'
import { type PosicionLogo, estiloSinLogo } from '@/lib/feed-en-red'

/** Hasta 3 fotos en abanico ("No pierdas tus elegidas" y ♥ N). */
export function AbanicoFotos({ fotos }: { fotos: { src: string | null; logo?: PosicionLogo | null }[] }) {
  const tres = fotos.filter((f) => f.src).slice(-3)
  const giros = tres.length === 1 ? [0] : tres.length === 2 ? [-7, 7] : [-10, 0, 10]
  return (
    <div className="relative mx-auto h-[118px] w-[210px]" aria-hidden="true">
      {tres.map((f, i) => (
        <div
          key={`${f.src}-${i}`}
          className="absolute left-1/2 top-1 h-[108px] w-[84px] overflow-hidden rounded-2xl border-[3px] border-white bg-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          style={{ transform: `translateX(calc(-50% + ${(i - (tres.length - 1) / 2) * 52}px)) rotate(${giros[i]}deg)`, zIndex: i === Math.floor(tres.length / 2) ? 2 : 1 }}
        >
          <Image src={f.src!} alt="" fill sizes="84px" className="object-cover" style={estiloSinLogo(f.logo)} />
        </div>
      ))}
    </div>
  )
}
