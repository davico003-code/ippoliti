// Hero del HUB /barrios-privados.
// Grid 2 cols desktop (texto + buscador / 2 placas editoriales), 1 col mobile.

import HeroSearchBar from "./HeroSearchBar";
import PlacaEditorial from "./PlacaEditorial";
import { PLACAS_EDITORIALES } from "../data/placas-editoriales";

export default function HeroBarrios() {
  return (
    <section
      className="bp-hero"
      style={{
        background: "#FAF7F2",
        borderBottom: "1px solid #e8e2d5",
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
        {/* Columna izquierda */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 24,
                height: 1,
                background: "#B8935A",
              }}
            />
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#B8935A",
              }}
            >
              Funes · Santa Fe
            </p>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(40px, 5.2vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "#0a0a0a",
              margin: "0 0 22px",
            }}
          >
            Los 15 barrios cerrados de Funes.
          </h1>

          <p
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 17,
              lineHeight: 1.55,
              color: "#444",
              margin: "0 0 30px",
              maxWidth: 480,
            }}
          >
            Información útil sobre amenities, escala y para qué tipo de comprador
            funciona cada uno. Sin filtros, escrito por brokers que viven y trabajan
            en la zona.
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
