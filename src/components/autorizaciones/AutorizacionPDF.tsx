// PDF del acuerdo de comercialización firmado.
//
// Estrategia de rendering:
//   1. Si auth.documento_snapshot existe (acuerdos firmados a partir del
//      commit B v2 con versionado), renderea desde el snapshot — el cliente
//      recibe exactamente el texto que firmó aunque cambiemos la plantilla.
//   2. Si no existe (acuerdos firmados antes del versionado), generamos un
//      snapshot on-the-fly con la plantilla VIGENTE + footer con disclaimer
//      "Documento regenerado con plantilla vigente al {fecha}".
//
// Tipografía: Raleway 400 cuerpo / 600 datos resaltados.
// Logo: a la derecha (estilo membrete formal), ~40px alto.
// Footer en cada página: SI INMOBILIARIA + ID acuerdo + hash de verificación
// (SHA-256 del slug + signed_at, truncado a 16 chars).

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
  buildDocumentoSnapshot,
  formatFechaFirma,
  type ClausulaSnapshot,
  type DocumentoSnapshot,
} from '@/lib/autorizaciones/documentoTexto'

// ── Logo ────────────────────────────────────────────────────────────────────

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
  cachedLogo = LOGO_URL_FALLBACK
  return LOGO_URL_FALLBACK
}

// ── Fuentes ────────────────────────────────────────────────────────────────
//
// Variable font Raleway hospedado en /public/fonts/raleway-variable.ttf.
// Registrado para varios pesos; @react-pdf interpola si soporta variable fonts.

const FONT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://siinmobiliaria.com'

const RALEWAY_VAR = `${FONT_BASE_URL}/fonts/raleway-variable.ttf`

Font.register({
  family: 'Raleway',
  fonts: [
    { src: RALEWAY_VAR, fontWeight: 400 },
    { src: RALEWAY_VAR, fontWeight: 500 },
    { src: RALEWAY_VAR, fontWeight: 600 },
    { src: RALEWAY_VAR, fontWeight: 700 },
  ],
})

// ── Estilos ─────────────────────────────────────────────────────────────────

const COLOR_DARK = '#1A1A1A'
const COLOR_MUTED = '#6B6B66'
const COLOR_SOFT = '#8A8A85'
const COLOR_LINE = '#E5E5E0'
const COLOR_AMBER = '#92400E'

const styles = StyleSheet.create({
  page: {
    paddingTop: '2.5cm',
    paddingBottom: '2.5cm',
    paddingHorizontal: '2.5cm',
    fontFamily: 'Raleway',
    fontWeight: 400,
    fontSize: 10.5,
    lineHeight: 1.6,
    color: COLOR_DARK,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerLogo: {
    width: 130,
    height: 36,
    objectFit: 'contain',
  },
  titulo: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: COLOR_DARK,
    textAlign: 'center',
    marginBottom: 4,
  },
  fechaEncabezado: {
    fontSize: 9,
    color: COLOR_SOFT,
    textAlign: 'center',
    marginBottom: 20,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  clausulaPara: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  clausulaNum: {
    fontWeight: 600,
    color: COLOR_DARK,
  },
  clausulaTitulo: {
    fontWeight: 700,
    color: COLOR_DARK,
  },
  dataInline: {
    fontWeight: 600,
    color: COLOR_DARK,
  },
  cierre: {
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'justify',
  },
  firmaSection: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 0.6,
    borderTopColor: COLOR_LINE,
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
    fontWeight: 600,
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
  footerWarn: {
    marginBottom: 1,
    color: COLOR_AMBER,
    fontWeight: 500,
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function hashSlugSignedAt(slug: string, signedAtIso: string): string {
  return createHash('sha256').update(`${slug}|${signedAtIso}`).digest('hex').slice(0, 16)
}

/** Chunk inline resaltado (peso 600). */
function D({ children }: { children: React.ReactNode }) {
  return <Text style={styles.dataInline}>{children}</Text>
}

/** Renderea una cláusula del snapshot como párrafo con highlight de datos. */
function renderClausula(cl: ClausulaSnapshot) {
  return (
    <Text key={cl.numero} style={styles.clausulaPara}>
      <Text style={styles.clausulaNum}>{cl.numero}.- </Text>
      <Text style={styles.clausulaTitulo}>{cl.titulo}: </Text>
      {cl.chunks.map((c, i) =>
        c.kind === 'data' ? <D key={i}>{c.text}</D> : <Text key={i}>{c.text}</Text>,
      )}
    </Text>
  )
}

// ── Documento ───────────────────────────────────────────────────────────────

interface Props {
  data: Autorizacion
}

export function AutorizacionPDF({ data }: Props) {
  if (!data.signer || !data.signed_at) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Documento incompleto.</Text>
        </Page>
      </Document>
    )
  }

  const signedAt = new Date(data.signed_at)

  // Si el acuerdo tiene snapshot guardado al firmar → lo usamos tal cual.
  // Si no (acuerdo viejo pre-versionado) → regeneramos con la plantilla
  // vigente al momento del fetch y marcamos el footer con disclaimer.
  const snapshot: DocumentoSnapshot =
    data.documento_snapshot || buildDocumentoSnapshot(data, data.signer, signedAt)
  const isRegenerated = !data.documento_snapshot

  const hash = hashSlugSignedAt(data.slug, data.signed_at)
  const logoSrc = getLogoSrc()
  const fechaFirma = formatFechaFirma(signedAt)
  const fechaRegen = formatFechaFirma(new Date()).split(' a las')[0] // solo la fecha sin hora

  return (
    <Document
      title={`Acuerdo ${data.slug}`}
      author="SI INMOBILIARIA SRL"
      subject="Acuerdo de comercialización digital"
    >
      <Page size="A4" style={styles.page}>
        {/* Header: logo a la derecha (estilo membrete) */}
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={styles.headerLogo} />
        </View>

        {/* Título + fecha del encabezado */}
        <Text style={styles.titulo}>{snapshot.titulo}</Text>
        <Text style={styles.fechaEncabezado}>{snapshot.fecha_encabezado}</Text>

        {/* Preámbulo (ya con datos del signer interpolados) */}
        <Text style={styles.paragraph}>{snapshot.preambulo}</Text>

        {/* Cláusulas — desde snapshot, con highlight de datos */}
        {snapshot.clausulas.map(renderClausula)}

        {/* Cierre */}
        <Text style={styles.cierre}>
          {snapshot.cierre_consentimiento}
          {'\n\n'}
          {snapshot.cierre_firma}
        </Text>

        {/* Sección de firma manuscrita */}
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
          {isRegenerated && (
            <Text style={styles.footerWarn}>
              Documento regenerado con plantilla vigente al {fechaRegen} (sin snapshot original).
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
