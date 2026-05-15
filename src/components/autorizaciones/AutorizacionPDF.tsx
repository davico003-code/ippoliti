// PDF de la autorización firmada (descargable por el cliente y el agente).
//
// Replica el documento web pero con todas las cláusulas estándar siempre
// presentes (no condicionales por compactación), datos del signer interpolados
// en el preámbulo, firma manuscrita como <Image>, y footer en cada página con
// hash de verificación (SHA-256 del slug + signed_at, truncado a 16 chars).
//
// Raleway se registra desde Google Fonts CDN (sin TTFs en el repo).
// El logo se carga como file path local; @react-pdf/renderer lo resuelve en
// runtime de Node (en Vercel functions process.cwd() apunta al .next/server).

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import type { Autorizacion } from '@/lib/autorizaciones'
import {
  CIERRE_CONSENTIMIENTO,
  PROPIEDAD_LABEL,
  formatFechaEncabezado,
  formatFechaFirma,
  getNumeracion,
  renderPreambuloPDF,
} from '@/lib/autorizaciones/documentoTexto'

// ── Logo (carga al boot, cacheado en memoria del proceso) ───────────────────
//
// process.cwd() en Vercel functions puede no apuntar a la raíz del repo. Probamos
// varios candidatos. Si todos fallan, devolvemos la URL pública absoluta.

const LOGO_URL_FALLBACK = 'https://siinmobiliaria.com/logo-si-horizontal.png'

let cachedLogo: Buffer | string | null = null

function getLogoSrc(): Buffer | string {
  if (cachedLogo) return cachedLogo
  const candidates = [
    path.join(process.cwd(), 'public', 'logo-si-horizontal.png'),
    path.join(process.cwd(), '..', 'public', 'logo-si-horizontal.png'),
    path.join('/var/task/public', 'logo-si-horizontal.png'),
  ]
  for (const p of candidates) {
    try {
      const buf = fs.readFileSync(p)
      cachedLogo = buf
      return buf
    } catch {
      // siguiente candidato
    }
  }
  // Fallback: dejamos que @react-pdf/renderer haga el fetch HTTP.
  cachedLogo = LOGO_URL_FALLBACK
  return LOGO_URL_FALLBACK
}

// ── Fuentes ────────────────────────────────────────────────────────────────
//
// Variable font Raleway hospedado en /public/fonts/raleway-variable.ttf.
// Lo registramos para varios pesos apuntando al mismo archivo; @react-pdf
// interpola el weight si soporta variable fonts. Si no, todo el documento
// queda en el mismo grosor pero al menos renderea (graceful degradation
// preferible al "Unknown font format" o "Failed to fetch").
//
// URL absoluta a nuestro propio dominio (Next sirve /public/ estáticamente).

const FONT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://siinmobiliaria.com'

const RALEWAY_VAR = `${FONT_BASE_URL}/fonts/raleway-variable.ttf`

Font.register({
  family: 'Raleway',
  fonts: [
    { src: RALEWAY_VAR, fontWeight: 300 },
    { src: RALEWAY_VAR, fontWeight: 400 },
    { src: RALEWAY_VAR, fontWeight: 500 },
    { src: RALEWAY_VAR, fontWeight: 600 },
  ],
})

// ── Estilos ─────────────────────────────────────────────────────────────────

const COLOR_DARK = '#1A1A1A'
const COLOR_BODY = '#2A2A28'
const COLOR_MUTED = '#6B6B66'
const COLOR_SOFT = '#8A8A85'

