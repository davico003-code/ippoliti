import Image from "next/image";
import Link from "next/link";
import { TIER_HUB_META, type HubBarrio } from "@/lib/barrios";

// Card de barrio del HUB. Server component — no maneja state propio.

const PROX_GRADIENT_BG =
  "radial-gradient(ellipse at 50% 45%, rgba(40,40,40,0.6) 0%, rgba(0,0,0,0) 60%), linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)";

// Resalta el primer chunk numérico de un dato ("676 lotes" → <strong>676</strong> lotes).
function renderDato(raw: string) {
  const m = raw.match(/^([\d.,–\-]+)\s*(.*)$/);
  if (!m) return raw;
  return (
    <>
      <strong style={{ color: "#0a0a0a", fontWeight: 700 }}>{m[1]}</strong>
      {m[2] ? ` ${m[2]}` : ""}
    </>
  );
}

export default function CardBarrio({ barrio }: { barrio: HubBarrio }) {
  const tierMeta = TIER_HUB_META[barrio.tier];
  const isProx = barrio.tier === "proximamente";

  return (
    <Link
      href={`/barrios-privados/${barrio.slug}`}
      className="bp-card group block overflow-hidden"
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(10,10,10,.05)",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        transition: "transform 250ms ease, box-shadow 250ms ease",
      }}
    >
      {/* Image */}
      <div
        className="bp-card-image"
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: isProx ? PROX_GRADIENT_BG : "#f0ece2",
        }}
      >
        {!isProx && barrio.imagenHero && (
          <Image
            src={barrio.imagenHero}
            alt={barrio.nombre}
            fill
            className="bp-card-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        )}

        {/* Próximamente: SI watermark */}
        {isProx && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.07)",
              fontFamily: "'Orbitron', 'Raleway', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 56,
              letterSpacing: "0.04em",
              userSelect: "none",
            }}
          >
            SI
          </div>
        )}

        {/* Badge tier */}
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 11px",
            borderRadius: 999,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            background: tierMeta.badgeBg,
            color: tierMeta.badgeColor,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          {tierMeta.label}
        </span>
      </div>

      {/* Body */}
      <div
        className="bp-card-body"
        style={{
          padding: "22px 22px 24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 21,
            color: "#0a0a0a",
            letterSpacing: "-0.01em",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          {barrio.nombre}
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "#444",
            lineHeight: 1.5,
            margin: "0 0 18px",
            flex: 1,
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          {barrio.descripcion}
        </p>

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid #f0ece2",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          {isProx ? (
            <span
              style={{
                fontSize: 12.5,
                color: "#1A5C38",
                fontWeight: 600,
              }}
            >
              Avisame cuando salga →
            </span>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                fontSize: 12.5,
                color: "#777",
                fontWeight: 500,
              }}
            >
              {barrio.datos.map((d, i) => (
                <span key={d} style={{ display: "inline-flex", alignItems: "center" }}>
                  {i > 0 && (
                    <span style={{ margin: "0 8px", color: "#bbb" }}>·</span>
                  )}
                  <span>{renderDato(d)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
