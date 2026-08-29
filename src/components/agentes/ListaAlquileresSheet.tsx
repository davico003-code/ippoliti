'use client'

// Hoja A4 imprimible con todos los alquileres disponibles.
//
// La página server (/agentes/lista-alquileres) proyecta el feed a AlquilerItem
// y acá solo se agrupa por tipología y se renderiza. El botón usa window.print():
// desde el diálogo del navegador se imprime directo o se guarda como PDF.
//
// El @media print aísla la hoja con el truco de visibility (el resto del
// chrome — navbar del sitio, footer, WhatsApp flotante — queda oculto) y
// los cortes de página respetan filas y headers de grupo (break-inside).

import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

export interface AlquilerItem {
  id: number
  direccion: string
  ubicacion: string
  tipoId: number | null
  foto: string | null
  /** null → "Consultar" (web_price false o sin monto cargado) */
  precio: number | null
  moneda: string | null
  dormitorios: number
  banos: number
  superficie: number | null
  cocheras: number
  referencia: string
}

// Grupos por type.id de Tokko (ver PROPERTY_TYPE_LABELS / TYPE_FILTER_GROUPS
// en lib/tokko.ts — agrupar por id, nunca por substring del nombre).
const GRUPOS: { label: string; ids: number[] }[] = [
  { label: 'Casas', ids: [3, 4, 13] },
  { label: 'Departamentos', ids: [2] },
  { label: 'Locales y oficinas', ids: [5, 7] },
  { label: 'Galpones y depósitos', ids: [12, 14, 24] },
  { label: 'Cocheras', ids: [10] },
  { label: 'Terrenos y campos', ids: [1, 9] },
]

const ES_VIVIENDA = new Set([2, 3, 4, 13])

function precioFmt(item: AlquilerItem): { main: string; sub: string } {
  if (!item.precio) return { main: 'Consultar', sub: '' }
  const n = item.precio.toLocaleString('es-AR')
  return item.moneda === 'USD'
    ? { main: `USD ${n}`, sub: 'por mes' }
    : { main: `$ ${n}`, sub: 'por mes' }
}

function caracteristicas(item: AlquilerItem): string {
  const out: string[] = []
  if (ES_VIVIENDA.has(item.tipoId ?? -1)) {
    if (item.tipoId === 2 && item.dormitorios === 0) out.push('Monoambiente')
    else if (item.dormitorios > 0) out.push(`${item.dormitorios} dorm.`)
  }
  if (item.banos > 0) out.push(`${item.banos} baño${item.banos > 1 ? 's' : ''}`)
  if (item.superficie) out.push(`${Math.round(item.superficie).toLocaleString('es-AR')} m²`)
  if (item.cocheras > 0) out.push('cochera')
  return out.join('  ·  ')
}

