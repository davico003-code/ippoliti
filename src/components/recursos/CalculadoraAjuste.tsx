'use client'

import { useEffect } from 'react'
import { events } from '@/lib/analytics'
import DisclaimerInfo from './shared/DisclaimerInfo'
import CtaWhatsapp from './shared/CtaWhatsapp'

// Colores por índice (border-left visual aid)
const COLOR = {
  icl: '#E45C7A',
  casa: '#8FBE3F',
  ipc: '#3FB7D4',
  cac: '#6B7A99',
  cer: '#9C7AB8',
  uva: '#5BA67A',
  is: '#D4A93B',
  ipim: '#7AA0C2',
} as const

const PERIODOS = [
  {
    rango: '01 Jul 2021 → 18 Oct 2023',
    indice: 'ICL anual',
    detalle: 'Ajuste cada 12 meses',
    tag: 'Ley 27.551 original',
  },
  {
    rango: '18 Oct 2023 → 21 Dic 2023',
    indice: 'CasaPropia semestral',
    detalle: 'Ajuste cada 6 meses',
    tag: 'Ley 27.737 (modif.)',
  },
  {
    rango: 'Después del 21 Dic 2023',
    indice: 'Lo que diga tu contrato',
    detalle: 'Cualquier índice y período',
    tag: 'Decreto 70/2023',
  },
]

const INDICES = [
  {
    sigla: 'ICL',
    nombre: 'Índice de Contratos de Locación',
    desc: 'Combina la evolución de precios y salarios. Diseñado específicamente para contratos de alquiler.',
    fuente: 'BCRA',
    color: COLOR.icl,
  },
  {
    sigla: 'CasaPropia',
    nombre: 'Coeficiente Casa Propia',
    desc: 'Toma el menor entre la variación salarial promedio y la inflación promedio del último año. Creado para créditos hipotecarios.',
    fuente: 'Sec. de Hábitat',
    color: COLOR.casa,
  },
  {
    sigla: 'IPC',
    nombre: 'Índice de Precios al Consumidor',
    desc: 'Mide la variación de precios de una canasta representativa del consumo de los hogares. Es el indicador clave de la inflación.',
    fuente: 'INDEC',
    color: COLOR.ipc,
  },
  {
    sigla: 'CAC',
    nombre: 'Cámara Argentina de la Construcción',
    desc: 'Mide variaciones en costos de la construcción: materiales, mano de obra y otros del sector.',
    fuente: 'CAMARCO',
    color: COLOR.cac,
  },
  {
    sigla: 'CER',
    nombre: 'Coef. de Estabilización de Referencia',
    desc: 'Ajusta valores según la inflación del IPC en forma diaria. Mantiene los precios estables frente a la inflación.',
    fuente: 'BCRA',
    color: COLOR.cer,
  },
  {
    sigla: 'UVA',
    nombre: 'Unidad de Valor Adquisitivo',
    desc: 'Creada para créditos hipotecarios. Ajusta capital e intereses según el costo de construir una vivienda.',
    fuente: 'BCRA',
    color: COLOR.uva,
  },
  {
    sigla: 'IS',
    nombre: 'Índice Salarial',
    desc: 'Refleja la variación de salarios públicos y privados. Permite ajustar valores según los ingresos.',
    fuente: 'INDEC',
    color: COLOR.is,
  },
  {
    sigla: 'IPIM',
    nombre: 'Precios Internos al por Mayor',
    desc: 'Mide la variación de precios de productos a nivel mayorista. Indica inflación en producción y distribución.',
    fuente: 'INDEC',
    color: COLOR.ipim,
  },
]

