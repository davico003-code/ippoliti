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

// Google Fonts CDN URLs para Raleway (subset latin, weights 300/400/500/600).
Font.register({
  family: 'Raleway',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 300 },
    { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyCIIT4ttDfA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyCMIT4ttDfA.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 600 },
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
  const titulo = data.tipo === 'exclusiva' ? 'AUTORIZACIÓN DE VENTA EXCLUSIVA' : 'AUTORIZACIÓN DE VENTA'
  const preambulo = renderPreambuloPDF(data.signer)
  const tipoLabel = PROPIEDAD_LABEL[data.tipo_propiedad]
  const enForma = data.tipo === 'exclusiva' ? 'en forma EXCLUSIVA ' : ''
  const hasServicios = (['luz', 'agua', 'gas', 'pavimento', 'cloacas'] as const).some(k => data.servicios[k])
  const hasExpensas = data.tiene_expensas && !!data.expensas_monto_ars && data.expensas_monto_ars > 0
  const isExclusiva = data.tipo === 'exclusiva'
  const num = getNumeracion({ hasServicios, hasExpensas, isExclusiva })

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

        {/* Cláusula 1 — INMUEBLE */}
        <Text style={styles.clausulaLabel}>{num.inmueble} · INMUEBLE</Text>
        <Text style={styles.paragraph}>
          El Autorizante autoriza {enForma ? <D>{enForma}</D> : null}al Autorizado a ofrecer en venta el inmueble de su propiedad sito en <D>{data.direccion}</D>, identificado como <D>{tipoLabel}</D>. Los datos descriptivos y técnicos del inmueble (medidas, superficie, partida inmobiliaria y demás detalles) se completarán por instrumento o anexo posterior.
        </Text>

        {/* Cláusula 2 — SERVICIOS (condicional) */}
        {hasServicios && (
          <>
            <Text style={styles.clausulaLabel}>{num.servicios} · SERVICIOS</Text>
            <Text style={styles.paragraph}>
              El inmueble cuenta con los siguientes servicios disponibles: <D>{formatListaServicios(data.servicios)}</D>.
            </Text>
          </>
        )}

        {/* Cláusula 3 — EXPENSAS (condicional) */}
        {hasExpensas && (
          <>
            <Text style={styles.clausulaLabel}>{num.expensas} · EXPENSAS</Text>
            <Text style={styles.paragraph}>
              La propiedad genera expensas mensuales estimadas en $ <D>{formatARS(data.expensas_monto_ars!)}</D> (pesos argentinos), a cargo del titular hasta el momento de la posesión por parte del comprador.
            </Text>
          </>
        )}

        {/* Cláusula 4 — PLAZO */}
        <Text style={styles.clausulaLabel}>{num.plazo} · PLAZO</Text>
        {data.renovacion_automatica ? (
          <Text style={styles.paragraph}>
            La presente autorización tendrá una vigencia de <D>{data.plazo_dias} días</D> corridos a partir de la fecha de la firma, renovable en forma automática por igual período, salvo revocación expresa notificada por escrito por cualquiera de las partes.
          </Text>
        ) : (
          <Text style={styles.paragraph}>
            La presente autorización tendrá una vigencia de <D>{data.plazo_dias} días</D> corridos a partir de la fecha de la firma, sin renovación automática. Cualquier prórroga deberá ser ratificada expresamente por ambas partes.
          </Text>
        )}

        {/* Cláusula 5 — PRECIO */}
        <Text style={styles.clausulaLabel}>{num.precio} · PRECIO</Text>
        {data.precio_venta_usd && data.precio_venta_usd > 0 ? (
          data.precio_publicacion_usd && data.precio_publicacion_usd > 0 ? (
            <Text style={styles.paragraph}>
              El precio de venta del inmueble se fija en USD <D>{formatUSD(data.precio_venta_usd)}</D> (dólares estadounidenses billete) en efectivo. Se autoriza al Autorizado a publicar el inmueble por la suma de USD <D>{formatUSD(data.precio_publicacion_usd)}</D>.
            </Text>
          ) : (
            <Text style={styles.paragraph}>
              El precio de venta del inmueble se fija en USD <D>{formatUSD(data.precio_venta_usd)}</D> (dólares estadounidenses billete) en efectivo. Se autoriza al Autorizado a publicar el inmueble por la misma suma.
            </Text>
          )
        ) : (
          <Text style={styles.paragraph}>
            El precio de venta del inmueble se acordará entre las partes por instrumento o comunicación posterior, formando parte integrante de la presente autorización.
          </Text>
        )}

        {/* Cláusula 6 — EXCLUSIVIDAD (condicional) */}
        {isExclusiva && (
          <>
            <Text style={styles.clausulaLabel}>{num.exclusividad} · EXCLUSIVIDAD</Text>
            <Text style={styles.paragraph}>
              El Autorizante declara que no tiene encomendada la venta del inmueble objeto de la presente autorización con ninguna otra inmobiliaria, y se compromete a no encomendarla a terceros mientras esta autorización se encuentre vigente.
            </Text>
          </>
        )}

        {/* Cláusula 7 — VISITAS Y CARTEL */}
        <Text style={styles.clausulaLabel}>{num.visitas} · VISITAS Y CARTEL</Text>
        <Text style={styles.paragraph}>
          El Autorizante permitirá la visita de los posibles compradores presentados por el Autorizado, en horarios coordinados previamente, y autoriza la colocación del cartel de venta en el inmueble.
        </Text>

        {/* Cláusula 8 — RESERVAS */}
        <Text style={styles.clausulaLabel}>{num.reservas} · RESERVAS</Text>
        <Text style={styles.paragraph}>
          El Autorizado queda facultado para tomar reservas ad referéndum del Autorizante por un monto equivalente al 10% del valor de la oferta recibida. Dichas reservas serán comunicadas al Autorizante dentro de las 48 horas hábiles de recibidas, a los fines de su ratificación o rechazo.
        </Text>

        {/* Cláusula 9 — HONORARIOS */}
        <Text style={styles.clausulaLabel}>{num.honorarios} · HONORARIOS</Text>
        <Text style={styles.paragraph}>
          Los honorarios de SI INMOBILIARIA SRL por su intervención serán del 3% (tres por ciento) más IVA, calculados sobre el precio efectivo de venta del inmueble. Dichos honorarios serán abonados por el Autorizante en oportunidad de la firma del boleto de compraventa o instrumento equivalente.
        </Text>

        {/* Cláusula 10 — CONTINUIDAD */}
        <Text style={styles.clausulaLabel}>{num.continuidad} · CONTINUIDAD</Text>
        <Text style={styles.paragraph}>
          El Autorizante abonará al Autorizado los honorarios íntegros pactados en la cláusula anterior si, aún caducada la presente autorización, la venta se concretara como consecuencia directa o indirecta de las gestiones de SI INMOBILIARIA SRL, es decir, a alguno de los clientes a quienes se les hubiera ofrecido o presentado el inmueble durante la vigencia de esta autorización.
        </Text>

        {/* Cláusula 11 — TÍTULOS */}
        <Text style={styles.clausulaLabel}>{num.titulos} · TÍTULOS</Text>
        <Text style={styles.paragraph}>
          El Autorizante declara bajo juramento que los títulos de propiedad del inmueble son perfectos, que el bien no se encuentra afectado por embargos, hipotecas, prendas ni gravamen alguno, que no es objeto de litigio judicial y que los titulares no se encuentran inhibidos para disponer del mismo. Se compromete a aportar al Autorizado, dentro de los 5 días de requerido, copias del título de propiedad, planos aprobados e impuestos al día.
        </Text>

        {/* Cierre */}
        <Text style={styles.cierre}>
          {CIERRE_CONSENTIMIENTO}
          {'\n\n'}
          Firmado digitalmente en la ciudad de Rosario, el <D>{fechaFirma}</D>.
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
