import Link from 'next/link'
import type { Barrio } from '@/lib/barrios'
import { BARRIO_NOMBRE_TO_SLUG } from '@/lib/barrios-editorial-data'

// 8-bloque editorial SEO inspirado en /11-landings/kentucky.html.
// Paleta: cream blanco #FFFFFF · ink #0F0F0F · si-green #1A5C38 · gold-deep #8B7355.
// Tipografía: Raleway titulares + Poppins numerales (ya cargadas globalmente).

interface Props {
  barrio: Barrio
}

const CAPITULO = {
  i: 'Capítulo I · Qué es',
  ii: 'Capítulo II · Dimensiones',
  iii: 'Capítulo III · Comunidad',
  iv: 'Capítulo IV · Servicios',
  v: 'Capítulo V · Cómo se llega',
  vi: 'Capítulo VI · Mirada del broker',
  vii: 'Capítulo VII · Comparativa',
  viii: 'Capítulo VIII · FAQ',
}

export default function BarrioContenidoEditorial({ barrio }: Props) {
  if (!barrio.contenidoSEO) return null

  const s = barrio.contenidoSEO
  const stats = barrio.stats ?? []
  const amenities = barrio.amenitiesEditorial ?? []
  const faqs = barrio.faqExtendida ?? []
  const compKeys = barrio.comparativaKeys ?? []

  return (
    <article className="bg-white text-[#0F0F0F]">
      {/* Bloque 1 · Intro */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <SectionHeader title={<>El <Em>barrio.</Em></>} num={`${CAPITULO.i} ${barrio.nombre}`} />
        <Prose>{s.intro}</Prose>
      </section>

      {/* Bloque 2 · Ficha técnica */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
          <SectionHeader title={<>Una geografía <Em>propia.</Em></>} num={CAPITULO.ii} />
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`py-9 ${i < stats.length - 1 ? 'md:border-r md:border-[rgba(15,15,15,0.08)] md:pr-6' : ''}`}
              >
                <div className="font-poppins font-semibold tabular-nums leading-none tracking-tight text-[clamp(48px,5vw,76px)]">
                  {stat.value}
                  {stat.unit && (
                    <span className="ml-1 text-[0.4em] font-light not-italic text-[#8B7355]">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bloque 3 · Vida adentro */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <SectionHeader
          title={<>La vida <Em>adentro</Em> del barrio.</>}
          num={CAPITULO.iii}
        />
        <Prose>{s.vidaAdentro}</Prose>
      </section>

      {/* Bloque 4 · Amenities */}
      {amenities.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
          <SectionHeader
            title={<>Equipamiento e <Em>infraestructura.</Em></>}
            num={CAPITULO.iv}
          />
          <ul className="grid max-w-[900px] grid-cols-1 gap-3 md:grid-cols-2">
            {amenities.map((a) => (
              <li
                key={a}
                className="border-l-2 border-[#1A5C38] bg-[#FAF8F3] px-5 py-4 text-[15px] transition-transform hover:translate-x-1"
              >
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bloque 5 · Ubicación */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <SectionHeader
          title={<>Ubicación y <Em>conectividad.</Em></>}
          num={CAPITULO.v}
        />
        <Prose>{s.ubicacionTexto}</Prose>
      </section>

      {/* Bloque 6 · Mirada del broker (callout dark) */}
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-sm bg-[#0F0F0F] px-8 py-16 text-[#F5F1E8] md:px-16 md:py-20">
          <span
            aria-hidden
            className="pointer-events-none absolute left-10 top-5 font-raleway text-[140px] italic leading-none text-[#8B7355] opacity-50 md:text-[140px]"
          >
            &ldquo;
          </span>
          <div className="relative">
            <p className="mb-6 text-[12px] uppercase tracking-[0.3em] text-[rgba(245,241,232,0.6)]">
              {CAPITULO.vi}
            </p>
            <h2 className="mb-8 font-raleway text-[clamp(36px,4.5vw,56px)] font-light leading-[1.05] tracking-tight text-[#F5F1E8]">
              La <Em invertido>lectura</Em> de SI.
            </h2>
            <p className="max-w-[720px] font-raleway text-[18px] font-light italic leading-[1.7] text-[rgba(245,241,232,0.85)] md:text-[20px]">
              {s.miradaBroker}
            </p>
            <div className="mt-10 flex items-center gap-4 border-t border-[rgba(245,241,232,0.15)] pt-6">
              <span className="font-raleway text-[18px] italic">David Flores</span>
              <span className="ml-auto text-[11px] tracking-[0.15em] text-[#8B7355]">
                Mat. 0621 · CMCPSF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque 7 · Comparado */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <SectionHeader
          title={
            <>
              {barrio.nombre} <Em>vs.</Em> la zona.
            </>
          }
          num={CAPITULO.vii}
        />
        <Prose>{s.comparado}</Prose>
        {compKeys.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mr-2 self-center text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B]">
              Comparar con:
            </span>
            {compKeys.map((nombre) => {
              const slug = BARRIO_NOMBRE_TO_SLUG[nombre]
              if (!slug) return null
              return (
                <Link
                  key={slug}
                  href={`/barrios-privados/${slug}`}
                  className="rounded-sm border border-[rgba(15,15,15,0.18)] bg-white px-5 py-3 text-[13px] text-[#0F0F0F] transition hover:-translate-y-px hover:border-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-[#F5F1E8]"
                >
                  {nombre}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Bloque 8 · FAQ */}
      {faqs.length > 0 && (
        <section
          id="faq"
          className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24"
        >
          <SectionHeader
            title={
              <>
                Preguntas <Em>frecuentes.</Em>
              </>
            }
            num={CAPITULO.viii}
          />
          <div className="max-w-[880px]">
            {faqs.map((faq, i) => (
              <details
                key={faq.pregunta}
                className="group border-b border-[rgba(15,15,15,0.08)] py-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start gap-5 font-raleway text-[18px] font-medium leading-snug text-[#0F0F0F] transition hover:text-[#1A5C38] md:text-[22px]">
                  <span className="mt-1 flex-shrink-0 font-raleway text-[14px] italic text-[#8B7355]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{faq.pregunta}</span>
                  <span
                    aria-hidden
                    className="ml-auto font-poppins text-[32px] font-light leading-[0.7] text-[#8B7355] transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="max-w-[720px] pl-10 pt-4 text-[15px] leading-[1.75] text-[#2A2A2A] md:text-[16px]">
                  {faq.respuesta}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function SectionHeader({
  title,
  num,
}: {
  title: React.ReactNode
  num: string
}) {
  return (
    <header className="mb-12 flex flex-col items-start gap-4 border-b border-[rgba(15,15,15,0.08)] pb-6 md:flex-row md:items-baseline md:justify-between md:gap-6">
      <h2 className="max-w-[720px] font-raleway text-[clamp(36px,4.5vw,56px)] font-light leading-[1.05] tracking-tight">
        {title}
      </h2>
      <span className="whitespace-nowrap font-raleway text-[12px] italic uppercase tracking-[0.3em] text-[#8B7355]">
        {num}
      </span>
    </header>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[720px] text-[17px] leading-[1.75] text-[#2A2A2A] md:text-[18px]">
      <p>{children}</p>
    </div>
  )
}

function Em({ children, invertido }: { children: React.ReactNode; invertido?: boolean }) {
  return (
    <span
      className={`font-light italic ${invertido ? 'text-[#8B7355]' : 'text-[#8B7355]'}`}
    >
      {children}
    </span>
  )
}
