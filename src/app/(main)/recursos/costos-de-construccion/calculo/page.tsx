import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { COSTOS_STYLES } from '../styles'
import {
  getCalidadBySlug,
  getAjusteIPC,
  ajustar,
  fmtUSD,
  formatMesAnio,
} from '@/lib/costos-construccion'

// Página de resultado de la calculadora de costos. Recibe el cálculo por
// query params (?lote=&cub=&semi=&pileta=&calidad=slug), valida y recalcula
// server-side con el mismo módulo central (valores vigentes ajustados por
// IPC). Params inválidos o faltantes → redirect a la guía.

export const metadata: Metadata = {
  title: 'Mi proyección de costo de construcción | SI INMOBILIARIA',
  description:
    'Proyección de costo de obra llave en mano en Funes y Roldán: inversión total y valor de mercado estimado, con valores reales por m².',
  // Página parametrizable (infinitas variantes): fuera del índice de Google.
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Mi proyección de costo de construcción',
    description:
      'Mirá la proyección: costo de obra llave en mano, inversión total y valor de mercado estimado en Funes y Roldán.',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mi proyección de costo de construcción',
    description:
      'Costo de obra llave en mano, inversión total y valor de mercado estimado en Funes y Roldán.',
    images: ['/og-image.jpg'],
  },
}

const WHATSAPP_ASESORIA = `https://wa.me/5493412101694?text=${encodeURIComponent(
  'Hola! Hice una proyección de costos de construcción y quiero asesoramiento.',
)}`

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Número entero ≥ 0 o null si el param es inválido (texto, negativo, etc.)
function parseEntero(v: string | string[] | undefined): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null
  if (!/^\d+$/.test(v.trim())) return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export default async function CalculoPage({ searchParams }: Props) {
  const lote = parseEntero(searchParams.lote)
  const cub = parseEntero(searchParams.cub)
  const semi = parseEntero(searchParams.semi)
  const pileta = parseEntero(searchParams.pileta)
  const calidad = typeof searchParams.calidad === 'string' ? getCalidadBySlug(searchParams.calidad) : undefined

  // Validación: todos numéricos, superficie cubierta positiva, calidad existente
  if (lote === null || cub === null || semi === null || pileta === null || cub === 0 || !calidad) {
    redirect('/recursos/costos-de-construccion')
  }

  const { factor, mes } = await getAjusteIPC()
  const tarifa = ajustar(calidad.llaveBase, factor)
  const mediaTarifa = tarifa / 2

  const costoCubierta = cub * tarifa
  const costoSemi = (semi + pileta) * mediaTarifa
  const construccion = costoCubierta + costoSemi
  const total = lote + construccion
  const mercado = total * 1.05165

  const fmtM2 = (n: number) => `${new Intl.NumberFormat('es-AR').format(n)} m²`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COSTOS_STYLES }} />
      <div className="costos-page">
        <div className="costos-container" style={{ maxWidth: 880 }}>
          {/* 1. Título + badge */}
          <header className="costos-header" style={{ marginBottom: 40 }}>
            <h1>Tu proyección de costo de construcción</h1>
            <span className="costos-badge-mes">Valores actualizados · {formatMesAnio(mes)}</span>
          </header>

          {/* 2. Resumen de inputs */}
          <div className="costos-calc-resumen">
            <div className="costos-calc-resumen-item">
              <span className="k">Calidad</span>
              <span className="v">{calidad.calidad}</span>
            </div>
            <div className="costos-calc-resumen-item">
              <span className="k">Sup. cubierta</span>
              <span className="v">{fmtM2(cub)}</span>
            </div>
            <div className="costos-calc-resumen-item">
              <span className="k">Semicubierta</span>
              <span className="v">{fmtM2(semi)}</span>
            </div>
            <div className="costos-calc-resumen-item">
              <span className="k">Pileta</span>
              <span className="v">{fmtM2(pileta)}</span>
            </div>
            <div className="costos-calc-resumen-item">
              <span className="k">Valor del lote</span>
              <span className="v">{lote > 0 ? fmtUSD(lote) : 'Sin lote'}</span>
            </div>
          </div>

          {/* 3. Resultados */}
          <div className="costos-calc-resultados">
            <div className="costos-res-line">
              <span>Costo de Construcción (Llave en Mano)</span>
              <strong>{fmtUSD(construccion)}</strong>
            </div>
            <div className="costos-res-line">
              <span>Inversión Total (Lote + Obra)</span>
              <strong>{fmtUSD(total)}</strong>
            </div>
            <div className="costos-res-total">
              <span>Valor de Mercado (Prop. Terminada)</span>
              <strong>{fmtUSD(mercado)}</strong>
            </div>
            <div className="costos-res-disclaimer">
              <strong>Nota de mercado:</strong> Para entender la valuación real de una casa
              terminada, a la inversión total de obra se le suma la ganancia actual del
              constructor (que va de un 15% a un 25%) y los honorarios profesionales por
              intermediación (3%). El cálculo final de la casa en el mercado se estima
              considerando estos valores.
            </div>
          </div>

          {/* 4. Detalle de la estimación */}
          <div className="costos-calc-detalle">
            <h3>Detalle de la estimación</h3>
            <ul>
              <li>
                {fmtM2(cub)} cubiertos × {fmtUSD(tarifa)}/m² = <strong>{fmtUSD(costoCubierta)}</strong>
              </li>
              <li>
                ({fmtM2(semi)} semicubiertos + {fmtM2(pileta)} de pileta) × {fmtUSD(mediaTarifa)}/m² (media
                tarifa) = <strong>{fmtUSD(costoSemi)}</strong>
              </li>
              {lote > 0 && (
                <li>
                  Lote: <strong>{fmtUSD(lote)}</strong>
                </li>
              )}
            </ul>
            <p className="costos-calc-desc">
              <strong>{calidad.calidad} ({calidad.superficie}):</strong> {calidad.desc}
            </p>
          </div>

          {/* 5. Aclaración importante */}
          <div className="costos-disclaimer" style={{ marginBottom: 32 }}>
            <p>
              <strong>ACLARACIÓN IMPORTANTE SOBRE NUESTROS VALORES:</strong> Los precios por
              metro cuadrado expresados en esta tabla incluyen{' '}
              <strong>todo lo necesario para tu obra</strong>: aprobaciones, movimiento de
              suelo, estudio de suelo, honorarios y aportes profesionales, y el cálculo de
              estructura. Sin costos ocultos.
            </p>
            <p>
              Estos valores son una estimación en base a nuestra experiencia y a nuestro
              contacto permanente con constructores y desarrolladores. Pueden variar
              significativamente según la empresa que te construya, el arquitecto que esté
              detrás de la obra, la eficiencia a la hora de comprar materiales y la mano de
              obra especializada que trabaje en tu proyecto.
            </p>
          </div>

          {/* 6. CTA */}
          <div className="costos-calc-cta">
            <h3>¿Querés que te asesoremos con tu proyecto?</h3>
            <a
              href={WHATSAPP_ASESORIA}
              target="_blank"
              rel="noopener noreferrer"
              className="costos-btn-cafe"
            >
              Hablar con SI INMOBILIARIA
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
