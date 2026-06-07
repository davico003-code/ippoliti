"use client";

// Wrapper client mínimo que dynamic-importa el mapa Leaflet.
// Debe ser Client Component: en Next 14, dynamic(..., { ssr: false }) llamado
// desde un Server Component (como MapaBarrios) NO code-splittea — leaflet
// terminaba en el First Load JS de /barrios-privados.

import dynamic from "next/dynamic";

const MapaBarriosClient = dynamic(() => import("./MapaBarriosClient"), {
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

export default function MapaBarriosLazy() {
  return <MapaBarriosClient />;
}
