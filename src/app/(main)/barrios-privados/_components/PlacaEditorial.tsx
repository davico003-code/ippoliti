import Image from "next/image";
import Link from "next/link";
import type { PlacaEditorial as PlacaData } from "../data/placas-editoriales";

// Placa editorial del hero: card 3:4 con la portada del barrio (next/image
// fill) + overlay verde oscuro de abajo hacia arriba para legibilidad.
// El fallbackGradient queda como fondo detrás de la imagen por si falta.

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
        background: placa.fallbackGradient,
        textDecoration: "none",
      }}
    >
      {/* Portada del barrio (above the fold → priority) */}
      <Image
        src={placa.imagen}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      {/* Overlay verde oscuro de abajo hacia arriba para legibilidad */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(15,63,38,0.78) 0%, rgba(15,63,38,0.45) 45%, rgba(15,63,38,0.25) 100%)",
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
