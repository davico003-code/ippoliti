// PDF descargable del listado de alquileres (botón en /propiedades).
//
// Mismo diseño que la hoja imprimible del panel (ListaAlquileresSheet):
// encabezado con marca, grupos por tipología con banda verde, filas con foto
// miniatura, dirección, ubicación, características y precio a la derecha.
//
// Tipografía Inter (no Raleway): mismo criterio que AutorizacionPDF — las
// ligaduras OpenType de Raleway rompen "fi" en @react-pdf ("Ofcina").
// Las fotos llegan ya descargadas como Buffer (las resuelve el route handler
// vía /_next/image para que el PDF pese ~1MB y no 15MB).

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

import {
  agruparAlquileres,
  caracteristicasListado,
  precioListado,
  type AlquilerItem,
} from '@/lib/listado-alquileres'

// ── Logo (mismo mecanismo que AutorizacionPDF) ──────────────────────────────

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

// ── Fuentes ─────────────────────────────────────────────────────────────────

const FONT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://siinmobiliaria.com'

Font.register({
  family: 'Inter',
  fonts: [
    { src: `${FONT_BASE_URL}/fonts/Inter-Regular.ttf`, fontWeight: 400 },
    { src: `${FONT_BASE_URL}/fonts/Inter-SemiBold.ttf`, fontWeight: 600 },
    { src: `${FONT_BASE_URL}/fonts/Inter-Bold.ttf`, fontWeight: 700 },
  ],
})

Font.registerHyphenationCallback((word) => [word])

// ── Estilos ─────────────────────────────────────────────────────────────────

const VERDE = '#1A5C38'
const TINTA = '#101613'
const GRIS = '#5c645f'
const LINEA = '#e3e7e4'

const styles = StyleSheet.create({
  page: {
    paddingTop: '10mm',
    // 14mm: deja lugar al pie fixed (bottom 5mm) sin que las filas lo pisen.
    paddingBottom: '14mm',
    paddingHorizontal: '11mm',
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 10,
    color: TINTA,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: VERDE,
    paddingBottom: 8,
    marginBottom: 8,
  },
  logo: { width: 130, height: 34, objectFit: 'contain', objectPositionX: 0 },
  marcaSub: { fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: GRIS, marginTop: 4 },
  tituloBloque: { alignItems: 'flex-end' },
  titulo: { fontSize: 15, fontWeight: 700, color: TINTA },
  meta: { fontSize: 8.5, color: GRIS, marginTop: 3 },
  contacto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: GRIS,
    marginBottom: 10,
  },
  contactoB: { fontWeight: 700, color: TINTA },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: VERDE,
    color: '#ffffff',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
    marginTop: 4,
  },
  grupoLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' },
  grupoCount: { fontSize: 9, fontWeight: 600 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 0.75,
    borderBottomColor: LINEA,
  },
  foto: { width: 92, height: 66, objectFit: 'cover', borderRadius: 5, backgroundColor: '#edf0ee' },
  fotoVacia: { width: 92, height: 66, borderRadius: 5, backgroundColor: '#edf0ee' },
  datos: { flex: 1 },
  direccion: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.25 },
  ubicacion: { fontSize: 8.5, color: GRIS, marginTop: 2 },
  caract: { fontSize: 10, fontWeight: 600, marginTop: 6 },
  precioCol: { alignItems: 'flex-end', minWidth: 85 },
  precio: { fontSize: 12, fontWeight: 700, color: VERDE },
  precioConsultar: { fontSize: 9.5, fontWeight: 600, color: GRIS },
  precioSub: { fontSize: 7.5, color: GRIS, marginTop: 1 },
  ref: { fontSize: 7, color: '#9aa39d', marginTop: 4 },
  pie: {
    position: 'absolute',
    bottom: '5mm',
    left: '11mm',
    right: '11mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.75,
    borderTopColor: LINEA,
    paddingTop: 5,
    fontSize: 7,
    color: GRIS,
  },
})

// ── Documento ───────────────────────────────────────────────────────────────

export interface AlquilerItemPDF extends AlquilerItem {
  /** Foto ya descargada y achicada por el route handler; null → placeholder */
  fotoData: { data: Buffer; format: 'jpg' | 'png' } | null
}

export function ListadoAlquileresPDF({
  items,
  fecha,
}: {
  items: AlquilerItemPDF[]
  fecha: string
}) {
  const secciones = agruparAlquileres(items) as { label: string; items: AlquilerItemPDF[] }[]
  return (
    <Document
      title={`Alquileres disponibles · SI INMOBILIARIA · ${fecha}`}
      author="SI INMOBILIARIA"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.encabezado}>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src={getLogoSrc()} />
            <Text style={styles.marcaSub}>FUNES · ROLDÁN · ROSARIO</Text>
          </View>
          <View style={styles.tituloBloque}>
            <Text style={styles.titulo}>Alquileres disponibles</Text>
            <Text style={styles.meta}>
              {items.length} propiedades · Actualizado al {fecha}
            </Text>
          </View>
        </View>

        <View style={styles.contacto}>
          <Text>
            WhatsApp Alquileres: <Text style={styles.contactoB}>341 341-5159</Text>
          </Text>
          <Text style={styles.contactoB}>siinmobiliaria.com/propiedades</Text>
        </View>

        {secciones.map((s) => (
          <View key={s.label}>
            <View style={styles.grupoHeader} wrap={false} minPresenceAhead={90}>
              <Text style={styles.grupoLabel}>{s.label}</Text>
              <Text style={styles.grupoCount}>{s.items.length}</Text>
            </View>
            {s.items.map((item) => {
              const precio = precioListado(item)
              return (
                <View key={item.id} style={styles.fila} wrap={false}>
                  {item.fotoData ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image style={styles.foto} src={item.fotoData} />
                  ) : (
                    <View style={styles.fotoVacia} />
                  )}
                  <View style={styles.datos}>
                    <Text style={styles.direccion}>{item.direccion}</Text>
                    <Text style={styles.ubicacion}>{item.ubicacion}</Text>
                    <Text style={styles.caract}>{caracteristicasListado(item)}</Text>
                  </View>
                  <View style={styles.precioCol}>
                    <Text style={precio.main === 'Consultar' ? styles.precioConsultar : styles.precio}>
                      {precio.main}
                    </Text>
                    {precio.sub ? <Text style={styles.precioSub}>{precio.sub}</Text> : null}
                    <Text style={styles.ref}>Ref. {item.referencia}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        <View style={styles.pie} fixed>
          <Text>Precios y disponibilidad sujetos a modificación sin previo aviso.</Text>
          <Text>SI INMOBILIARIA · siinmobiliaria.com</Text>
        </View>
      </Page>
    </Document>
  )
}
