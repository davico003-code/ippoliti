'use client'

interface HeroTour360Props {
  url: string
  titulo?: string
}

export default function HeroTour360({ url, titulo }: HeroTour360Props) {
  return (
    <section className="relative w-full overflow-hidden h-[60vh] min-h-[420px] md:h-[80vh] md:min-h-[600px] md:max-h-[900px]">
      <iframe
        src={url}
        title={titulo ?? 'Tour virtual 360°'}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr; xr-spatial-tracking; autoplay; camera; microphone"
        allowFullScreen
      />
    </section>
  )
}
