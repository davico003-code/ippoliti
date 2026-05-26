import type { Barrio } from "@/lib/barrios";
import { Check } from "lucide-react";

// 3 columnas compactas: Amenities + Infraestructura + Seguridad.
// Cada columna solo se renderea si tiene items. Si NINGUNA tiene → sección
// completa no se monta.

interface Bloque {
  titulo: string;
  items: string[];
}

function getBloques(b: Barrio): Bloque[] {
  const bloques: Bloque[] = [];
  if (b.amenities && b.amenities.length > 0) {
    bloques.push({
      titulo: "Amenities",
      items: b.amenities.map((a) => a.label),
    });
  }
  if (b.infraestructura && b.infraestructura.length > 0) {
    bloques.push({
      titulo: "Infraestructura",
      items: b.infraestructura,
    });
  }
  if (b.seguridad && b.seguridad.length > 0) {
    bloques.push({
      titulo: "Seguridad",
      items: b.seguridad,
    });
  }
  return bloques;
}

export default function FichaCaracteristicas({ barrio }: { barrio: Barrio }) {
  const bloques = getBloques(barrio);
  if (bloques.length === 0) return null;

  return (
    <section style={{ background: "#fff", padding: "40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#0a0a0a",
            margin: "0 0 22px",
            letterSpacing: "-0.01em",
          }}
        >
          Características
        </h2>
        <div
          className="ficha-cars-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${bloques.length}, 1fr)`,
            gap: 28,
          }}
        >
          {bloques.map((b) => (
            <div key={b.titulo}>
              <h3
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#B8935A",
                  margin: "0 0 14px",
                }}
              >
                {b.titulo}
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {b.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 14,
                      color: "#444",
                      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                      lineHeight: 1.4,
                    }}
                  >
                    <Check size={14} strokeWidth={2.4} style={{ color: "#1A5C38", flexShrink: 0, marginTop: 3 }} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .ficha-cars-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
            }
          `,
        }}
      />
    </section>
  );
}
