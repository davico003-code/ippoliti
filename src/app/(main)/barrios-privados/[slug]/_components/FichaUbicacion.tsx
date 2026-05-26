import type { Barrio } from "@/lib/barrios";
import { MapPin, Navigation, Clock } from "lucide-react";

// Ubicación compacta: dirección de ingreso + referencia + distancia + accesos.
// Solo renderea los campos que existen (no inventa).

export default function FichaUbicacion({ barrio }: { barrio: Barrio }) {
  const u = barrio.ubicacion;
  const hayDireccion = !!u.direccionIngreso;
  const hayReferencia = !!u.referencia;
  const hayDistancia = typeof u.distanciaCentroRosarioMin === "number";
  const hayAccesos = u.accesos && u.accesos.length > 0;

  if (!hayDireccion && !hayReferencia && !hayDistancia && !hayAccesos) return null;

  return (
    <section style={{ background: "#FAF7F2", padding: "40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
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
          Ubicación
        </h2>

        <div
          className="ficha-ubi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            background: "#fff",
            border: "1px solid #e8e2d5",
            borderRadius: 12,
            padding: 24,
          }}
        >
          {/* Dirección + distancia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {hayDireccion && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <MapPin size={16} strokeWidth={2} style={{ color: "#1A5C38", flexShrink: 0, marginTop: 2 }} aria-hidden />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#B8935A",
                      fontWeight: 700,
                      marginBottom: 4,
                      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    }}
                  >
                    Dirección de ingreso
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#0a0a0a",
                      fontWeight: 500,
                      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    }}
                  >
                    {u.direccionIngreso}
                  </div>
                  {hayReferencia && (
                    <div style={{ fontSize: 13, color: "#777", marginTop: 4, fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }}>
                      {u.referencia}
                    </div>
                  )}
                </div>
              </div>
            )}

            {hayDistancia && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Clock size={16} strokeWidth={2} style={{ color: "#1A5C38", flexShrink: 0, marginTop: 2 }} aria-hidden />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#B8935A",
                      fontWeight: 700,
                      marginBottom: 4,
                      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    }}
                  >
                    A Rosario centro
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#0a0a0a",
                      fontWeight: 500,
                      fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    }}
                  >
                    {u.distanciaCentroRosarioMin} min en auto
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accesos */}
          {hayAccesos && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Navigation size={16} strokeWidth={2} style={{ color: "#1A5C38", flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#B8935A",
                    fontWeight: 700,
                    marginBottom: 8,
                    fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                  }}
                >
                  Accesos
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  {u.accesos!.map((acc) => (
                    <li
                      key={acc}
                      style={{
                        fontSize: 14,
                        color: "#0a0a0a",
                        fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                      }}
                    >
                      • {acc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .ficha-ubi-grid { grid-template-columns: 1fr !important; }
            }
          `,
        }}
      />
    </section>
  );
}
