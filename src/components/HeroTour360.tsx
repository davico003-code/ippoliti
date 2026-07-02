'use client'

interface HeroTour360Props {
  url: string
  titulo?: string
  /**
   * Recorte de la barra superior del sitio embebido, en px. distritoroldan360
   * dibuja su navbar (Plano/Sectores/…) sobre canvas y es cross-origin, así que
   * no se puede ocultar por dentro: se recorta subiendo el iframe dentro del
   * contenedor overflow-hidden. 0 = sin recorte.
   */
  cropTop?: number
  cropTopMobile?: number
  badge?: string | null
}

export default function HeroTour360({
  url,
  titulo,
  cropTop = 0,
  cropTopMobile,
  badge = 'Tour Virtual 360°',
}: HeroTour360Props) {
  const cropM = cropTopMobile ?? cropTop

  return (
    <section className="hero-tour360 relative w-full overflow-hidden bg-[#0F3F26] h-[70vh] min-h-[460px] md:h-[92vh] md:min-h-[580px] md:max-h-[900px]">
      <iframe
        src={url}
        title={titulo ?? 'Tour virtual 360°'}
        className="hero-tour360-frame border-0"
        allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr; xr-spatial-tracking; autoplay; camera; microphone"
        allowFullScreen
      />
      {badge && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(26,92,56,0.92)] px-[22px] py-[10px] shadow-lg backdrop-blur-md">
          <span className="font-poppins text-[13px] font-medium uppercase tracking-[0.08em] text-white">
            {badge}
          </span>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hero-tour360 { --crop: ${cropM}px; }
        @media (min-width: 768px) { .hero-tour360 { --crop: ${cropTop}px; } }
        .hero-tour360-frame {
          position: absolute;
          left: 0;
          top: calc(-1 * var(--crop));
          width: 100%;
          height: calc(100% + var(--crop));
        }
      `,
        }}
      />
    </section>
  )
}
