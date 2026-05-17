// PDF del acuerdo de comercialización firmado.
//
// Estrategia de rendering:
//   1. Si auth.documento_snapshot existe (acuerdos firmados a partir del
//      commit B v2 con versionado), renderea desde el snapshot — el cliente
//      recibe exactamente el texto que firmó aunque cambiemos la plantilla.
//   2. Si no existe (acuerdos firmados antes del versionado), generamos un
//      snapshot on-the-fly con la plantilla VIGENTE + disclaimer al pie.
//
// Diseño v3:
//   - Tipografía Raleway 500 cuerpo / 700 datos (más bold para imprimir).
//   - Cuerpo a 11pt, line-height 1.5 — priorizando legibilidad on-paper.
//   - Márgenes ajustados (14mm sup / 12mm inf / 16mm laterales) para entrar
//     en una sola hoja A4 sin sacrificar tamaño de fuente. Si no entra,
//     se acepta segunda página (la legibilidad es prioridad absoluta).
//   - Logo SI a la derecha, 30pt alto (estilo membrete formal).
//   - Bloque de datos de oficina al pie (Funes, Yrigoyen 2643, Tel/WA).
//   - Footer técnico comprimido a una sola línea con ID + Hash.

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
// Registrado para 400/500/600/700; @react-pdf interpola desde la variable.

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

// Desactivar el hyphenation callback de @react-pdf: por default rompe palabras
// largas y en algunas combinaciones con fonts variables genera bugs de
// rendereo donde caen ligaduras OpenType "fi"/"fl" ("firma" → "frma",
// "Oficina" → "Ofcina"). Devolver [word] preserva el texto original y
// estabiliza el rendereo de glyphs.
Font.registerHyphenationCallback(word => [word])

// ── Estilos ─────────────────────────────────────────────────────────────────

const COLOR_DARK = '#1A1A1A'
const COLOR_DARKER = '#0F0F0F'
const COLOR_MUTED = '#6B6B66'
const COLOR_SOFT = '#5A5A55'
const COLOR_HINT = '#8A8A85'
const COLOR_LINE = '#E5E5E0'
const COLOR_LINE_DARK = '#D5D5D0'
const COLOR_GREEN = '#1A5C38'
const COLOR_AMBER = '#92400E'

const styles = StyleSheet.create({
  page: {
    paddingTop: '12mm',
    paddingBottom: '10mm',
    paddingHorizontal: '16mm',
    fontFamily: 'Raleway',
    fontWeight: 600,
    fontSize: 11,
    lineHeight: 1.4,
    color: COLOR_DARK,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  headerLogo: {
    width: 110,
    height: 30,
    objectFit: 'contain',
  },
  titulo: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: COLOR_DARK,
    textAlign: 'center',
    marginBottom: 3,
  },
  fechaEncabezado: {
    fontSize: 10,
    fontWeight: 500,
    color: COLOR_SOFT,
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  clausulaPara: {
    marginBottom: 5,
    textAlign: 'justify',
  },
  clausulaNum: {
    fontWeight: 700,
    color: COLOR_DARK,
  },
  clausulaTitulo: {
    fontWeight: 700,
    color: COLOR_DARK,
  },
  dataInline: {
    fontWeight: 700,
    color: COLOR_DARKER,
  },
  cierre: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 10.5,
    fontWeight: 600,
    color: COLOR_DARK,
    textAlign: 'justify',
  },
  firmaSection: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLOR_LINE,
    borderTopStyle: 'solid',
  },
  firmaLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLOR_MUTED,
    letterSpacing: 1.2,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  firmaImage: {
    width: 170,
    height: 60,
    objectFit: 'contain',
    marginBottom: 5,
  },
  firmaLineaDatos: {
    fontSize: 9.5,
    color: COLOR_DARK,
    marginBottom: 1.5,
  },
  firmaDataLabel: {
    fontWeight: 700,
    color: COLOR_DARK,
  },
  firmaFecha: {
    marginTop: 4,
    fontSize: 8.5,
    color: COLOR_HINT,
  },
  // ── Datos de oficina (bloque centrado con separadores) ──
  bloqueOficinaWrap: {
    marginTop: 6,
  },
  oficinaWrap: {
    paddingTop: 4,
    paddingBottom: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLOR_LINE_DARK,
    borderTopStyle: 'solid',
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR_LINE_DARK,
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  oficinaTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: COLOR_GREEN,
    letterSpacing: 0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  oficinaLine: {
    fontSize: 9,
    fontWeight: 600,
    color: COLOR_DARK,
    lineHeight: 1.55,
    textAlign: 'center',
  },
  // ── Footer técnico (una línea) ──
  tecnico: {
    marginTop: 3,
    fontSize: 7.5,
    fontWeight: 400,
    color: COLOR_HINT,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  tecnicoWarn: {
    marginTop: 2,
    fontSize: 7.5,
    fontWeight: 500,
    color: COLOR_AMBER,
    textAlign: 'center',
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function hashSlugSignedAt(slug: string, signedAtIso: string): string {
  return createHash('sha256').update(`${slug}|${signedAtIso}`).digest('hex').slice(0, 16)
}

/** Chunk inline con datos resaltados (peso 700, color #0F0F0F). */
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
  // vigente al momento del fetch y marcamos un disclaimer al pie.
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

        {/* Sección de firma manuscrita (legal — Ley 25.506) */}
        <View style={styles.firmaSection} wrap={false}>
          <Text style={styles.firmaLabel}>FIRMA DEL AUTORIZANTE</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.signer.firma_base64} style={styles.firmaImage} />
          <Text style={styles.firmaLineaDatos}>
            <Text style={styles.firmaDataLabel}>{data.signer.nombre}</Text>
          </Text>
          <Text style={styles.firmaLineaDatos}>
            DNI <Text style={styles.firmaDataLabel}>{data.signer.dni}</Text>
            {' · Domicilio: '}
            <Text style={styles.firmaDataLabel}>{data.signer.domicilio}</Text>
          </Text>
          <Text style={styles.firmaLineaDatos}>
            Email: <Text style={styles.firmaDataLabel}>{data.signer.email}</Text>
          </Text>
          <Text style={styles.firmaFecha}>Firmado digitalmente el {fechaFirma}</Text>
        </View>

        {/* Bloque oficina + footer técnico — wrap=false para que NUNCA se
            parta entre páginas (corte feo del bloque al final de página 1) */}
        <View style={styles.bloqueOficinaWrap} wrap={false}>
          <View style={styles.oficinaWrap}>
            <Text style={styles.oficinaTitle}>SI INMOBILIARIA — Oficina Funes</Text>
            <Text style={styles.oficinaLine}>Hipólito Yrigoyen 2643 · Funes, Santa Fe</Text>
            <Text style={styles.oficinaLine}>
              Tel / WhatsApp: 341 210 1694 · siinmobiliaria.com
            </Text>
          </View>

          {/* Footer técnico (una sola línea) */}
          <Text style={styles.tecnico}>
            Generado digitalmente · SI INMOBILIARIA SRL · ID: {data.slug} · Hash: {hash}
          </Text>
          {isRegenerated && (
            <Text style={styles.tecnicoWarn}>
              Documento regenerado con plantilla vigente al {fechaRegen} (sin snapshot original).
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
