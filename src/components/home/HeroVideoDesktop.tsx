'use client'

export default function HeroVideoDesktop() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      {/* Sources acotados a >=768px: este hero está oculto en mobile (hidden
          md:block) pero display:none NO evita la descarga de <picture> — sin
          el piso, mobile bajaba medium_2x (905 KB) que jamás mostraba. En
          <768 no matchea ningún source y cae al <img> (small, 150 KB). */}
      <picture className="absolute inset-0 block h-full w-full">
        <source
          srcSet="/images/hero/home-architecture-medium.webp, /images/hero/home-architecture-medium_2x.webp 2x"
          media="(min-width: 768px) and (max-width: 1068px)"
          type="image/webp"
        />
        <source
          srcSet="/images/hero/home-architecture-large.webp, /images/hero/home-architecture-large_2x.webp 2x"
          media="(min-width: 1069px)"
          type="image/webp"
        />
        <img
          src="/images/hero/home-architecture-small.webp"
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
          loading="eager"
        />
      </picture>
    </div>
  )
}
