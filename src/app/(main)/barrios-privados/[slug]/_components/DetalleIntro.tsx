import type { Barrio } from "@/lib/barrios";
import { INTRO_EDITORIAL } from "./intro-editorial";

// Intro editorial (storytelling de broker) a 2 columnas: texto + tarjeta de
// datos rápidos. Los chips de amenities viven ahora en DetalleAmenities.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

const ESTADO_LABEL: Record<Barrio["estado"], string> = {
  consolidado: "Consolidado",
  "en-desarrollo": "En desarrollo",
  "pre-venta": "Pre-venta",
};

interface Fact {
  lbl: string;
  val: string;
}

function buildFacts(barrio: Barrio): Fact[] {
  const d = barrio.datosDuros;
  const fmt = (n: number) => n.toLocaleString("es-AR");
  const facts: Fact[] = [{ lbl: "Ubicación", val: "Funes, Santa Fe" }];
  facts.push({ lbl: "Estado", val: ESTADO_LABEL[barrio.estado] });
  if (d.cantidadLotes) facts.push({ lbl: "Lotes", val: fmt(d.cantidadLotes) });
  if (d.medidaLoteDesde) {
    const rango =
      d.medidaLoteHasta && d.medidaLoteHasta !== d.medidaLoteDesde
        ? `${fmt(d.medidaLoteDesde)}–${fmt(d.medidaLoteHasta)} m²`
        : `${fmt(d.medidaLoteDesde)} m²`;
    facts.push({ lbl: "Medida de lote", val: rango });
  }
  if (d.hectareasTotales) facts.push({ lbl: "Superficie", val: `${fmt(d.hectareasTotales)} ha` });
  if (barrio.expensas) facts.push({ lbl: "Expensas", val: barrio.expensas });
  return facts;
}

export default function DetalleIntro({ barrio }: { barrio: Barrio }) {
  const editorial = INTRO_EDITORIAL[barrio.slug];
  const titulo = editorial?.titulo ?? barrio.miradaBroker.titular;
  const parrafos = editorial?.parrafos ?? [barrio.miradaBroker.parrafo];
  const facts = buildFacts(barrio);

  return (
    <section id="resumen" className="scroll-mt-28 bg-white py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 md:grid-cols-[1.5fr_0.9fr] md:gap-14 md:px-8">
        <div>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]"
            style={{ fontFamily: P }}
          >
            El barrio
          </span>
          <h2
            className="mb-5 mt-2 text-[1.7rem] leading-[1.15] text-[#0E1A14] md:text-[2.2rem]"
            style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em", textWrap: "balance" }}
          >
            {titulo}
          </h2>
          <div className="space-y-4">
            {parrafos.map((p, i) => (
              <p
                key={i}
                className="max-w-[60ch] text-[15px] leading-[1.75] text-[#4A5852] md:text-base"
                style={{ fontFamily: P }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Tarjeta de datos rápidos */}
        <aside className="h-fit rounded-2xl border border-black/10 bg-white px-5 md:px-6">
          {facts.map((f, i) => (
            <div
              key={f.lbl}
              className={`flex items-center justify-between gap-4 py-[15px] text-[14px] ${
                i < facts.length - 1 ? "border-b border-black/[0.08]" : ""
              }`}
              style={{ fontFamily: P }}
            >
              <span className="text-[#5C6B62]">{f.lbl}</span>
              <span className="text-right font-semibold text-[#0E1A14]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {f.val}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
