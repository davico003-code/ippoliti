"use client";

// Grilla 3 cols con el subset filtrado + ordenado.
// Lee state del context (search + amenities + orden) y derivación de getBarriosHub().

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { getBarriosHub, type HubBarrio } from "@/lib/barrios";
import { useBarriosHub, ORDEN_OPCIONES, type OrdenHub } from "./BarriosHubProvider";
import CardBarrio from "./CardBarrio";

// Saca el primer número de los datos para sort "por escala" (más lotes primero).
function parseEscala(b: HubBarrio): number {
  for (const d of b.datos) {
    const m = d.match(/^([\d.]+)/);
    if (m) return parseInt(m[1].replace(/\./g, ""), 10);
  }
  return 0;
}

function matchesSearch(b: HubBarrio, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const haystack = [
    b.nombre,
    b.descripcion,
    ...b.datos,
    ...b.amenities, // permite buscar "golf", "laguna", etc.
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export default function GrillaBarrios() {
  const { search, amenities, orden, setOrden } = useBarriosHub();
  const allBarrios = useMemo(() => getBarriosHub(), []);

  const filtered = useMemo(() => {
    let list = allBarrios.filter((b) => matchesSearch(b, search));
    if (amenities.size > 0) {
      list = list.filter((b) => b.amenities.some((a) => amenities.has(a)));
    }

    // Sort según orden
    const sorted = [...list];
    if (orden === "tier") {
      // Orden ya viene del helper (premium → consolidado → desarrollo → proximamente)
      // — getBarriosHub() ya lo aplica.
    } else if (orden === "escala") {
      sorted.sort((a, b) => parseEscala(b) - parseEscala(a));
    } else if (orden === "nuevos") {
      // Heurística: próximamente primero, después desarrollo, después consolidado, premium.
      const W = { proximamente: 0, desarrollo: 1, consolidado: 2, premium: 3 } as const;
      sorted.sort((a, b) => W[a.tier] - W[b.tier]);
    } else if (orden === "alfabetico") {
      sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }
    return sorted;
  }, [allBarrios, search, amenities, orden]);

  return (
    <>
      {/* Header */}
      <div
        className="bp-grilla-header"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 32px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#0a0a0a",
            margin: 0,
          }}
        >
          Mostrando{" "}
          <span style={{ color: "#1A5C38" }}>{filtered.length}</span> de{" "}
          {allBarrios.length} barrios
        </h2>

        <label
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 38px 9px 16px",
            borderRadius: 999,
            background: "#fff",
            border: "1px solid #e8e2d5",
            boxShadow: "0 1px 3px rgba(10,10,10,.05)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          <span style={{ color: "#777" }}>Ordenar:</span>
          <span style={{ color: "#0a0a0a", fontWeight: 600 }}>
            {ORDEN_OPCIONES.find((o) => o.id === orden)?.label}
          </span>
          <ChevronDown
            size={14}
            style={{ position: "absolute", right: 14, color: "#777" }}
            aria-hidden
          />
          <select
            aria-label="Ordenar por"
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenHub)}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              fontSize: 16, // evita zoom iOS
            }}
          >
            {ORDEN_OPCIONES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid */}
      <div
        className="bp-grilla"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <h3
              style={{
                fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
                fontSize: 22,
                color: "#0a0a0a",
                margin: "0 0 10px",
                fontWeight: 700,
              }}
            >
              No encontramos barrios con esos filtros
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#777",
                margin: 0,
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
              }}
            >
              Probá quitando algún amenity o cambiando el texto.
            </p>
          </div>
        ) : (
          <div
            className="bp-grilla-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {filtered.map((b) => (
              <CardBarrio key={b.slug} barrio={b} />
            ))}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(10,10,10,.12); }
            .bp-card .bp-card-img { transition: transform 0.5s ease; }
            .bp-card:hover .bp-card-img { transform: scale(1.05); }
            @media (max-width: 1023px) {
              .bp-grilla-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 22px !important; }
            }
            @media (max-width: 640px) {
              .bp-grilla { padding: 0 20px 60px !important; }
              .bp-grilla-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
            }
          `,
        }}
      />
    </>
  );
}
