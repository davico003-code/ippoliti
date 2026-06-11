import Image from "next/image";
import Link from "next/link";
import type { Barrio } from "@/lib/barrios";

// Hero a pantalla casi completa: portada 01.webp + overlay verde oscuro,
// breadcrumb, badge tier, nombre y fila de stats con separadores dorados.
// Fallback sin foto: fondo verde con patrón sutil (barrios sin assets).

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
    <section className="relative flex min-h-[60vh] flex-col justify-end overflow-hidden md:min-h-[70vh]">
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
                "linear-gradient(to top, rgba(15,63,38,0.92) 0%, rgba(15,63,38,0.62) 28%, rgba(15,63,38,0.18) 55%, transparent 80%)",
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

      <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-10 pt-32 md:px-10 md:pb-14">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <Link
            href="/barrios-privados"
            className="text-[12px] font-medium text-white/75 transition-colors hover:text-white"
            style={{ fontFamily: P }}
          >
            Barrios cerrados
          </Link>
          <span className="mx-2 text-[12px] text-white/50">/</span>
          <span className="text-[12px] font-medium text-white" style={{ fontFamily: P }}>
            {barrio.nombre}
          </span>
        </nav>

        {/* Badge tier + zona */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A5C38]"
            style={{ fontFamily: P }}
          >
            {barrio.tier}
          </span>
          <span
            className="rounded-full border border-white/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
            style={{ fontFamily: P }}
          >
            Funes
          </span>
        </div>

        {/* Nombre */}
        <h1
          className="mb-2 text-4xl leading-[1.05] text-white md:text-6xl"
          style={{ fontFamily: R, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {barrio.nombre}
        </h1>
        {barrio.subtitulo && (
          <p className="mb-6 max-w-xl text-[15px] leading-relaxed text-white/85" style={{ fontFamily: P }}>
            {barrio.subtitulo}
          </p>
        )}

        {/* Stats con separadores dorados */}
        {stats.length > 0 && (
          <dl className="mt-6 flex flex-wrap items-stretch gap-y-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col pr-5 md:pr-8 ${
                  i > 0 ? "border-l border-[#B8935A]/70 pl-5 md:pl-8" : ""
                }`}
              >
                <dd
                  className="text-xl text-white md:text-[26px]"
                  style={{ fontFamily: P, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                >
                  {s.valor}
                </dd>
                <dt
                  className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B8935A]"
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
