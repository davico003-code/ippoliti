import Image from 'next/image'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

// Pines de referencia posicionados de forma coherente con el plano del brochure.
const PINES = [
  { label: 'Autopista', top: '16%', left: '24%' },
  { label: 'Ruta Nacional A012', top: '70%', left: '18%' },
  { label: 'Funes', top: '78%', left: '64%' },
  { label: 'Ruta Nacional 9', top: '34%', left: '74%' },
]

export default function SeccionUbicacion() {
  return (
    <section className="bg-[#F4EFE5] px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-[680px] text-center">
          <p className="uppercase text-[#B8935A]" style={{ fontFamily: RALEWAY, fontWeight: 600, letterSpacing: '0.24em', fontSize: 12 }}>
            Ubicación
          </p>
          <h2
            className="mt-4 text-[#0F3F26]"
            style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(34px, 4.5vw, 52px)', lineHeight: 1.15 }}
          >
            A minutos de todo, en el corazón de Roldán.
          </h2>
        </div>

        {/* Mapa aéreo con pines */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/images/distrito-roldan/ubicacion-aerea.jpg"
            alt="Vista aérea de la ubicación de Distrito Roldán"
            fill
            sizes="(max-width: 1180px) 100vw, 1180px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(15,63,38,0.3), rgba(15,63,38,0.55))' }}
          />

          {/* Pin central */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="mb-1.5 h-2.5 w-2.5 rounded-full bg-[#B8935A] shadow" />
            <span className="rounded-full bg-[#1A5C38] px-[18px] py-2.5 font-poppins text-[13px] font-semibold text-white shadow-lg">
              Distrito Roldán
            </span>
          </div>

          {/* Pines de referencia */}
          {PINES.map((p) => (
            <div
              key={p.label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-[18px] py-2.5 shadow-md"
              style={{ top: p.top, left: p.left }}
            >
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#B8935A]" />
              <span className="font-poppins text-[12px] font-semibold text-[#0F3F26]">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
