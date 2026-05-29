'use client'

interface HeroTour360Props {
  url: string
  titulo?: string
}

export default function HeroTour360({ url, titulo }: HeroTour360Props) {
  return (
    <section className="relative w-full overflow-hidden bg-[#0F3F26] h-[70vh] min-h-[460px] md:h-[92vh] md:min-h-[580px] md:max-h-[900px]">
      <iframe
        src={url}
        title={titulo ?? 'Tour virtual 360°'}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr; xr-spatial-tracking; autoplay; camera; microphone"
        allowFullScreen
      />
      {/* Badge inferior — no intercepta clicks del tour */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(26,92,56,0.92)] px-[22px] py-[10px] shadow-lg backdrop-blur-md">
        <span className="font-poppins text-[13px] font-medium uppercase tracking-[0.08em] text-white">
          Tour Virtual 360°
        </span>
      </div>
    </section>
  )
}
