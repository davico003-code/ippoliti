export default function HeroVideoNosotros() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-nosotros-poster.webp"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-nosotros.webm" type="video/webm" />
        <source src="/videos/hero-nosotros.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
