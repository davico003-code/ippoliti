import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Barrio } from "@/lib/barrios";
import BarrioImage from "@/components/barrios/BarrioImage";

// Hero compacto (240px alto, no 88vh). Solo: foto + breadcrumb + tier badge +
// nombre. Cero texto editorial.

const TIER_LABEL: Record<Barrio["tier"], { label: string; bg: string; color: string }> = {
  Premium:                      { label: "Premium",                 bg: "rgba(255,255,255,0.95)", color: "#1A5C38" },
  Consolidado:                  { label: "Consolidado",             bg: "rgba(255,255,255,0.95)", color: "#B8935A" },
  "Consolidado con vida joven": { label: "Consolidado · vida joven",bg: "rgba(255,255,255,0.95)", color: "#B8935A" },
  "En desarrollo":              { label: "En desarrollo",           bg: "#B8935A",                color: "#ffffff" },
  Próximamente:                 { label: "Próximamente",            bg: "#0a0a0a",                color: "#ffffff" },
};

export default function FichaHero({ barrio }: { barrio: Barrio }) {
  const tier = TIER_LABEL[barrio.tier];

  return (
    <section
      className="ficha-hero relative w-full overflow-hidden"
      style={{ height: 320 }}
    >
      <BarrioImage
        src={barrio.imagenes.hero}
        nombre={barrio.nombre}
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay para legibilidad — gradiente inferior */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.1) 100%)",
        }}
      />

      <div
        className="relative z-10 mx-auto h-full max-w-[1280px] px-6 md:px-10"
        style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 28 }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 14,
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          <Link href="/barrios-privados" style={{ color: "inherit", textDecoration: "none" }}>
            Barrios cerrados
          </Link>
          <ChevronRight size={12} strokeWidth={2} aria-hidden />
          <span style={{ color: "#fff", fontWeight: 500 }}>{barrio.nombre}</span>
        </nav>

        {/* Tier + nombre */}
        <span
          style={{
            display: "inline-block",
            width: "fit-content",
            padding: "5px 11px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            background: tier.bg,
            color: tier.color,
            marginBottom: 10,
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          {tier.label} · Funes
        </span>
        <h1
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "#fff",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
          }}
        >
          {barrio.nombre}
        </h1>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 640px) {
              .ficha-hero { height: 240px !important; }
            }
          `,
        }}
      />
    </section>
  );
}
