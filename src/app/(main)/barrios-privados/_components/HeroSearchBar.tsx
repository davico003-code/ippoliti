"use client";

// Buscador del hero: pill blanco con dropdown "Barrios" decorativo + input +
// botón verde. Debajo: chips de ejemplos clickeables que cargan el texto en
// el input y disparan el filtrado de GrillaBarrios via Context.

import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { useBarriosHub } from "./BarriosHubProvider";

const CHIPS_EJEMPLOS = ["golf", "laguna", "Kentucky", "Funes Lakes"];

export default function HeroSearchBar() {
  const { search, setSearch } = useBarriosHub();

  function handleChipClick(chip: string) {
    if (search.trim().toLowerCase() === chip.toLowerCase()) {
      setSearch(""); // toggle off si ya está activo
    } else {
      setSearch(chip);
    }
  }

  return (
    <div className="bp-hero-search">
      {/* Pill */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bp-search-pill"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fff",
          padding: 6,
          borderRadius: 999,
          maxWidth: 520,
          boxShadow: "0 4px 16px rgba(10,10,10,.08)",
        }}
      >
        <button
          type="button"
          aria-label="Tipo de búsqueda (decorativo)"
          className="bp-search-dropdown"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#eef4ef",
            border: "none",
            borderRadius: 999,
            padding: "8px 14px 8px 12px",
            fontSize: 13,
            fontWeight: 600,
            color: "#0a0a0a",
            cursor: "pointer",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#1A5C38",
              display: "inline-block",
            }}
          />
          Barrios
          <ChevronDown size={14} strokeWidth={2.2} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 6,
            paddingLeft: 4,
          }}
        >
          <Search size={16} strokeWidth={2} style={{ color: "#777", flexShrink: 0 }} aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar barrio o amenity (golf, laguna, electrógeno…)"
            aria-label="Buscar barrio o amenity"
            className="bp-search-input"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
              color: "#0a0a0a",
            }}
          />
        </div>

        <button
          type="submit"
          aria-label="Buscar"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#1A5C38",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <ArrowRight size={18} strokeWidth={2.2} />
        </button>
      </form>

      {/* Chips de ejemplos */}
      <div
        className="bp-search-chips"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 14,
          fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.9)", marginRight: 2, textShadow: "0 1px 6px rgba(0,0,0,.4)" }}>Probá:</span>
        {CHIPS_EJEMPLOS.map((chip) => {
          const active = search.trim().toLowerCase() === chip.toLowerCase();
          return (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                background: active ? "#1A5C38" : "rgba(255,255,255,.12)",
                color: "#fff",
                border: active ? "1px solid #1A5C38" : "1px solid rgba(255,255,255,.45)",
                backdropFilter: "blur(4px)",
                textShadow: active ? "none" : "0 1px 5px rgba(0,0,0,.35)",
                transition: "background 150ms, color 150ms, border-color 150ms",
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
