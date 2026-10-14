import type { Metadata } from 'next'
import CalculadoraAjuste from '@/components/recursos/CalculadoraAjuste'
import RecursoHero from '@/components/recursos/RecursoHero'

export const metadata: Metadata = {
  title: '¿Está bien calculado tu aumento de alquiler? | SI INMOBILIARIA',
  description:
    'Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados. Para vivienda y comercio.',
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
  },
  keywords: [
    'calcular ajuste alquiler',
    'aumento alquiler ICL',
    'índice contratos locación',
    'CasaPropia',
    'IPC alquiler',
    'ajuste alquiler Rosario',
  ],
  openGraph: {
    title: '¿Está bien calculado tu aumento de alquiler?',
    description:
      'Verificá el ajuste con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados.',
    url: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Está bien calculado tu aumento de alquiler?',
    description: 'Verificá el ajuste con la calculadora oficial.',
    images: ['/og-image.jpg'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
    { '@type': 'ListItem', position: 2, name: 'Recursos', item: 'https://siinmobiliaria.com/recursos' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Verificar ajuste de alquiler',
      item: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
    },
  ],
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Verificador de ajuste de alquiler',
  url: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
  description:
    'Verificá si el ajuste de tu alquiler está bien calculado. ICL, IPC, CasaPropia y otros índices explicados.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es-AR',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
  provider: { '@type': 'RealEstateAgent', '@id': 'https://siinmobiliaria.com/#organization' },
}

// Mismo texto que las preguntas visibles de CalculadoraAjuste: si cambian allá, cambian acá.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      q: '¿Cómo se calcula el aumento del alquiler?',
      a: 'Depende del índice y del período que figuran en tu contrato. Entre el 01-Jul-2021 y el 18-Oct-2023: ajuste anual por ICL (ley original). Entre el 18-Oct-2023 y el 21-Dic-2023: ajuste semestral por CasaPropia (modificación). Después del 21-Dic-2023, en renovaciones, o si no es vivienda: cualquier índice y período, lo que diga tu contrato.',
    },
    {
      q: '¿Cómo se calcula el nuevo valor con cada índice?',
      a: 'Valor nuevo = Valor inicial × (Índice actual ÷ Índice al inicio). El único distinto es CasaPropia: se multiplican todos los valores del índice desde el mes de inicio (o última actualización) hasta el mes de ajuste, y ese resultado se aplica al alquiler vigente.',
    },
    {
      q: '¿Inflación acumulada o suma de inflaciones mensuales?',
      a: 'No es lo mismo: sumar las inflaciones mensuales subestima el aumento real. Con un precio inicial de $100 y 10% mensual durante 3 meses, la acumulada da $133,10 (33,1%) y la sumada $130 (30%). La acumulada es la correcta porque cada mes el porcentaje se aplica sobre el valor del mes anterior.',
    },
    {
      q: '¿De dónde salen los datos de los índices?',
      a: 'De fuentes oficiales: BCRA (ICL, CER, UVA), INDEC (IPC, IS, IPIM), Secretaría de Hábitat (CasaPropia) y CAMARCO (CAC). Se publican mensualmente y la calculadora los toma de esas fuentes.',
    },
    {
      q: '¿Qué hago si la inmobiliaria me pasa un valor distinto al que da la calculadora?',
      a: 'Revisá que uses el mismo índice y la misma fecha de inicio que figuran en tu contrato; diferencias de centavos son normales por redondeo. Si la diferencia es significativa, pedí el cálculo paso a paso con el valor del índice al inicio y el actual. Si tenés dudas, escribinos por WhatsApp y revisamos tu caso.',
    },
  ].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function AjusteAlquilerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, appJsonLd, faqJsonLd]) }}
      />

      <RecursoHero
        theme="green"
        eyebrow="Ajuste de alquiler"
        title="¿Está bien calculado tu ajuste?"
        subtitle="Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices, siempre actualizados."
        breadcrumbLabel="Verificar ajuste de alquiler"
      />

      <CalculadoraAjuste />
    </>
  )
}
