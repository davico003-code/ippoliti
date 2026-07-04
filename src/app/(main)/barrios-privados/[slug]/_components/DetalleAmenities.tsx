import type { Barrio } from "@/lib/barrios";
import {
  Flag, Trophy, CircleDot, Square, Waves, Droplet, Droplets, Sun, Home,
  UtensilsCrossed, Dumbbell, Baby, Tent, Shield, Zap, Flame, Trees, Bike,
  Briefcase, Sailboat, Anchor, CheckCircle2, type LucideIcon,
} from "lucide-react";

// Amenities y espacios comunes: chips blancos con ícono verde. Reemplaza las
// listas largas de Amenities / Infraestructura / Seguridad de la ficha anterior.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

const ICONOS: Record<string, LucideIcon> = {
  Flag, Trophy, CircleDot, Square, Waves, Droplet, Droplets, Sun, Home,
  UtensilsCrossed, Dumbbell, Baby, Tent, Shield, Zap, Flame, Trees, Bike,
  Briefcase, Sailboat, Anchor,
};

const MAX_CHIPS = 12;

export default function DetalleAmenities({ barrio }: { barrio: Barrio }) {
  const chips = barrio.amenities.slice(0, MAX_CHIPS);
  if (chips.length === 0) return null;

  return (
    <section id="amenities" className="scroll-mt-28 bg-white py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]"
          style={{ fontFamily: P }}
        >
          Lo que incluye
        </span>
        <h2
          className="mb-7 mt-2 text-[1.5rem] leading-[1.15] text-[#0E1A14] md:text-[2rem]"
          style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Amenities y espacios comunes
        </h2>

        <ul className="flex flex-wrap gap-2.5">
          {chips.map((a) => {
            const Icono = ICONOS[a.icon] ?? CheckCircle2;
            return (
              <li
                key={a.id}
                className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-4 py-2.5"
              >
                <Icono size={15} strokeWidth={2} className="shrink-0 text-[#00754A]" aria-hidden />
                <span className="text-[14px] font-medium text-[#0E1A14]" style={{ fontFamily: P }}>
                  {a.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
