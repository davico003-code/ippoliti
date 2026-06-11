import type { Barrio } from "@/lib/barrios";
import { INTRO_EDITORIAL } from "./intro-editorial";
import {
  Flag,
  Trophy,
  CircleDot,
  Square,
  Waves,
  Droplet,
  Droplets,
  Sun,
  Home,
  UtensilsCrossed,
  Dumbbell,
  Baby,
  Tent,
  Shield,
  Zap,
  Flame,
  Trees,
  Bike,
  Briefcase,
  Sailboat,
  Anchor,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

// Intro editorial (storytelling de broker) + chips de amenities destacados.
// Reemplaza las listas largas de Amenities / Infraestructura / Seguridad.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

// Registro de íconos lucide usados por barrio.amenities[].icon (lib/barrios ICON).
// Fallback CheckCircle2 para nombres no mapeados (ej. "Pipe", que no existe en lucide).
const ICONOS: Record<string, LucideIcon> = {
  Flag,
  Trophy,
  CircleDot,
  Square,
  Waves,
  Droplet,
  Droplets,
  Sun,
  Home,
  UtensilsCrossed,
  Dumbbell,
  Baby,
  Tent,
  Shield,
  Zap,
  Flame,
  Trees,
  Bike,
  Briefcase,
  Sailboat,
  Anchor,
};

const MAX_CHIPS = 6;

export default function DetalleIntro({ barrio }: { barrio: Barrio }) {
  const editorial = INTRO_EDITORIAL[barrio.slug];
  const titulo = editorial?.titulo ?? barrio.miradaBroker.titular;
  const parrafos = editorial?.parrafos ?? [barrio.miradaBroker.parrafo];
  const chips = barrio.amenities.slice(0, MAX_CHIPS);

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[840px] px-6 md:px-10">
        <h2
          className="mb-6 text-2xl text-[#0a0a0a] md:text-[32px] md:leading-[1.15]"
          style={{ fontFamily: R, fontWeight: 800, letterSpacing: "-0.015em" }}
        >
          {titulo}
        </h2>

        <div className="space-y-4">
          {parrafos.map((p, i) => (
            <p
              key={i}
              className="text-[15px] leading-[1.75] text-[#3a3a3a] md:text-base"
              style={{ fontFamily: P }}
            >
              {p}
            </p>
          ))}
        </div>

        {chips.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {chips.map((a) => {
              const Icono = ICONOS[a.icon] ?? CheckCircle2;
              return (
                <li
                  key={a.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e8e2d5] bg-[#FAF7F2] px-4 py-2"
                >
                  <Icono size={15} strokeWidth={2} className="shrink-0 text-[#1A5C38]" aria-hidden />
                  <span
                    className="text-[13px] font-medium text-[#0a0a0a]"
                    style={{ fontFamily: P }}
                  >
                    {a.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
