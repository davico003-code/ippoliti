// Hero del HUB /barrios-privados — inmersivo: portada full-bleed + velo verde,
// título gigante ("de Funes." en verde menta), subhead y buscador funcional.
// El navbar global va transparente sobre este hero (ver Navbar.tsx: overHero).

import Image from "next/image";
import HeroSearchBar from "./HeroSearchBar";

// Tipografía estilo Apple para el hero (SF Pro en dispositivos Apple).
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

export default function HeroBarrios() {
  return (
    <section className="bp-hero relative flex flex-col justify-center overflow-hidden min-h-[90svh] md:min-h-[100dvh] md:-mt-[77px] md:pt-[77px]">
      <Image
        src="/hero-barrios.webp"
        alt="Barrios cerrados de Funes desde el aire"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Velos verdes para legibilidad del texto blanco */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,20,12,.46) 0%, rgba(6,20,12,0) 16%)" }} />
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(6,20,12,.72) 0%, rgba(6,20,12,.34) 40%, rgba(6,20,12,0) 66%)" }} />
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(6,20,12,.42) 0%, rgba(6,20,12,0) 34%)" }} />

      <div
        className="bp-hero-inner relative z-[2]"
        style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "0 32px" }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontFamily: SF,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.9)",
            textShadow: "0 1px 10px rgba(0,0,0,.4)",
          }}
        >
          Funes · Santa Fe
        </p>

        <h1
          style={{
            fontFamily: SF,
            fontWeight: 700,
            fontSize: "clamp(44px, 7vw, 92px)",
            lineHeight: 0.96,
            letterSpacing: "-0.028em",
            color: "#fff",
            margin: "0 0 18px",
            textShadow: "0 3px 30px rgba(0,0,0,.34)",
          }}
        >
          Barrios cerrados<br />
          <span style={{ color: "#A6E7BE" }}>de Funes.</span>
        </h1>

        <p
          style={{
            fontFamily: SF,
            fontWeight: 400,
            fontSize: "clamp(17px, 2vw, 22px)",
            lineHeight: 1.4,
            color: "rgba(255,255,255,.94)",
            margin: "0 0 34px",
            maxWidth: 460,
            textShadow: "0 1px 12px rgba(0,0,0,.4)",
          }}
        >
          15 barrios explicados por expertos que viven y trabajan en la zona.
        </p>

        <HeroSearchBar />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 640px) {
              .bp-hero-inner { padding: 0 20px !important; }
              /* El dropdown "Barrios" es decorativo (no filtra nada) — en
                 mobile no entra junto al input sin romper el layout, así
                 que se oculta y el buscador queda en una sola fila prolija. */
              .bp-search-dropdown { display: none !important; }
              .bp-search-pill { max-width: none !important; }
              .bp-search-field { padding-left: 8px !important; }
            }
          `,
        }}
      />
    </section>
  );
}
