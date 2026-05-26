"use client";

// Sticky bar de pills de amenities (debajo del nav, top:73).
// Pills toggle: click agrega/quita el amenity al Set; múltiples = OR lógico.
// Counts se calculan automáticamente de getBarriosHub() por amenity.

import { Flag, Waves, Zap, Footprints, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import {
  AMENITIES_HUB_META,
  getBarriosHub,
  type AmenityHubId,
} from "@/lib/barrios";
import { useBarriosHub } from "./BarriosHubProvider";

const ICON_MAP: Record<string, LucideIcon> = {
  Flag,
  Waves,
  Zap,
  Footprints,
};

export default function FiltrosAmenities() {
  const { amenities, toggleAmenity } = useBarriosHub();

  // Counts por amenity — calculados una vez (la data es estática).
  const counts = useMemo(() => {
    const all = getBarriosHub();
    const map: Record<AmenityHubId, number> = {
      golf: 0, laguna: 0, "grupo-electrogeno": 0, "acceso-peatonal": 0,
    };
    for (const b of all) {
      for (const a of b.amenities) map[a]++;
    }
    return map;
  }, []);

  return (
    <div
      className="bp-filtros"
      style={{
        position: "sticky",
        top: 73,
        zIndex: 50,
        background: "#FAF7F2",
        borderBottom: "1px solid #e8e2d5",
        padding: "28px 0 24px",
      }}
    >
      <div
        className="bp-filtros-scroll"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          gap: 10,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {AMENITIES_HUB_META.map((meta) => {
          const Icon = ICON_MAP[meta.icon] || Flag;
          const active = amenities.has(meta.id);
          const count = counts[meta.id];

          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => toggleAmenity(meta.id)}
              aria-pressed={active}
              className="bp-filtro-pill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px 5px 5px",
                borderRadius: 999,
                background: active ? "#1A5C38" : "#fff",
                color: active ? "#fff" : "#0a0a0a",
                border: active ? "1px solid #1A5C38" : "1px solid transparent",
                boxShadow: "0 1px 3px rgba(10,10,10,.05)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                transition: "transform 150ms, box-shadow 150ms, background 150ms",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${meta.colorFrom} 0%, ${meta.colorTo} 100%)`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color="#fff" strokeWidth={2.2} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</span>
              <span
                style={{
                  fontSize: 12,
                  color: active ? "rgba(255,255,255,0.7)" : "#999",
                  fontWeight: 500,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bp-filtros-scroll::-webkit-scrollbar { display: none; }
            .bp-filtro-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(10,10,10,.08); }
          `,
        }}
      />
    </div>
  );
}
