import Image from "next/image";
import Link from "next/link";
import type { Barrio } from "@/lib/barrios";

// Hero inmersivo: portada full-bleed + velo verde oscuro, breadcrumb sutil,
// badge tier con punto verde, nombre en peso liviano y fila de stats con
// separadores finos blancos. Fallback sin foto: verde de marca con patrón.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

interface Stat {
  valor: string;
  label: string;
}

function buildStats(barrio: Barrio): Stat[] {
  const d = barrio.datosDuros;
  const fmt = (n: number) => n.toLocaleString("es-AR");
  const stats: Stat[] = [];
  if (d.cantidadLotes) stats.push({ valor: fmt(d.cantidadLotes), label: "lotes" });
  if (d.hectareasTotales) stats.push({ valor: `${fmt(d.hectareasTotales)} ha`, label: "superficie" });
  if (d.medidaLoteDesde) {
    const rango =
      d.medidaLoteHasta && d.medidaLoteHasta !== d.medidaLoteDesde
        ? `${fmt(d.medidaLoteDesde)}–${fmt(d.medidaLoteHasta)} m²`
        : `${fmt(d.medidaLoteDesde)} m²`;
    stats.push({ valor: rango, label: "medida de lote" });
  }
  if (d.espaciosVerdesM2) stats.push({ valor: `${fmt(d.espaciosVerdesM2)} m²`, label: "espacios verdes" });
  return stats.slice(0, 4);
}

export default function DetalleHero({ barrio, portada }: { barrio: Barrio; portada: string | null }) {
  const stats = buildStats(barrio);

  return (
    <section className="relative flex min-h-[78vh] flex-col justify-end overflow-hidden md:min-h-[86vh]">
      {/* Fondo: portada o fallback verde con patrón sutil */}
      {portada ? (
        <>
          <Image
            src={portada}
            alt={`${barrio.nombreCompleto}, Funes — vista del barrio`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,58,35,0.28) 0%, rgba(15,58,35,0) 30%), linear-gradient(0deg, rgba(8,20,13,0.90) 3%, rgba(8,20,13,0.34) 42%, rgba(8,20,13,0) 70%)",
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#1A5C38]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      )}

      <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-11 pt-28 md:px-8 md:pb-16">
        {/* Breadcrumb sutil */}
        <nav aria-label="breadcrumb" className="mb-5">
          <Link
            href="/barrios-privados"
            className="text-[12px] font-medium text-white/70 transition-colors hover:text-white"
            style={{ fontFamily: P }}
          >
            ← Barrios privados
          </Link>
        </nav>

        {/* Badge tier + zona */}
        <span
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm"
          style={{ fontFamily: P }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8CF0B4]" aria-hidden />
          {barrio.tier} · Funes
        </span>

        {/* Nombre */}
        <h1
          className="mb-2 mt-4 text-[2.6rem] leading-[0.98] text-white md:text-[4.4rem]"
          style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.02em", textWrap: "balance" }}
        >
          {barrio.nombre}
        </h1>
        {barrio.subtitulo && (
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-white/90 md:text-[17px]" style={{ fontFamily: P }}>
            {barrio.subtitulo}
          </p>
        )}

        {/* Stats con separadores finos blancos */}
        {stats.length > 0 && (
          <dl className="mt-7 flex flex-wrap items-stretch border-t border-white/25 pt-1">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col py-3 pr-6 md:pr-8 ${
                  i > 0 ? "border-l border-white/15 pl-6 md:pl-8" : ""
                }`}
              >
                <dd
                  className="text-lg text-white md:text-[22px]"
                  style={{ fontFamily: P, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                >
                  {s.valor}
                </dd>
                <dt
                  className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70"
                  style={{ fontFamily: P }}
                >
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
