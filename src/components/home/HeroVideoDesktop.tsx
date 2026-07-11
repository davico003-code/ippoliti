'use client'

export default function HeroVideoDesktop() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source
          srcSet="/images/hero/home-architecture-medium.webp, /images/hero/home-architecture-medium_2x.webp 2x"
          media="(max-width: 1068px)"
          type="image/webp"
        />
        <source
          srcSet="/images/hero/home-architecture-large.webp, /images/hero/home-architecture-large_2x.webp 2x"
          media="(min-width: 0px)"
          type="image/webp"
        />
        <img
          src="/images/hero/home-architecture-large.webp"
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
