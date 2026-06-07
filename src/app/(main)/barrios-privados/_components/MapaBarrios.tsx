// Server Component de la sección del mapa. El dynamic import del cliente
// Leaflet vive en MapaBarriosLazy ("use client"): en Next 14, dynamic
// ssr:false llamado desde un Server Component no code-splittea y leaflet
// terminaba en el First Load JS de /barrios-privados.

import MapaBarriosLazy from "./MapaBarriosLazy";

export default function MapaBarrios() {
  return (
    <section
      className="bp-mapa-section"
      style={{
        background: "#fff",
        padding: "80px 0",
        borderTop: "1px solid #e8e2d5",
        borderBottom: "1px solid #e8e2d5",
      }}
    >
      <div
        className="bp-mapa-header"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 32px" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: "-0.015em",
            color: "#0a0a0a",
            margin: "0 0 8px",
          }}
        >
          Dónde está cada barrio
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#777",
            margin: 0,
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          Tocá un marcador para ver el detalle del barrio.
        </p>
      </div>

      <div
        className="bp-mapa-container"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            height: 520,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #e8e2d5",
          }}
        >
          <MapaBarriosLazy />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 640px) {
              .bp-mapa-section { padding: 60px 0 !important; }
              .bp-mapa-header h2 { font-size: 26px !important; }
              .bp-mapa-container { padding: 0 20px !important; }
              .bp-mapa-container > div { height: 380px !important; }
            }
          `,
        }}
      />
    </section>
  );
}
