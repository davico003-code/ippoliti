// Datos de la propiedad en dos piezas:
//   • StatsFicha: UNA fila con lo que se mira primero (dormitorios, baños,
//     ambientes y la superficie principal). Etiqueta corta en el celu, y ahí
//     sin ambientes si ya están los dormitorios (si no, no entra en un renglón).
//   • DatosFicha: el resto en celdas chicas (superficies que no son la
//     principal, antigüedad, cocheras, plantas, expensas…). En el celu va
//     debajo de la descripción; en la compu, dentro de la tarjeta fija.
// Solo renderiza datos no vacíos. Terrenos: sin dormitorios/baños.

import { Bath, BedDouble, House, LandPlot, Ruler, type LucideIcon } from 'lucide-react'
import type { FichaSnapshot } from '@/lib/ficha'
import { APAGADO, FONDO_SUAVE, LINEA, TINTA } from './estilos'

const m2 = (n: number) => `${n.toLocaleString('es-AR')} m²`

// Algunas fichas viejas guardaron la situación sin traducir.
const SITUACION: Record<string, string> = {
  owner: 'Habitada por el dueño',
  tenant: 'Con inquilino',
  empty: 'Desocupada',
  vacant: 'Desocupada',
}

function esTerreno(s: FichaSnapshot): boolean {
  return /terreno|lote/i.test(s.tipo || '')
}

// Total igual al lote = dato sucio heredado de Tokko (o getTotalSurface cayó al
// lote porque no había total ni cubierta): no es superficie construida.
function totalEsLote(s: FichaSnapshot): boolean {
  return Boolean(s.m2totales && s.m2terreno && s.m2totales === s.m2terreno)
}

// La superficie que va en la fila principal. Lote → m² de lote; el resto →
// total construida (o cubierta si no hay total, o si el "total" es el lote:
// regla "superficie protagonista", no vender el terreno como construido).
function superficiePrincipal(s: FichaSnapshot): { campo: 'm2terreno' | 'm2totales' | 'm2cubiertos'; valor: number; corta: string; larga: string } | null {
  if (esTerreno(s)) {
    if (s.m2terreno) return { campo: 'm2terreno', valor: s.m2terreno, corta: 'm² lote', larga: 'm² de lote' }
    if (s.m2totales) return { campo: 'm2totales', valor: s.m2totales, corta: 'm²', larga: 'm² totales' }
    return null
  }
  if (s.m2totales && !totalEsLote(s)) return { campo: 'm2totales', valor: s.m2totales, corta: 'm²', larga: 'm² totales' }
  if (s.m2cubiertos) return { campo: 'm2cubiertos', valor: s.m2cubiertos, corta: 'm² cub.', larga: 'm² cubiertos' }
  return null
}

interface Stat {
  Icon: LucideIcon
  valor: string
  corta: string
  larga: string
  soloCompu?: boolean
}

