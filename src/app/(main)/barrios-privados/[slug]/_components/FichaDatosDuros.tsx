import type { Barrio } from "@/lib/barrios";

// Grid de datos duros. Solo renderea los campos que existen en barrio.datosDuros.
// Si NO hay datos, la sección entera no se monta.

interface Stat {
  value: string;
  unit: string;
  label: string;
}

function buildStats(b: Barrio): Stat[] {
  const d = b.datosDuros;
  const stats: Stat[] = [];

  if (d.cantidadLotes && d.cantidadLotes > 0) {
    stats.push({
      value: d.cantidadLotes.toLocaleString("es-AR"),
      unit: "",
      label: "Lotes totales",
    });
  }
  if (d.hectareasTotales && d.hectareasTotales > 0) {
    stats.push({
      value: d.hectareasTotales.toLocaleString("es-AR"),
      unit: "ha",
      label: "Superficie total",
    });
  }
  if (d.medidaLoteDesde && d.medidaLoteHasta) {
    stats.push({
      value: `${d.medidaLoteDesde.toLocaleString("es-AR")}–${d.medidaLoteHasta.toLocaleString("es-AR")}`,
      unit: "m²",
      label: "Medida de lote",
    });
  } else if (d.medidaLoteDesde) {
    stats.push({
      value: `desde ${d.medidaLoteDesde.toLocaleString("es-AR")}`,
      unit: "m²",
      label: "Medida de lote",
    });
  }
  if (d.espaciosVerdesM2 && d.espaciosVerdesM2 > 0) {
    stats.push({
      value: d.espaciosVerdesM2.toLocaleString("es-AR"),
      unit: "m²",
      label: "Espacios verdes",
    });
  }

  return stats;
}

export default function FichaDatosDuros({ barrio }: { barrio: Barrio }) {
  const stats = buildStats(barrio);
  if (stats.length === 0) return null;

  return (
    <section style={{ background: "#fff", padding: "32px 0" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#0a0a0a",
            margin: "0 0 18px",
            letterSpacing: "-0.01em",
          }}
        >
          Dimensiones
        </h2>
        <div
          className="ficha-datos-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: 1,
            background: "#f0ece2",
            border: "1px solid #f0ece2",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#FAF7F2",
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#0a0a0a",
                  lineHeight: 1.1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.value}
                {s.unit && (
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#B8935A", marginLeft: 4 }}>
                    {s.unit}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#777",
                  marginTop: 8,
                  fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 640px) {
              .ficha-datos-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
          `,
        }}
      />
    </section>
  );
}
