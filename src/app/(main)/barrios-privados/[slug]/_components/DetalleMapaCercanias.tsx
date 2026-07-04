import { MapPin, Navigation, Clock } from "lucide-react";
import type { Barrio } from "@/lib/barrios";
import { cercaniasPorCategoria, formatKm, POI_CATEGORIA_META, type PoiCategoria } from "@/data/pois-funes";
import MapaPoisLazy from "./MapaPoisLazy";

// Sección "Mapa y cercanías": card compacta de dirección/accesos (la misma
// info que la ficha anterior), mapa Leaflet con el barrio + 22 POIs, y lista
// de los 2 POIs más cercanos por categoría con distancia haversine.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

export default function DetalleMapaCercanias({
  barrio,
  lat,
  lng,
}: {
  barrio: Barrio;
  lat: number;
  lng: number;
}) {
  const u = barrio.ubicacion;
  const cercanias = cercaniasPorCategoria(lat, lng);
  const categorias = Object.keys(POI_CATEGORIA_META) as PoiCategoria[];

  return (
    <section id="ubicacion" className="scroll-mt-28 bg-white py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]"
          style={{ fontFamily: P }}
        >
          Cómo llegar
        </span>
        <h2
          className="mb-7 mt-2 text-[1.5rem] leading-[1.15] text-[#0E1A14] md:text-[2rem]"
          style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Ubicación y cercanías
        </h2>

        {/* Card compacta: dirección de ingreso + accesos + distancia */}
        {(u.direccionIngreso || u.accesos.length > 0 || u.distanciaCentroRosarioMin) && (
          <div className="mb-6 flex flex-wrap gap-x-10 gap-y-4 rounded-xl border border-black/10 bg-white p-5 md:p-6">
            {(u.direccionIngreso || u.referencia) && (
              <div className="flex items-start gap-2.5">
                <MapPin size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#1A5C38]" aria-hidden />
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#00754A]" style={{ fontFamily: P }}>
                    Dirección de ingreso
                  </div>
                  <div className="text-sm font-medium text-[#0a0a0a]" style={{ fontFamily: P }}>
                    {u.direccionIngreso ?? u.referencia}
                  </div>
                  {u.direccionIngreso && u.referencia && (
                    <div className="mt-0.5 text-[13px] text-[#777]" style={{ fontFamily: P }}>
                      {u.referencia}
                    </div>
                  )}
                </div>
              </div>
            )}

            {u.accesos.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Navigation size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#1A5C38]" aria-hidden />
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#00754A]" style={{ fontFamily: P }}>
                    Accesos
                  </div>
                  <div className="text-sm text-[#0a0a0a]" style={{ fontFamily: P }}>
                    {u.accesos.join(" · ")}
                  </div>
                </div>
              </div>
            )}

            {typeof u.distanciaCentroRosarioMin === "number" && (
              <div className="flex items-start gap-2.5">
                <Clock size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#1A5C38]" aria-hidden />
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#00754A]" style={{ fontFamily: P }}>
                    A Rosario centro
                  </div>
                  <div className="text-sm font-medium text-[#0a0a0a]" style={{ fontFamily: P, fontVariantNumeric: "tabular-nums" }}>
                    {u.distanciaCentroRosarioMin} min en auto
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Mapa */}
          <div className="h-[380px] overflow-hidden rounded-xl border border-black/10 md:h-[480px]">
            <MapaPoisLazy lat={lat} lng={lng} nombre={barrio.nombre} />
          </div>

          {/* Cercanías por categoría */}
          <div className="rounded-xl border border-black/10 bg-white p-5 md:p-6">
            <h3
              className="mb-4 text-base text-[#0a0a0a]"
              style={{ fontFamily: R, fontWeight: 700 }}
            >
              Cercanías
            </h3>
            <div className="space-y-4">
              {categorias.map((cat) => {
                const pois = cercanias[cat];
                if (!pois || pois.length === 0) return null;
                const meta = POI_CATEGORIA_META[cat];
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: meta.color }}
                      />
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#777]"
                        style={{ fontFamily: P }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <ul className="space-y-1 pl-[18px]">
                      {pois.map((poi) => (
                        <li
                          key={poi.nombre}
                          className="flex items-baseline justify-between gap-3 text-[13.5px] text-[#0a0a0a]"
                          style={{ fontFamily: P }}
                        >
                          <span className="leading-snug">{poi.nombre}</span>
                          <span
                            className="shrink-0 text-[12.5px] font-semibold text-[#1A5C38]"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            a {formatKm(poi.km)} km
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
