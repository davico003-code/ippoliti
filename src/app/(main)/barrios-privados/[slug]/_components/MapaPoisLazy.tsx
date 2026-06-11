"use client";

// Wrapper client mínimo que dynamic-importa el mapa Leaflet de la ficha.
// Mismo patrón que MapaBarriosLazy del hub: dynamic ssr:false desde un
// Server Component no code-splittea en Next 14.

import dynamic from "next/dynamic";

const MapaPoisClient = dynamic(() => import("./MapaPoisClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#f0ece2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#777",
        fontSize: 13,
        fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
      }}
    >
      Cargando mapa…
    </div>
  ),
});

export default function MapaPoisLazy(props: { lat: number; lng: number; nombre: string }) {
  return <MapaPoisClient {...props} />;
}
