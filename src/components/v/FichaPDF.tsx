/* eslint-disable jsx-a11y/alt-text */ // <Image> es de @react-pdf, no HTML: no lleva alt
// PDF neutro (white-label) de la ficha verficha.casa. Sin marca SI: la única
// identidad es el dominio, igual que la ficha web. Se usa desde
// /api/ficha/[slug]/pdf vía renderFichaPdf().
//
// Fuente: Helvetica built-in de @react-pdf (soporta acentos Latin-1, sin fetch
// de fuentes ni bug de ligaduras).

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { FichaSnapshot } from '@/lib/ficha'

const ACCENT = '#1A1A1A'
const GREEN = '#1A5C38'

const st = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 30, paddingHorizontal: 36, fontSize: 10, color: '#333' },
  title: { fontSize: 18, fontWeight: 700, color: ACCENT },
  price: { fontSize: 15, fontWeight: 700, color: GREEN, marginTop: 4 },
  zona: { fontSize: 10, color: '#6B7280', marginTop: 3 },
  cover: { width: '100%', height: 250, objectFit: 'cover', borderRadius: 6, marginTop: 12 },
  thumbsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  thumb: { flex: 1, height: 78, objectFit: 'cover', borderRadius: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: { backgroundColor: '#F3F4F6', color: '#374151', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, fontSize: 10 },
  h: { fontSize: 11, fontWeight: 700, color: ACCENT, marginTop: 16, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.6 },
  desc: { fontSize: 10, color: '#4A4A4A', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 10 },
  qr: { width: 54, height: 54 },
  footTxt: { fontSize: 9, color: '#9CA3AF' },
})

function chips(s: FichaSnapshot): string[] {
  const out: string[] = []
  if (s.ambientes) out.push(`${s.ambientes} amb.`)
  if (s.dormitorios) out.push(`${s.dormitorios} dorm.`)
  if (s.banos) out.push(`${s.banos} baño${s.banos > 1 ? 's' : ''}`)
  if (s.cocheras) out.push(`${s.cocheras} coch.`)
  if (s.m2cubiertos) out.push(`${s.m2cubiertos} m² cub.`)
  if (s.m2terreno) out.push(`${s.m2terreno} m² terreno`)
  return out
}

function FichaDoc({ snapshot, url, qrDataUrl }: { snapshot: FichaSnapshot; url: string; qrDataUrl: string | null }) {
  const s = snapshot
  const fotos = (s.fotos || []).filter(u => typeof u === 'string' && u.startsWith('https://'))
  const thumbs = fotos.slice(1, 4)
  const ubic = [s.direccionCalle, s.zonaCompleta || s.zonaAprox].filter(Boolean).join(' · ')
  const desc = (s.descripcion || '').replace(/\s+/g, ' ').trim().slice(0, 900)

  return (
    <Document>
      <Page size="A4" style={st.page}>
        <Text style={st.title}>{s.tituloGenerico || 'Propiedad'}</Text>
        {s.precio ? <Text style={st.price}>{s.operacion ? `${s.operacion} · ` : ''}{s.precio}</Text> : null}
        {ubic ? <Text style={st.zona}>{ubic}</Text> : null}

        {fotos[0] ? <Image src={fotos[0]} style={st.cover} /> : null}
        {thumbs.length > 0 ? (
          <View style={st.thumbsRow}>
            {thumbs.map((u, i) => <Image key={i} src={u} style={st.thumb} />)}
          </View>
        ) : null}

        {chips(s).length > 0 ? (
          <View style={st.chipsRow}>
            {chips(s).map((c, i) => <Text key={i} style={st.chip}>{c}</Text>)}
          </View>
        ) : null}

        {desc ? (
          <View>
            <Text style={st.h}>Descripción</Text>
            <Text style={st.desc}>{desc}</Text>
          </View>
        ) : null}

        <View style={st.footer} fixed>
          {qrDataUrl ? <Image src={qrDataUrl} style={st.qr} /> : <View />}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={st.footTxt}>Ver online:</Text>
            <Text style={st.footTxt}>{url.replace(/^https?:\/\//, '')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function renderFichaPdf(args: {
  snapshot: FichaSnapshot
  url: string
  qrDataUrl: string | null
}): Promise<Buffer> {
  return renderToBuffer(<FichaDoc {...args} />)
}
