'use client'

import Image from 'next/image'

export default function HeroVideoDesktop() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <Image
        src="/images/hero/portada-arquitectura-terraza.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}
