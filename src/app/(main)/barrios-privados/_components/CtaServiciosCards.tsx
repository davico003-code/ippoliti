// CTA final con 3 cards (visita / whatsapp / tasación). Primera card destacada
// en variante "primary" con halo gold.

import Link from "next/link";
import { MapPin, MessageCircle, TrendingUp, type LucideIcon } from "lucide-react";

interface CardSpec {
  icon: LucideIcon;
  titulo: string;
  desc: string;
  cta: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "default";
}

const CARDS: CardSpec[] = [
  {
    icon: MapPin,
    titulo: "Visita guiada",
    desc: "Te organizamos visitas a los barrios que te interesan en una sola tarde. Ahorrate semanas de búsqueda.",
    cta: "Coordinar visita →",
    href: "https://wa.me/5493413340916",
    external: true,
    variant: "primary",
  },
  {
    icon: MessageCircle,
    titulo: "WhatsApp directo",
    desc: "Hablá con David sobre el barrio que te interesa. Respuesta rápida y sin filtros de venta.",
    cta: "Abrir chat →",
    href: "https://wa.me/5493413340916",
    external: true,
  },
  {
    icon: TrendingUp,
    titulo: "Tasación profesional",
    desc: "Si pensás vender o invertir, te tasamos tu propiedad con criterio técnico. Reporte por escrito.",
    cta: "Pedir tasación →",
    href: "/tasaciones",
  },
];

function CardCta({ card }: { card: CardSpec }) {
  const Icon = card.icon;
  const isPrimary = card.variant === "primary";

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    padding: "32px 28px 28px",
    borderRadius: 16,
    background: isPrimary ? "rgba(184,147,90,0.1)" : "rgba(255,255,255,0.04)",
    border: isPrimary
      ? "1px solid rgba(184,147,90,0.25)"
      : "1px solid rgba(255,255,255,0.08)",
    textDecoration: "none",
    color: "#fff",
    transition: "background 200ms, border-color 200ms, transform 200ms",
  };

  const iconWrap: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: isPrimary ? "#B8935A" : "rgba(184,147,90,0.15)",
    color: isPrimary ? "#0a0a0a" : "#B8935A",
    marginBottom: 22,
  };

  const content = (
    <>
      <div style={iconWrap}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "-0.01em",
          margin: "0 0 10px",
          color: "#fff",
        }}
      >
        {card.titulo}
      </h3>
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.55,
          margin: "0 0 20px",
          opacity: 0.7,
          flex: 1,
          fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          color: "#fff",
        }}
      >
        {card.desc}
      </p>
      <span
        className="bp-cta-link"
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "#B8935A",
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "gap 200ms",
          fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
        }}
      >
        {card.cta}
      </span>
    </>
  );

  if (card.external) {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`bp-cta-card ${isPrimary ? "primary" : ""}`}
        style={cardStyle}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={card.href}
      className={`bp-cta-card ${isPrimary ? "primary" : ""}`}
      style={cardStyle}
    >
      {content}
    </Link>
  );
}

export default function CtaServiciosCards() {
  return (
    <section
      className="bp-cta-section"
      style={{
        background: "#0a0a0a",
        color: "#fff",
        padding: "88px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 48px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 42px)",
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            margin: "0 0 14px",
          }}
        >
          ¿Querés que un broker local{" "}
          <span style={{ color: "#B8935A", fontWeight: 700 }}>
            te ayude a elegir?
          </span>
        </h2>
        <p
          style={{
            fontSize: 15,
            opacity: 0.65,
            margin: "0 auto",
            maxWidth: 580,
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          Tres formas de avanzar — elegí la que más te convenga. Atiende David
          Flores · Mat. N° 0621.
        </p>
      </div>

      <div
        className="bp-cta-grid"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        {CARDS.map((c) => (
          <CardCta key={c.titulo} card={c} />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bp-cta-card:hover {
              transform: translateY(-4px);
              background: rgba(255,255,255,0.07);
              border-color: rgba(184,147,90,0.4);
            }
            .bp-cta-card.primary:hover {
              background: rgba(184,147,90,0.15);
              border-color: #B8935A;
            }
            .bp-cta-card:hover .bp-cta-link { gap: 10px; }
            @media (max-width: 1023px) {
              .bp-cta-grid { grid-template-columns: 1fr !important; max-width: 520px !important; }
            }
            @media (max-width: 640px) {
              .bp-cta-section { padding: 56px 20px !important; }
            }
          `,
        }}
      />
    </section>
  );
}
