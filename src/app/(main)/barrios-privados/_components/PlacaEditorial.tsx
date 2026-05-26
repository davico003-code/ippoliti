import Link from "next/link";
import type { PlacaEditorial as PlacaData } from "../data/placas-editoriales";

// Placa editorial del hero: card 3:4 con imagen de fondo + overlay + texto blanco.
// Si la imagen no carga / no existe, el background queda con el fallbackGradient.

export default function PlacaEditorial({ placa }: { placa: PlacaData }) {
  const badgeStyles =
    placa.badgeVariant === "gold"
      ? { background: "#B8935A", color: "#ffffff" }
      : { background: "rgba(255,255,255,0.95)", color: "#1A5C38" };

  return (
    <Link
      href={placa.href}
      className="bp-placa group block relative overflow-hidden"
      style={{
        aspectRatio: "3 / 4",
        borderRadius: 18,
        backgroundImage: `${placa.fallbackGradient}, url('${placa.imagen}')`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        textDecoration: "none",
      }}
    >
      {/* Overlay inferior para legibilidad */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Badge superior izquierdo */}
      <span
        className="absolute"
        style={{
          top: 16,
          left: 16,
          padding: "6px 11px",
          borderRadius: 999,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          ...badgeStyles,
        }}
      >
        {placa.badge}
      </span>

      {/* Contenido inferior izquierdo */}
      <div
        className="absolute"
        style={{ bottom: 18, left: 18, right: 18, color: "#fff" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: 1.15,
            margin: "0 0 4px",
          }}
        >
          {placa.titulo}
        </h3>
        <p
          style={{
            fontSize: 12,
            opacity: 0.88,
            margin: "0 0 12px",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          {placa.subtitulo}
        </p>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,0.4)",
            paddingBottom: 2,
            display: "inline-block",
          }}
        >
          {placa.cta}
        </span>
      </div>
    </Link>
  );
}