export default function ListaAlquileresSheet({
  items,
  fecha,
}: {
  items: AlquilerItem[]
  fecha: string
}) {
  // Dentro de cada grupo: ARS primero (más chico a más grande), después USD,
  // y al final las que van sin precio publicado ("Consultar").
  const rank = (i: AlquilerItem) => (i.precio ? (i.moneda === 'USD' ? 1 : 0) : 2)
  const orden = (a: AlquilerItem, b: AlquilerItem) =>
    rank(a) - rank(b) || (a.precio ?? Infinity) - (b.precio ?? Infinity)

  const usados = new Set<number>()
  const secciones: { label: string; items: AlquilerItem[] }[] = []
  for (const g of GRUPOS) {
    const grupo = items.filter((i) => g.ids.includes(i.tipoId ?? -1))
    grupo.forEach((i) => usados.add(i.id))
    if (grupo.length) secciones.push({ label: g.label, items: grupo.sort(orden) })
  }
  const otros = items.filter((i) => !usados.has(i.id))
  if (otros.length) secciones.push({ label: 'Otros', items: otros.sort(orden) })

  return (
    <div className="la-fondo">
      <div className="la-toolbar">
        <Link href="/agentes" className="la-volver">
          <ArrowLeft size={16} strokeWidth={2.2} /> Panel
        </Link>
        <span className="la-nota">
          {items.length} alquileres · Sale en hoja A4 tal como se ve
        </span>
        <button type="button" className="la-btn" onClick={() => window.print()}>
          <Printer size={16} strokeWidth={2.2} /> Imprimir / Guardar PDF
        </button>
      </div>

      <div className="la-hoja" id="hoja-alquileres">
        <header className="la-encabezado">
          <div className="la-marca">
            SI INMOBILIARIA
            <small>FUNES · ROLDÁN · ROSARIO</small>
          </div>
          <div className="la-encabezado-der">
            <h1>Alquileres disponibles</h1>
            <div className="la-meta">
              {items.length} propiedades · Actualizado al {fecha}
            </div>
          </div>
        </header>
        <div className="la-contacto">
          <span>
            WhatsApp Alquileres: <b>341 341-5159</b>
          </span>
          <span>
            <b>siinmobiliaria.com/propiedades</b>
          </span>
        </div>

        {secciones.map((s) => (
          <section className="la-grupo" key={s.label}>
            <div className="la-grupo-header">
              <span>{s.label}</span>
              <span className="la-grupo-count">{s.items.length}</span>
            </div>
            {s.items.map((item) => {
              const precio = precioFmt(item)
              return (
                <article className="la-fila" key={item.id}>
                  {item.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="la-foto" src={item.foto} alt="" />
                  ) : (
                    <div className="la-foto" />
                  )}
                  <div className="la-datos">
                    <div className="la-direccion">{item.direccion}</div>
                    <div className="la-ubicacion">{item.ubicacion}</div>
                    <div className="la-caract">{caracteristicas(item)}</div>
                  </div>
                  <div className="la-precio-col">
                    <div className={`la-precio${precio.main === 'Consultar' ? ' la-consultar' : ''}`}>
                      {precio.main}
                    </div>
                    {precio.sub && <div className="la-precio-sub">{precio.sub}</div>}
                    <div className="la-ref">Ref. {item.referencia}</div>
                  </div>
                </article>
              )
            })}
          </section>
        ))}

        <footer className="la-pie">
          <span>Precios y disponibilidad sujetos a modificación sin previo aviso.</span>
          <span>SI INMOBILIARIA · siinmobiliaria.com</span>
        </footer>
      </div>

      <style>{`
        .la-fondo {
          background: #eceeed;
          min-height: 100vh;
          padding-bottom: 60px;
          font-family: var(--font-raleway), system-ui, sans-serif;
          color: #101613;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .la-toolbar {
          position: sticky; top: 0; z-index: 10;
          background: #fff; border-bottom: 1px solid #e3e7e4;
          padding: 12px 20px; display: flex; align-items: center; gap: 16px;
        }
        .la-volver {
          display: inline-flex; align-items: center; gap: 6px;
          color: #101613; text-decoration: none;
          font-weight: 700; font-size: 14px;
        }
        .la-nota {
          color: #5c645f; font-size: 12.5px; margin-right: auto;
          font-family: var(--font-poppins), sans-serif;
        }
        .la-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1A5C38; color: #fff; border: 0; border-radius: 10px;
          cursor: pointer; font-family: var(--font-poppins), sans-serif;
          font-weight: 600; font-size: 13.5px; padding: 10px 18px;
        }
        .la-btn:hover { background: #143E27; }

        .la-hoja {
          max-width: 194mm; margin: 24px auto 0; background: #fff;
          padding: 12mm 11mm; box-shadow: 0 2px 24px rgba(0,0,0,.10);
        }
        .la-encabezado {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; border-bottom: 2.5px solid #1A5C38;
          padding-bottom: 10px; margin-bottom: 4mm;
        }
        .la-marca { font-size: 21px; font-weight: 800; color: #1A5C38; line-height: 1.1; }
        .la-marca small {
          display: block; font-size: 10.5px; font-weight: 600;
          letter-spacing: .14em; color: #5c645f; margin-top: 2px;
        }
        .la-encabezado-der { text-align: right; }
        .la-encabezado-der h1 { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; margin: 0; }
        .la-meta { font-family: var(--font-poppins), sans-serif; font-size: 10.5px; color: #5c645f; margin-top: 3px; }
        .la-contacto {
          display: flex; justify-content: space-between;
          font-family: var(--font-poppins), sans-serif;
          font-size: 10px; color: #5c645f; margin-bottom: 5mm;
        }
        .la-contacto b { color: #101613; font-weight: 600; }

        .la-grupo { margin-bottom: 4mm; }
        .la-grupo-header {
          display: flex; align-items: center; justify-content: space-between;
          background: #1A5C38; color: #fff; border-radius: 6px;
          padding: 4.5px 12px; margin-bottom: 2.5mm;
          font-size: 12.5px; font-weight: 700; letter-spacing: .04em;
          text-transform: uppercase;
          break-inside: avoid; break-after: avoid; page-break-after: avoid;
        }
        .la-grupo-count { font-family: var(--font-poppins), sans-serif; font-weight: 600; font-size: 11px; opacity: .9; }

        .la-fila {
          display: flex; align-items: center; gap: 5mm;
          padding: 2.6mm 1mm; border-bottom: 1px solid #e3e7e4;
          break-inside: avoid; page-break-inside: avoid;
        }
        .la-grupo .la-fila:last-child { border-bottom: 0; }
        .la-foto {
          width: 33mm; height: 24mm; object-fit: cover;
          border-radius: 2mm; background: #edf0ee; flex-shrink: 0;
        }
        .la-datos { flex: 1; min-width: 0; }
        .la-direccion { font-size: 16px; font-weight: 700; line-height: 1.25; }
        .la-ubicacion { font-family: var(--font-poppins), sans-serif; font-size: 11.5px; color: #5c645f; margin-top: 2px; }
        .la-caract { font-family: var(--font-poppins), sans-serif; font-size: 13px; font-weight: 500; margin-top: 6px; }
        .la-precio-col { text-align: right; flex-shrink: 0; min-width: 30mm; }
        .la-precio {
          font-family: var(--font-poppins), sans-serif;
          font-size: 14.5px; font-weight: 700; color: #1A5C38; white-space: nowrap;
        }
        .la-consultar { font-size: 12px; color: #5c645f; font-weight: 600; }
        .la-precio-sub { font-family: var(--font-poppins), sans-serif; font-size: 9.5px; color: #5c645f; }
        .la-ref { font-family: var(--font-poppins), sans-serif; font-size: 8.5px; color: #9aa39d; margin-top: 4px; }

        .la-pie {
          border-top: 1px solid #e3e7e4; margin-top: 5mm; padding-top: 3mm;
          font-family: var(--font-poppins), sans-serif; font-size: 9px; color: #5c645f;
          display: flex; justify-content: space-between;
        }

        @page { size: A4 portrait; margin: 9mm 8mm; }
        @media print {
          /* Solo la hoja: el resto del sitio (navbar, footer, flotantes) se oculta. */
          body * { visibility: hidden; }
          #hoja-alquileres, #hoja-alquileres * { visibility: visible; }
          #hoja-alquileres {
            position: absolute; left: 0; top: 0; width: 100%;
            max-width: none; margin: 0; padding: 0; box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}
