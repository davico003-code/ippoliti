const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

const ITEMS = [
  {
    n: '159',
    label: 'Lotes residenciales',
    desc: 'Superficie promedio desde 450 m². La calma que buscás con la conexión que necesitás.',
  },
  {
    n: '21',
    label: 'Lotes comerciales',
    desc: 'Superficie promedio 630 m², al frente sobre Ruta 9 con dársenas de estacionamiento.',
  },
  {
    n: '180',
    label: 'Lotes totales',
    desc: 'Pavimento, forestación planificada y servicios subterráneos para vivir e invertir.',
  },
]

export default function SeccionMasterplan() {
  return (
    <section className="relative overflow-hidden bg-[#0F3F26] px-5 py-20 text-white md:px-6 md:py-[120px]">
      {/* Blobs decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 h-[460px] w-[460px] opacity-[0.18]"
        style={{ background: '#2a7849', borderRadius: '47% 53% 62% 38% / 42% 56% 44% 58%', transform: 'rotate(-15deg)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-[400px] w-[400px] opacity-[0.08]"
        style={{ background: '#B8935A', borderRadius: '63% 37% 41% 59% / 50% 44% 56% 50%', transform: 'rotate(25deg)' }}
      />

      <div className="relative mx-auto max-w-[1180px]">
        <p className="uppercase text-[#D4B384]" style={{ fontFamily: RALEWAY, fontWeight: 500, letterSpacing: '0.24em', fontSize: 13 }}>
          Masterplan
        </p>
        <h2
          className="mb-20 mt-5 max-w-[680px]"
          style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(36px, 4.5vw, 54px)', lineHeight: 1.12 }}
        >
          180 lotes con trazado urbano moderno, calles amplias y espacios verdes.
        </h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {ITEMS.map((it) => (
            <div key={it.label} className="border-t border-white/[0.18] pt-8">
              <p style={{ fontFamily: RALEWAY, fontWeight: 200, fontSize: 'clamp(72px, 9vw, 128px)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {it.n}
              </p>
              <p className="mt-3 uppercase text-[#D4B384]" style={{ fontWeight: 500, letterSpacing: '0.14em', fontSize: 13 }}>
                {it.label}
              </p>
              <p className="mt-3 text-[14px] leading-[1.5] text-white/75">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
