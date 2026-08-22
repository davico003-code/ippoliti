'use client'

import Image from 'next/image'

export default function HeroVideoDesktop() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <Image
        src="/images/hero/home-architecture-large.webp"
        alt=""
        fill
        priority
        quality={72}
        sizes="(min-width: 768px) 100vw, 1px"
        className="object-cover"
      />
    </div>
  )
}