const styles = StyleSheet.create({
  page: {
    paddingTop: '2.5cm',
    paddingBottom: '2.5cm',
    paddingHorizontal: '2.5cm',
    fontFamily: 'Raleway',
    fontWeight: 300,
    fontSize: 10.5,
    lineHeight: 1.55,
    color: COLOR_BODY,
  },
  headerLogo: {
    width: 150,
    height: 38,
    marginBottom: 18,
    objectFit: 'contain',
  },
  titulo: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: COLOR_DARK,
    textAlign: 'center',
    marginBottom: 4,
  },
  fechaEncabezado: {
    fontSize: 9,
    color: COLOR_SOFT,
    textAlign: 'center',
    marginBottom: 18,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  clausulaLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLOR_MUTED,
    letterSpacing: 1.4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dataInline: {
    fontWeight: 500,
    color: COLOR_DARK,
  },
  cierre: {
    marginTop: 14,
    marginBottom: 22,
    textAlign: 'justify',
  },
  firmaSection: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 0.6,
    borderTopColor: '#E5E5E0',
    borderTopStyle: 'solid',
  },
  firmaLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLOR_MUTED,
    letterSpacing: 1.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  firmaImage: {
    width: 200,
    height: 80,
    objectFit: 'contain',
    marginBottom: 6,
  },
  firmaLineaDatos: {
    fontSize: 10,
    color: COLOR_DARK,
    marginBottom: 2,
  },
  firmaDataLabel: {
    fontWeight: 500,
    color: COLOR_DARK,
  },
  firmaFecha: {
    marginTop: 6,
    fontSize: 9,
    color: COLOR_SOFT,
  },
  footer: {
    position: 'absolute',
    bottom: '1.2cm',
    left: '2.5cm',
    right: '2.5cm',
    fontSize: 8,
    color: COLOR_SOFT,
    lineHeight: 1.45,
  },
  footerLine: {
    marginBottom: 1,
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function hashSlugSignedAt(slug: string, signedAtIso: string): string {
  return createHash('sha256').update(`${slug}|${signedAtIso}`).digest('hex').slice(0, 16)
}

function formatListaServicios(servicios: Autorizacion['servicios']): string {
  const labels = (
    [
      ['luz', servicios.luz],
      ['agua', servicios.agua],
      ['gas', servicios.gas],
      ['pavimento', servicios.pavimento],
      ['cloacas', servicios.cloacas],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
function formatARS(n: number): string {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

// `data` chunk inline dentro de un Text para resaltar (peso 500 color #1A1A1A).
function D({ children }: { children: React.ReactNode }) {
  return <Text style={styles.dataInline}>{children}</Text>
}

// ── Documento ───────────────────────────────────────────────────────────────

interface Props {
  data: Autorizacion
}

export function AutorizacionPDF({ data }: Props) {
  if (!data.signer || !data.signed_at) {
    // Fallback defensivo — el endpoint debería bloquear esto, pero por seguridad.
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Documento incompleto.</Text>
        </Page>
      </Document>
    )
  }

  const signedAt = new Date(data.signed_at)
  const fechaEncabezado = formatFechaEncabezado(signedAt)
  const fechaFirma = formatFechaFirma(signedAt)
  const titulo = data.tipo === 'exclusiva' ? 'ACUERDO DE COMERCIALIZACIÓN EXCLUSIVA' : 'ACUERDO DE COMERCIALIZACIÓN'
  const preambulo = renderPreambuloPDF(data.signer)
  const tipoLabel = PROPIEDAD_LABEL[data.tipo_propiedad]
  const enForma = data.tipo === 'exclusiva' ? 'en forma EXCLUSIVA ' : ''
  const hasServicios = (['luz', 'agua', 'gas', 'pavimento', 'cloacas'] as const).some(k => data.servicios[k])
  const hasExpensas = data.tiene_expensas && !!data.expensas_monto_ars && data.expensas_monto_ars > 0
  const isExclusiva = data.tipo === 'exclusiva'
  const num = getNumeracion({ hasExpensas, isExclusiva })

  const hash = hashSlugSignedAt(data.slug, data.signed_at)
  const logoSrc = getLogoSrc()

  return (
    <Document
      title={`Acuerdo ${data.slug}`}
      author="SI INMOBILIARIA SRL"
      subject="Acuerdo de comercialización digital"
    >
      <Page size="A4" style={styles.page}>
        {/* Header / logo — Image de @react-pdf/renderer, no acepta alt */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={logoSrc} style={styles.headerLogo} />

        {/* Título + fecha */}
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.fechaEncabezado}>{fechaEncabezado}</Text>

        {/* Preámbulo */}
        <Text style={styles.paragraph}>{preambulo}</Text>

        {/* Cláusula 1 — INMUEBLE (con servicios integrados) */}
        <Text style={styles.clausulaLabel}>{num.inmueble} · INMUEBLE</Text>
        <Text style={styles.paragraph}>
          El Autorizante autoriza {enForma ? <D>{enForma}</D> : null}al Autorizado a ofrecer en venta el inmueble sito en <D>{data.direccion}</D>, identificado como <D>{tipoLabel}</D>
          {hasServicios ? (
            <>
              , con los siguientes servicios disponibles: <D>{formatListaServicios(data.servicios)}</D>
            </>
          ) : null}
          . Los datos técnicos se completarán por anexo posterior.
        </Text>

        {/* Cláusula EXPENSAS (condicional) */}
        {hasExpensas && (
          <>
            <Text style={styles.clausulaLabel}>{num.expensas} · EXPENSAS</Text>
            <Text style={styles.paragraph}>
              La propiedad genera expensas mensuales estimadas en $ <D>{formatARS(data.expensas_monto_ars!)}</D> (pesos argentinos), a cargo del titular hasta el momento de la posesión por parte del comprador.
            </Text>
          </>
        )}

        {/* Cláusula PLAZO */}
        <Text style={styles.clausulaLabel}>{num.plazo} · PLAZO</Text>
        {data.renovacion_automatica ? (
          <Text style={styles.paragraph}>
            <D>{data.plazo_dias} días</D> corridos desde la firma del presente acuerdo, renovables automáticamente por igual período salvo revocación expresa por escrito.
          </Text>
        ) : (
          <Text style={styles.paragraph}>
            <D>{data.plazo_dias} días</D> corridos desde la firma del presente acuerdo, sin renovación automática. Cualquier prórroga deberá ser ratificada expresamente por ambas partes.
          </Text>
        )}

        {/* Cláusula PRECIO — solo precio_publicacion_usd, NUNCA expone precio_venta_usd */}
        <Text style={styles.clausulaLabel}>{num.precio} · PRECIO</Text>
        {data.precio_publicacion_usd && data.precio_publicacion_usd > 0 ? (
          <Text style={styles.paragraph}>
            El precio de publicación del inmueble se fija en USD <D>{formatUSD(data.precio_publicacion_usd)}</D> (dólares estadounidenses billete).
          </Text>
        ) : (
          <Text style={styles.paragraph}>
            El precio de publicación se acordará entre las partes por instrumento o comunicación posterior, formando parte integrante del presente acuerdo.
          </Text>
        )}

        {/* Cláusula DIFUSIÓN */}
        <Text style={styles.clausulaLabel}>{num.difusion} · DIFUSIÓN</Text>
        <Text style={styles.paragraph}>
          El Autorizante autoriza al Autorizado a publicar y promocionar el inmueble en portales inmobiliarios, redes sociales, medios digitales y cualquier otro canal que considere conveniente, incluyendo el desarrollo de estrategias de marketing para concretar la venta.
        </Text>

        {/* Cláusula EXCLUSIVIDAD (condicional) */}
        {isExclusiva && (
          <>
            <Text style={styles.clausulaLabel}>{num.exclusividad} · EXCLUSIVIDAD</Text>
            <Text style={styles.paragraph}>
              El Autorizante declara que no tiene encomendada la venta del inmueble a ninguna otra inmobiliaria y se compromete a no encomendarla a terceros mientras el presente acuerdo esté vigente.
            </Text>
          </>
        )}

        {/* Cláusula HONORARIOS */}
        <Text style={styles.clausulaLabel}>{num.honorarios} · HONORARIOS</Text>
        <Text style={styles.paragraph}>
          Los honorarios de SI INMOBILIARIA serán del 3% + IVA sobre el precio efectivo de venta, abonados por el Autorizante al firmar el boleto de compraventa o instrumento equivalente.
        </Text>

        {/* Cláusula TÍTULOS */}
        <Text style={styles.clausulaLabel}>{num.titulos} · TÍTULOS</Text>
        <Text style={styles.paragraph}>
          El Autorizante declara que los títulos son perfectos, sin embargos, hipotecas, gravámenes, litigios ni inhibiciones, y aportará la documentación al Autorizado dentro de los 5 días.
        </Text>

        {/* Cierre */}
        <Text style={styles.cierre}>
          {CIERRE_CONSENTIMIENTO}
          {'\n\n'}
          Firmado digitalmente en Funes, el <D>{fechaFirma}</D>.
        </Text>

        {/* Sección de firma */}
        <View style={styles.firmaSection} wrap={false}>
          <Text style={styles.firmaLabel}>FIRMA DEL AUTORIZANTE</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.signer.firma_base64} style={styles.firmaImage} />
          <Text style={styles.firmaLineaDatos}>
            <Text style={styles.firmaDataLabel}>{data.signer.nombre}</Text>
          </Text>
          <Text style={styles.firmaLineaDatos}>
            DNI <Text style={styles.firmaDataLabel}>{data.signer.dni}</Text>
          </Text>
          <Text style={styles.firmaLineaDatos}>
            Domicilio: <Text style={styles.firmaDataLabel}>{data.signer.domicilio}</Text>
          </Text>
          <Text style={styles.firmaLineaDatos}>
            Email: <Text style={styles.firmaDataLabel}>{data.signer.email}</Text>
          </Text>
          <Text style={styles.firmaFecha}>Firmado digitalmente el {fechaFirma}</Text>
        </View>

        {/* Footer fijo en cada página */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLine}>
            Documento generado digitalmente · SI INMOBILIARIA SRL · siinmobiliaria.com
          </Text>
          <Text style={styles.footerLine}>ID de acuerdo: {data.slug}</Text>
          <Text style={styles.footerLine}>Hash de verificación: {hash}</Text>
        </View>
      </Page>
    </Document>
  )
}