export function StatsFicha({ snapshot: s }: { snapshot: FichaSnapshot }) {
  const items: Stat[] = []
  if (!esTerreno(s)) {
    if (s.dormitorios) items.push({ Icon: BedDouble, valor: String(s.dormitorios), corta: 'dorm.', larga: s.dormitorios === 1 ? 'dormitorio' : 'dormitorios' })
    if (s.banos) items.push({ Icon: Bath, valor: String(s.banos), corta: s.banos === 1 ? 'baño' : 'baños', larga: s.banos === 1 ? 'baño' : 'baños' })
    if (s.ambientes) items.push({ Icon: House, valor: String(s.ambientes), corta: 'amb.', larga: 'ambientes', soloCompu: Boolean(s.dormitorios) })
  }
  const sup = superficiePrincipal(s)
  if (sup) {
    items.push({ Icon: sup.campo === 'm2terreno' ? LandPlot : Ruler, valor: sup.valor.toLocaleString('es-AR'), corta: sup.corta, larga: sup.larga })
  }
  if (esTerreno(s) && s.frenteM && s.fondoM) {
    items.push({ Icon: Ruler, valor: `${s.frenteM} × ${s.fondoM}`, corta: 'm', larga: 'm (frente × fondo)' })
  }
  if (items.length === 0) return null

  return (
    <div
      className="vf-stats"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        borderTop: `1px solid ${LINEA}`,
        borderBottom: `1px solid ${LINEA}`,
      }}
    >
      {items.map(it => (
        <div key={it.larga} className={it.soloCompu ? 'vf-solo-compu' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
          <it.Icon size={19} strokeWidth={1.7} color={TINTA} aria-hidden />
          <b style={{ fontSize: 16, fontWeight: 700, color: TINTA }}>{it.valor}</b>
          <span className="vf-corta" style={{ fontSize: 13, color: APAGADO }}>{it.corta}</span>
          <span className="vf-larga" style={{ fontSize: 15, color: APAGADO }}>{it.larga}</span>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        .vf-stats { justify-content: space-between; gap: 10px 14px; padding: 16px 0; }
        .vf-larga { display: none; }
        .vf-stats .vf-solo-compu { display: none !important; }
        @media (min-width: 1024px) {
          .vf-stats .vf-solo-compu { display: flex !important; }
          .vf-stats { justify-content: flex-start; gap: 12px 36px; padding: 20px 0; }
          .vf-corta { display: none; }
          .vf-larga { display: inline; }
        }
      ` }} />
    </div>
  )
}

export function datosFicha(s: FichaSnapshot): Array<{ label: string; valor: string; soloCelu?: boolean }> {
  const out: Array<{ label: string; valor: string; soloCelu?: boolean }> = []
  const principal = superficiePrincipal(s)?.campo
  // En el celu la fila principal no muestra ambientes cuando hay dormitorios
  // (no entra en un renglón): va acá. En la compu ya está en la fila.
  if (!esTerreno(s) && s.ambientes && s.dormitorios) out.push({ label: 'Ambientes', valor: String(s.ambientes), soloCelu: true })
  if (s.m2cubiertos && principal !== 'm2cubiertos') out.push({ label: 'Cubierta', valor: m2(s.m2cubiertos) })
  if (s.m2semicubiertos) out.push({ label: 'Semicubierta', valor: m2(s.m2semicubiertos) })
  if (s.m2descubiertos) out.push({ label: 'Descubierta', valor: m2(s.m2descubiertos) })
  // Tokko suele repetir la superficie del lote como "total" (en lotes y en
  // algunas casas): ahí no hay "total construida" que mostrar.
  if (s.m2totales && principal !== 'm2totales' && !totalEsLote(s)) {
    out.push({ label: 'Total construida', valor: m2(s.m2totales) })
  }
  if (s.m2terreno && principal !== 'm2terreno') out.push({ label: 'Terreno', valor: m2(s.m2terreno) })
  if (!esTerreno(s) || !(s.frenteM && s.fondoM)) {
    if (s.frenteM && s.fondoM) out.push({ label: 'Frente × fondo', valor: `${s.frenteM} × ${s.fondoM} m` })
    else if (s.frenteM) out.push({ label: 'Frente', valor: `${s.frenteM} m` })
    else if (s.fondoM) out.push({ label: 'Fondo', valor: `${s.fondoM} m` })
  }
  if (!esTerreno(s) && s.cocheras) out.push({ label: s.cocheras === 1 ? 'Cochera' : 'Cocheras', valor: String(s.cocheras) })
  const aEstrenar = s.antiguedad === 0
  if (typeof s.antiguedad === 'number') {
    out.push({ label: 'Antigüedad', valor: aEstrenar ? 'A estrenar' : `${s.antiguedad} ${s.antiguedad === 1 ? 'año' : 'años'}` })
  }
  // "Estado: A estrenar" repetía la antigüedad.
  if (s.estado && !(aEstrenar && /estrenar/i.test(s.estado))) out.push({ label: 'Estado', valor: s.estado })
  if (s.pisos && s.pisos > 1) out.push({ label: 'Plantas', valor: String(s.pisos) })
  if (s.piso) out.push({ label: 'Piso', valor: /^\d+$/.test(s.piso) ? `${s.piso}°` : s.piso })
  if (s.orientacion) out.push({ label: 'Orientación', valor: s.orientacion })
  if (s.disposicion) out.push({ label: 'Disposición', valor: s.disposicion })
  if (s.situacion) out.push({ label: 'Situación', valor: SITUACION[s.situacion.toLowerCase()] ?? s.situacion })
  if (s.expensas && s.expensas > 0) out.push({ label: 'Expensas', valor: `$ ${s.expensas.toLocaleString('es-AR')}` })
  return out
}

export function DatosFicha({ snapshot }: { snapshot: FichaSnapshot }) {
  const datos = datosFicha(snapshot)
  if (datos.length === 0) return null
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, margin: 0 }}>
      {datos.map(d => (
        <div key={d.label} className={d.soloCelu ? 'lg:hidden' : undefined} style={{ background: FONDO_SUAVE, borderRadius: 12, padding: '10px 12px' }}>
          <dt style={{ fontSize: 13, color: APAGADO }}>{d.label}</dt>
          <dd style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600, color: TINTA }}>{d.valor}</dd>
        </div>
      ))}
    </dl>
  )
}
