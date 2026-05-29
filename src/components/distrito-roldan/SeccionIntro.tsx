const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'
const MONTSERRAT = 'var(--font-montserrat), Montserrat, sans-serif'

const DATOS = [
  { label: 'Tipología', valor: 'Barrio Abierto' },
  { label: 'Estado', valor: 'En construcción' },
  { label: 'Financiación', valor: 'Entrega 30% + 24 cuotas fijas en dólares' },
  { label: 'Ubicación', valor: 'Ruta 9 y Andes — Roldán' },
]

export default function SeccionIntro() {
  return (
    <section className="bg-[#FAF7F2] px-6 py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        {/* Izquierda */}
        <div>
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#1A5C38] px-[14px] py-1.5 font-poppins text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
              Barrio Abierto
            </span>
            <span className="rounded-full bg-[#B8935A] px-[14px] py-1.5 font-poppins text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
              En construcción
            </span>
          </div>

          <h1
            className="text-[#0F3F26]"
            style={{ fontFamily: MONTSERRAT, fontWeight: 800, fontSize: 'clamp(48px, 7vw, 92px)', lineHeight: 0.98, letterSpacing: '-0.02em' }}
          >
            Distrito <em className="not-italic text-[#B8935A]">Roldán</em>
          </h1>

          <p
            className="mt-6 uppercase text-[#6b6b6b]"
            style={{ fontFamily: RALEWAY, fontWeight: 400, fontSize: 18, letterSpacing: '0.18em' }}
          >
            La evolución del desarrollo urbano
          </p>

          <p
            className="mt-10 max-w-[540px] border-l-2 border-[#B8935A] pl-6 text-[#3a3a3a]"
            style={{ fontFamily: RALEWAY, fontWeight: 300, fontStyle: 'italic', fontSize: 22, lineHeight: 1.5 }}
          >
            Un barrio abierto que combina vida residencial y un área comercial con infraestructura
            de alto nivel, en una zona ya consolidada de Roldán, sobre Ruta Nacional 9, a minutos
            de Funes y Rosario.
          </p>
        </div>

        {/* Derecha — card datos rápidos */}
        <div className="h-fit rounded-3xl border border-[#e8e3da] bg-white p-9 shadow-[0_4px_24px_rgba(15,63,38,0.06)]">
          {DATOS.map((d, i) => (
            <div key={d.label} className={i < DATOS.length - 1 ? 'mb-5 border-b border-[#e8e3da] pb-5' : ''}>
              <p className="mb-1.5 font-poppins text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]">
                {d.label}
              </p>
              <p className="text-[#0F3F26]" style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 18, lineHeight: 1.35 }}>
                {d.valor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
