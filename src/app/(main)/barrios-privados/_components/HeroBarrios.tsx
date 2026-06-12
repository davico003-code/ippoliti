// Hero del HUB /barrios-privados.
// Grid 2 cols desktop (texto + buscador / 2 placas editoriales), 1 col mobile.

import HeroSearchBar from "./HeroSearchBar";
import PlacaEditorial from "./PlacaEditorial";
import { PLACAS_EDITORIALES } from "../data/placas-editoriales";

// Tipografía estilo Apple para el hero (SF Pro en dispositivos Apple,
// fallback al system font en el resto) — pedido de David jun-2026.
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

export default function HeroBarrios() {
  return (
    <section
      className="bp-hero"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #ececec",
        padding: "64px 0 56px",
      }}
    >
      <div
        className="bp-hero-inner"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        {/* Columna izquierda — minimal, tipografía system Apple */}
        <div>
          <p
            style={{
              margin: "0 0 14px",
              fontFamily: SF,
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#86868b",
            }}
          >
            Funes · Santa Fe
          </p>

          <h1
            style={{
              fontFamily: SF,
              fontWeight: 600,
              fontSize: "clamp(34px, 4.4vw, 54px)",
              lineHeight: 1.06,
              letterSpacing: "-0.018em",
              color: "#1d1d1f",
              margin: "0 0 16px",
            }}
          >
            Barrios cerrados de Funes.
          </h1>

          <p
            style={{
              fontFamily: SF,
              fontWeight: 400,
              fontSize: 17,
              lineHeight: 1.5,
              color: "#6e6e73",
              margin: "0 0 30px",
              maxWidth: 440,
            }}
          >
            Los 15 barrios del corredor, explicados por brokers que viven y
            trabajan en la zona.
          </p>

          <HeroSearchBar />
        </div>

        {/* Columna derecha: 2 placas */}
        <div
          className="bp-hero-placas"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {PLACAS_EDITORIALES.map((placa) => (
            <PlacaEditorial key={placa.href} placa={placa} />
          ))}
        </div>
      </div>

      {/* Hover de placa + responsive. dangerouslySetInnerHTML evita el
          escapado de special chars que rompía la hidratación. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bp-placa { transition: transform 0.4s ease; }
            .bp-placa:hover { transform: translateY(-4px) scale(1.02); }
            @media (max-width: 1023px) {
              .bp-hero-inner { grid-template-columns: 1fr !important; gap: 36px !important; }
              .bp-hero-placas { max-width: 520px; }
            }
            @media (max-width: 640px) {
              .bp-hero { padding: 48px 0 40px !important; }
              .bp-hero-inner { padding: 0 20px !important; }
              .bp-search-pill { flex-wrap: wrap !important; }
            }
          `,
        }}
      />
    </section>
  );
}
