"use client";

// State compartido del HUB: búsqueda, filtros de amenities y orden.
// Lo consumen HeroSearchBar (input/chips), FiltrosAmenities (chips toggle) y
// GrillaBarrios (renderiza el subset filtrado y ordenado).
//
// Sin URL params para no fragmentar SEO — todo client-side.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AmenityHubId } from "@/lib/barrios";

export type OrdenHub = "tier" | "escala" | "nuevos" | "alfabetico";

export const ORDEN_OPCIONES: { id: OrdenHub; label: string }[] = [
  { id: "tier",       label: "Por tier" },
  { id: "escala",     label: "Por escala (lotes)" },
  { id: "nuevos",     label: "Más nuevos primero" },
  { id: "alfabetico", label: "Alfabético" },
];

interface BarriosHubCtx {
  search: string;
  setSearch: (s: string) => void;
  amenities: Set<AmenityHubId>;
  toggleAmenity: (a: AmenityHubId) => void;
  orden: OrdenHub;
  setOrden: (o: OrdenHub) => void;
}

const Ctx = createContext<BarriosHubCtx | null>(null);

export function BarriosHubProvider({ children }: { children: ReactNode }) {
  const [search, setSearch]       = useState<string>("");
  const [amenities, setAmenities] = useState<Set<AmenityHubId>>(() => new Set());
  const [orden, setOrden]         = useState<OrdenHub>("tier");

  const toggleAmenity = (a: AmenityHubId) => {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  const value = useMemo<BarriosHubCtx>(
    () => ({ search, setSearch, amenities, toggleAmenity, orden, setOrden }),
    [search, amenities, orden]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBarriosHub(): BarriosHubCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBarriosHub debe usarse dentro de BarriosHubProvider");
  return v;
}