export default function CalculadoraAjuste() {
  useEffect(() => {
    events.calculadoraAjusteView()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .ajuste-faq summary::-webkit-details-marker { display: none; }
        .ajuste-faq summary { list-style: none; cursor: pointer; }
        .ajuste-faq-row { border-bottom: 1px solid var(--cream-deep); }
        .ajuste-faq-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ajuste-faq-row:first-child { padding-top: 0; }
        .faq-body p { margin: 0 0 8px; }
        .faq-body p:last-child { margin-bottom: 0; }
      ` }} />

      <div
        className="max-w-[880px] mx-auto px-5 pt-9 pb-20 font-raleway"
        style={{ color: 'var(--tinta)' }}
      >
        {/* HERO */}
        <header className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.8px] mb-4"
            style={{ color: 'var(--si-green)' }}
          >
            <span
              aria-hidden
              className="w-[7px] h-[7px] rounded-full animate-pulse-slow"
              style={{ background: 'var(--si-green-soft)' }}
            />
            Calculadora · Ajuste de alquiler
          </div>
          <p className="text-[16px] max-w-[580px] m-0 mt-3 leading-relaxed" style={{ color: 'var(--tinta-soft)' }}>
            Verificá si el ajuste que te pasaron coincide con el índice que figura en tu contrato.
            Acá tenés la calculadora oficial junto con la info que necesitás para entenderla.
          </p>
        </header>

        {/* CALCULADORA EMBEBIDA */}
        <Section
          eyebrow="Calculadora interactiva"
          title="Calculá tu ajuste"
          subtitle="Ingresá el valor inicial del alquiler, la fecha de inicio y elegí el índice según tu contrato."
        >
          <div
            className="rounded-2xl overflow-hidden shadow-sm mb-3"
            style={{ background: '#FFF', border: '1px solid var(--line)' }}
          >
            <iframe
              title="Calculadora de aumento de alquileres"
              src="https://arquiler.com/mini?theme=light&backgroundColor=ffffff"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full border-0 h-[740px] min-[720px]:h-[820px]"
            />
          </div>
          <p
            className="text-center text-[12px] m-0"
            style={{ color: 'var(--tinta-mute)' }}
          >
            Calculadora provista por{' '}
            <a
              href="https://arquiler.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: 'var(--si-green)', borderBottom: '1px solid transparent' }}
            >
              arquiler.com
            </a>
          </p>
        </Section>

        {/* FECHAS CLAVE */}
        <Section
          eyebrow="Fechas clave"
          title="¿Qué índice corresponde a tu contrato?"
          subtitle="Depende cuándo firmaste. Hay tres períodos legales distintos."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            {PERIODOS.map(p => (
              <div
                key={p.rango}
                className="rounded-xl p-4 flex flex-col gap-1.5"
                style={{ background: 'var(--cream)', border: '1px solid var(--line)' }}
              >
                <span
                  className="font-poppins text-[11px] font-semibold tracking-[0.4px] uppercase tabular-nums"
                  style={{ color: 'var(--tinta-mute)' }}
                >
                  {p.rango}
                </span>
                <span
                  className="text-[17px] font-bold leading-tight"
                  style={{ color: 'var(--tinta)' }}
                >
                  {p.indice}
                  <span
                    className="block text-[12px] font-medium mt-0.5"
                    style={{ color: 'var(--tinta-soft)' }}
                  >
                    {p.detalle}
                  </span>
                </span>
                <span
                  className="inline-block w-fit text-[10px] font-bold tracking-[0.7px] uppercase px-2 py-0.5 rounded"
                  style={{
                    background: '#FFF',
                    color: 'var(--si-green)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* GLOSARIO DE ÍNDICES */}
        <Section
          eyebrow="Glosario"
          title="Los índices, en simple"
          subtitle="Estos son los principales índices que se usan para ajustar contratos."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {INDICES.map(i => (
              <div
                key={i.sigla}
                className="rounded-xl px-4 py-3.5 leading-relaxed"
                style={{
                  background: 'var(--cream)',
                  borderLeft: `4px solid ${i.color}`,
                }}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="font-poppins font-bold text-[14px]"
                    style={{ color: 'var(--tinta)' }}
                  >
                    {i.sigla}
                  </span>
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: 'var(--tinta-mute)' }}
                  >
                    {i.nombre}
                  </span>
                </div>
                <p className="text-[13px] m-0" style={{ color: 'var(--tinta-soft)' }}>
                  {i.desc}
                </p>
                <span
                  className="block mt-1.5 text-[11px] font-medium"
                  style={{ color: 'var(--tinta-mute)' }}
                >
                  Fuente: <strong style={{ color: 'var(--si-green)', fontWeight: 600 }}>{i.fuente}</strong>
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section eyebrow="Dudas frecuentes" title="Lo que la gente nos pregunta">
          <div className="ajuste-faq">
            <Faq q="¿Cómo se calcula el aumento del alquiler?">
              <p>
                El aumento depende de dos cosas: <strong>el índice</strong> y{' '}
                <strong>el período</strong> que figuran en tu contrato. La regla general según cuándo firmaste:
              </p>
              <p>
                · Entre el <strong>01-Jul-2021 y el 18-Oct-2023</strong> → ajuste anual por{' '}
                <strong>ICL</strong> (ley original).<br />
                · Entre el <strong>18-Oct-2023 y el 21-Dic-2023</strong> → ajuste semestral por{' '}
                <strong>CasaPropia</strong> (modificación).<br />
                · <strong>Después del 21-Dic-2023</strong>, en renovaciones, o si no es vivienda → cualquier índice y período, lo que diga tu contrato.
              </p>
              <p>
                Links:{' '}
                <FaqLink href="https://www.boletinoficial.gob.ar/detalleAviso/primera/231429/20200630">
                  Ley 27.551
                </FaqLink>{' '}
                ·{' '}
                <FaqLink href="https://www.boletinoficial.gob.ar/detalleAviso/primera/296093/20231017">
                  Ley 27.737
                </FaqLink>{' '}
                ·{' '}
                <FaqLink href="https://www.boletinoficial.gob.ar/detalleAviso/primera/301122/20231221">
                  Decreto 70/2023
                </FaqLink>
              </p>
            </Faq>

            <Faq q="¿Cómo se calcula el nuevo valor con cada índice?">
              <p>
                La fórmula general es bastante simple: tomás el valor del índice cuando firmaste y lo
                comparás con el valor actual.
              </p>
              <p>
                <FaqCode>Valor nuevo = Valor inicial × (Índice actual ÷ Índice al inicio)</FaqCode>
              </p>
              <p>
                El único distinto es <strong>CasaPropia</strong>: se multiplican todos los valores del
                índice desde el mes de inicio (o última actualización) hasta el mes de ajuste, y ese
                resultado se aplica al alquiler vigente.
              </p>
              <p>
                <FaqCode>Valor nuevo = Valor actual × Multiplicador CasaPropia</FaqCode>
              </p>
            </Faq>

            <Faq q="¿Inflación acumulada o suma de inflaciones mensuales?">
              <p>
                No es lo mismo, y la diferencia es importante. Sumar las inflaciones mensuales{' '}
                <strong>subestima</strong> el aumento real.
              </p>
              <p>Ejemplo: precio inicial $100 con 10% mensual durante 3 meses.</p>
              <p>
                · <strong>Acumulada</strong>:{' '}
                <FaqCode>($100 × 1,10) × 1,10 × 1,10 = $133,10</FaqCode> (33,1%)<br />
                · <strong>Sumada</strong>:{' '}
                <FaqCode>$100 × (1 + 0,10 + 0,10 + 0,10) = $130</FaqCode> (30%)
              </p>
              <p>
                La acumulada es la correcta porque cada mes el porcentaje se aplica sobre el valor del
                mes anterior, no sobre el original.
              </p>
            </Faq>

            <Faq q="¿De dónde salen los datos de los índices?">
              <p>Todos vienen de fuentes oficiales:</p>
              <p>
                · <strong>BCRA</strong> → ICL, CER, UVA<br />
                · <strong>INDEC</strong> → IPC, IS, IPIM<br />
                · <strong>Sec. de Hábitat</strong> → CasaPropia<br />
                · <strong>CAMARCO</strong> → CAC
              </p>
              <p>
                Estos datos se publican mensualmente y son públicos. La calculadora los toma directamente
                de esas fuentes.
              </p>
            </Faq>

            <Faq q="¿Qué hago si la inmobiliaria me pasa un valor distinto al que da la calculadora?">
              <p>
                Primero, revisá que estés usando el <strong>mismo índice</strong> y la{' '}
                <strong>misma fecha de inicio</strong> que figura en tu contrato. Pequeñas diferencias
                (centavos) son normales por redondeo.
              </p>
              <p>
                Si la diferencia es significativa, pedí que te muestren el cálculo paso a paso. Te tienen
                que mostrar el valor del índice al inicio y el valor actual.
              </p>
              <p>
                Si tenés dudas, escribinos por WhatsApp y revisamos tu caso particular.
              </p>
            </Faq>
          </div>
        </Section>

        {/* DISCLAIMER */}
        <div className="mb-4">
          <DisclaimerInfo />
        </div>

        {/* CTA */}
        <CtaWhatsapp
          source="ajuste"
          title="¿Te dieron un valor que no te cierra?"
          subtitle="Revisamos tu caso particular sin compromiso por WhatsApp."
          message="Hola! Quiero verificar el ajuste que me pasaron del alquiler."
        />
      </div>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────
function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl p-7 md:px-8 mb-4 shadow-sm"
      style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
    >
      <div
        className="mb-4 pb-3.5"
        style={{ borderBottom: '1px solid var(--cream-deep)' }}
      >
        <div
          className="text-[11px] font-bold uppercase tracking-[1.5px] mb-1"
          style={{ color: 'var(--si-green)' }}
        >
          {eyebrow}
        </div>
        <h2
          className="text-[22px] font-bold tracking-[-0.015em] m-0 mb-1.5"
          style={{ color: 'var(--tinta)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[14px] m-0" style={{ color: 'var(--tinta-soft)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="ajuste-faq-row py-4">
      <summary className="flex items-center justify-between gap-3 select-none">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--tinta)' }}>
          {q}
        </span>
        <span
          aria-hidden
          className="font-poppins font-semibold text-[22px] flex-shrink-0"
          style={{ color: 'var(--tinta-mute)' }}
        >
          +
        </span>
      </summary>
      <div className="mt-2.5 text-[14px] leading-relaxed faq-body" style={{ color: 'var(--tinta-soft)' }}>
        {children}
      </div>
    </details>
  )
}

function FaqCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-poppins text-[12.5px] px-1.5 py-0.5 rounded"
      style={{ background: 'var(--cream)', color: 'var(--tinta)' }}
    >
      {children}
    </code>
  )
}

function FaqLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold"
      style={{ color: 'var(--si-green)', borderBottom: '1px solid currentColor' }}
    >
      {children}
    </a>
  )
}
